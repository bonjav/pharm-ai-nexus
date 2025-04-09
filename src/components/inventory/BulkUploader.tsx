
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Download, Upload, FileSpreadsheet, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export const BulkUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'processing'>('idle');
  const [uploadSummary, setUploadSummary] = useState({ total: 0, success: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus('idle');
      setProgress(0);
    }
  };
  
  const handleDownloadTemplate = () => {
    // In a real app, this would download an actual Excel template
    // For now, we'll just show a toast message
    
    toast({
      title: "Template Downloaded",
      description: "Product import template has been downloaded to your downloads folder."
    });
    
    // Simulating download with a dummy anchor element
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'product_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleUpload = () => {
    if (!file) return;
    
    setUploading(true);
    setUploadStatus('processing');
    
    // Simulate upload process with progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploading(false);
        
        // Simulate processing completion
        setTimeout(() => {
          // Mock a successful upload with some failed rows
          setUploadStatus('success');
          setUploadSummary({
            total: 50,
            success: 47,
            failed: 3
          });
          
          toast({
            title: "Upload Complete",
            description: "47 products imported successfully, 3 failed."
          });
        }, 500);
      }
    }, 100);
  };
  
  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setUploadStatus('idle');
    setUploadSummary({ total: 0, success: 0, failed: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium">Step 1: Download Template</h3>
        <p className="text-sm text-muted-foreground">
          Download our Excel template with the required product fields.
        </p>
        <Button 
          variant="outline" 
          onClick={handleDownloadTemplate}
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>
      
      <Separator />
      
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium">Step 2: Fill in Your Product Data</h3>
        <p className="text-sm text-muted-foreground">
          Add your products to the template. Required fields: Name, Category, Batch No., Stock, Price, Expiry Date.
        </p>
      </div>
      
      <Separator />
      
      <div className="flex flex-col space-y-4">
        <h3 className="text-sm font-medium">Step 3: Upload File</h3>
        
        <div className="grid gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
          />
          
          {file && !uploading && uploadStatus === 'idle' && (
            <div className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-blue-500" />
              <span>{file.name}</span>
              <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
          
          {uploadStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Import Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                Imported {uploadSummary.success} of {uploadSummary.total} products successfully.
                {uploadSummary.failed > 0 && (
                  <span> {uploadSummary.failed} products failed validation.</span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {uploadStatus === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Upload Failed</AlertTitle>
              <AlertDescription>
                There was an error processing your file. Please check the format and try again.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end space-x-2 pt-2">
            {uploadStatus === 'success' || uploadStatus === 'error' ? (
              <Button onClick={resetUpload}>
                Upload Another File
              </Button>
            ) : (
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading} 
                className="bg-pharma-primary hover:bg-pharma-primary/90"
              >
                {uploading ? 'Importing...' : 'Import Products'}
                {!uploading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
