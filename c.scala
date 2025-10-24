import java.io.{InputStream, FileOutputStream}
import java.nio.file.{Files, Path, Paths, StandardOpenOption}
import java.util.concurrent._
import java.util.zip.ZipFile
import scala.jdk.CollectionConverters._

// Abstraction: how to process an entry's streamed bytes
trait EntryProcessor {
  def process(pathInZip: String, in: InputStream): Unit
}

// Example processor: write entry to disk mirroring zip structure
class WriteToDiskProcessor(root: Path, bufferSize: Int) extends EntryProcessor {
  override def process(pathInZip: String, in: InputStream): Unit = {
    val target = root.resolve(pathInZip)
    val parent = target.getParent
    if (parent != null) Files.createDirectories(parent)

    val out = Files.newOutputStream(
      target,
      StandardOpenOption.CREATE,
      StandardOpenOption.TRUNCATE_EXISTING,
      StandardOpenOption.WRITE
    )

    val buf = new Array[Byte](bufferSize)
    try {
      var read = in.read(buf)
      while (read != -1) {
        out.write(buf, 0, read)
        read = in.read(buf)
      }
    } finally {
      try out.close() catch { case _: Throwable => () }
      try in.close() catch { case _: Throwable => () }
    }
  }
}

// Task manager for zip/entry submission with bounded concurrency
class ZipTaskManager(
    processor: EntryProcessor,
    maxThreads: Int,
    maxInFlightEntries: Int
) {
  private val executor: ExecutorService = new ThreadPoolExecutor(
    maxThreads,                  // core
    maxThreads,                  // max
    60L, TimeUnit.SECONDS,       // keep-alive
    new LinkedBlockingQueue[Runnable](maxInFlightEntries * 2), // guard against runaway submission
    new ThreadFactory {
      private val group = new ThreadGroup("zip-extractor")
      private val count = new java.util.concurrent.atomic.AtomicInteger(1)
      override def newThread(r: Runnable): Thread = {
        val t = new Thread(group, r, s"worker-${count.getAndIncrement()}", 0)
        t.setDaemon(false)
        t
      }
    },
    new ThreadPoolExecutor.CallerRunsPolicy // backpressure: caller executes when queue is full
  )

  private val entrySemaphore = new Semaphore(maxInFlightEntries) // global bound on entry tasks

  def submitZip(zipPath: Path): Future[Unit] = {
    val promise = new CompletableFuture[Unit]()
    executor.execute(new Runnable {
      override def run(): Unit = {
        var zip: ZipFile = null
        try {
          zip = new ZipFile(zipPath.toFile)
          val entries = zip.entries().asScala

          // Track per-zip entry tasks with a CountDownLatch
          val entryCount = entries.count(e => !e.isDirectory)
          val latch = new CountDownLatch(entryCount)

          entries.foreach { entry =>
            if (!entry.isDirectory) {
              // Backpressure: block until a permit is available
              entrySemaphore.acquire()

              executor.execute(new Runnable {
                override def run(): Unit = {
                  try {
                    val in = zip.getInputStream(entry)
                    processor.process(entry.getName, in)
                  } catch {
                    case ex: Throwable =>
                      // Log or collect errors; here we rethrow to surface
                      // You could use a concurrent error queue if needed.
                      ex.printStackTrace()
                  } finally {
                    latch.countDown()
                    entrySemaphore.release()
                  }
                }
              })
            }
          }

          // Wait for all entries of this zip to finish
          latch.await()
          promise.complete(())
        } catch {
          case ex: Throwable =>
            promise.completeExceptionally(ex)
        } finally {
          if (zip != null) try zip.close() catch { case _: Throwable => () }
        }
      }
    })
    // Convert CompletableFuture[Unit] to Scala Future via Java interop
    val p = new scala.concurrent.Promise[Unit]()
    promise.whenComplete((_, err) => {
      if (err == null) p.success(()) else p.failure(err)
    })
    p.future
  }

  def shutdownAndAwait(timeout: Long, unit: TimeUnit): Boolean = {
    executor.shutdown()
    executor.awaitTermination(timeout, unit)
  }
}

// App wiring: enumerate zips, submit, wait
object MassiveZipExtractor extends App {
  import scala.concurrent.{Await, Future}
  import scala.concurrent.duration._
  import scala.concurrent.ExecutionContext.Implicits.global

  // Configure
  val inputRoot   = Paths.get("/data/zips")
  val outputRoot  = Paths.get("/data/extracted")
  val bufferSize  = 128 * 1024          // bytes per read
  val maxThreads  = Runtime.getRuntime.availableProcessors() * 2 // tune for I/O vs CPU
  val maxInFlight = 4096                // global cap on concurrent entry tasks

  val processor = new WriteToDiskProcessor(outputRoot, bufferSize)
  val manager   = new ZipTaskManager(processor, maxThreads, maxInFlight)

  // Enumerate zip files lazily (avoid loading into memory)
  def enumerateZips(root: Path): Iterator[Path] = {
    Files.walk(root).iterator().asScala.filter(p => p.toString.endsWith(".zip"))
  }

  // Submit all zips
  val futures = enumerateZips(inputRoot).map(manager.submitZip).toSeq

  // Wait for completion of all zips
  Await.result(Future.sequence(futures), Duration.Inf)

  // Clean shutdown
  manager.shutdownAndAwait(10, TimeUnit.MINUTES)

  println("All zips processed.")
}
