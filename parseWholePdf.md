


Get Outlook for iOS
From: Aneesh Kulkarni <aneesh.kulkarni92@gmail.com>
Sent: Friday, December 5, 2025 12:34:25 AM
To: aneesh.kulkarni@hotmail.com <aneesh.kulkarni@hotmail.com>
Subject: Read large structured pdfs in scala fast
 
Reading large structured PDFs fast in Scala requires a combination of efficient memory management (to avoid OutOfMemoryError) and parallelism (to maximize CPU usage).

The most effective approach is to combine Apache PDFBox (for parsing) with FS2 or Akka Streams (for concurrency). While purely functional libraries like fs2-pdf exist, PDFBox remains the most robust for "structured" content (forms, metadata) and offers critical memory optimization settings.

The Recommended Stack
Parser: Apache PDFBox (Java)
Why: Industry standard, handles "AcroForms" (structured forms) natively, and allows offloading memory to disk.
Concurrency: FS2 (Functional Streams for Scala)
Why: Handles backpressure and allows you to process pages in parallel (parEvalMap) without manual thread management.
Table Extraction: Tabula-Java
Why: If your "structure" implies tables, PDFBox struggles. Tabula is the best JVM wrapper for this.
1. Strategy for "Large" & "Fast"
To handle large files fast without crashing the JVM:

Offload to Disk: Never load the entire PDF into RAM. Use PDFBox's MemoryUsageSetting.setupTempFileOnly().
Lazy Loading: Do not iterate the whole document object tree. Iterate pages by index.
Parallelism: PDFs are page-based. You can extract data from Page 1, Page 50, and Page 100 simultaneously.
2. Implementation (Scala + FS2 + PDFBox)
Here is a complete, compile-ready logic example using Scala 3, FS2, and PDFBox. This pipeline reads a large PDF, streams page indices, and extracts structured form data in parallel.

Dependencies (build.sbt):

libraryDependencies ++= Seq(
  "org.apache.pdfbox" % "pdfbox" % "2.0.30", // or 3.0.x
  "co.fs2" %% "fs2-core" % "3.9.3",
  "co.fs2" %% "fs2-io" % "3.9.3"
)
The Optimized Extraction Code:

import org.apache.pdfbox.pdmodel.{PDDocument, PDPage}
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm
import org.apache.pdfbox.io.MemoryUsageSetting
import cats.effect.{IO, IOApp, Resource}
import cats.syntax.all._
import fs2.Stream
import java.io.File
import scala.jdk.CollectionConverters._

object PdfExtractor extends IOApp.Simple {

  case class FormField(name: String, value: String)
  case class PageData(pageIndex: Int, text: String, fields: List[FormField])

  // 1. Safe Resource Management
  def loadPdf(file: File): Resource[IO, PDDocument] = {
    Resource.fromAutoCloseable(IO.blocking {
      // CRITICAL: Uses a temp file instead of Main Memory. 
      // This allows processing multi-gigabyte PDFs with low RAM.
      PDDocument.load(file, MemoryUsageSetting.setupTempFileOnly())
    })
  }

  // 2. The Extraction Logic (runs on a worker thread)
  def extractFromPage(doc: PDDocument, pageIndex: Int): IO[PageData] = IO.blocking {
    // PDFBox pages are 0-indexed
    val page = doc.getPage(pageIndex)
    
    // Example: Extract Form Data (AcroForms)
    // Note: AcroForms are usually document-wide, but widgets attach to pages.
    // This logic assumes you want to map fields found on this specific page widget.
    val acroForm = doc.getDocumentCatalog.getAcroForm
    val pageFields = if (acroForm != null) {
      // Get annotations for this page and filter for Widgets (form fields)
      page.getAnnotations.asScala
        .filter(_.getSubtype == "Widget")
        .flatMap { annotation =>
          // Reverse lookup field by annotation (simplified logic)
          Option(annotation.getCOSObject.getString("T")).map { name =>
            val field = acroForm.getField(name)
            FormField(name, Option(field.getValueAsString).getOrElse(""))
          }
        }.toList
    } else List.empty

    // Example: Extract Text (simplified)
    // For heavy text extraction, create a PDFTextStripper per page here
    val textSnippet = s"Text from page $pageIndex..." 

    PageData(pageIndex, textSnippet, pageFields)
  }

  def run: IO[Unit] = {
    val largePdf = new File("large_data.pdf")

    Stream.resource(loadPdf(largePdf))
      .flatMap { doc =>
        val totalPages = doc.getNumberOfPages
        
        // 3. Create a Stream of Page Indices
        Stream.range(0, totalPages)
          .covary[IO]
          // 4. Parallel Processing: Process 4 pages at once
          .parEvalMap(maxConcurrent = 4)(index => extractFromPage(doc, index))
      }
      .map { data =>
        println(s"Processed Page ${data.pageIndex}: Found ${data.fields.size} fields.")
      }
      .compile
      .drain
  }
}
3. Handling Specific Structures
A. Structured Forms (AcroForms)
The example above handles this. If your PDF is a standard fillable form, pdDocument.getDocumentCatalog.getAcroForm is the fastest way to get data. It is a simple Map lookup (Key -> Value).

B. Tables (Tabular Data)
PDFBox does not understand tables; it only sees lines and text at coordinates. For tables, you must use Tabula.

Tip: Do not write your own table parser using PDFBox unless you enjoy suffering. Use tabula-java.
Integration: You can wrap Tabula in the extractFromPage function above.
<!-- end list -->

import technology.tabula.ObjectExtractor
import technology.tabula.extractors.SpreadsheetExtractionAlgorithm

def extractTable(doc: PDDocument, pageIndex: Int): IO[List[List[String]]] = IO.blocking {
  val extractor = new ObjectExtractor(doc)
  val page = extractor.extract(pageIndex + 1) // Tabula is 1-indexed
  
  // Basic spreadsheet algorithm detection
  val bea = new SpreadsheetExtractionAlgorithm()
  val tables = bea.extract(page)
  
  tables.asScala.flatMap { table =>
    table.getRows.asScala.map { row =>
      row.asScala.map(_.getText).toList
    }
  }.toList
}
4. Summary of "Fast" Optimizations
Optimization	Method	Impact
Low RAM	MemoryUsageSetting.setupTempFileOnly()	Enables reading 1GB+ files on 512MB heap.
Parallelism	fs2.parEvalMap	Uses all CPU cores. Parsing is CPU heavy.
Parsing	AcroForm vs TextStripper	Reading Form Fields is O(1) (instant). Stripping text is O(N) (slower).
Lazy IO	Stream.range	Only loads the pages requested, allowing you to stop early.
Next Step
Would you like a specific snippet for extracting tabular data specifically using the Tabula integration, or are you primarily focused on form fields/metadata?

