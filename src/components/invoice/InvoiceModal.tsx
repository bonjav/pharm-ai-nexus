
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Printer, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Invoice } from './Invoice';
import { InvoiceData } from '../../utils/invoiceUtils';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoiceData }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoiceData?.invoiceNumber || 'Template'}`,
    content: () => invoiceRef.current,
    onAfterPrint: () => console.log('Printed successfully'),
    onPrintError: (error) => console.error('Print failed:', error),
  });
  
  if (!invoiceData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Invoice #{invoiceData.invoiceNumber}</DialogTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={handlePrint}
              className="bg-pharma-primary hover:bg-pharma-primary/90 flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="flex items-center"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4 border rounded-md overflow-hidden bg-white">
          <Invoice ref={invoiceRef} data={invoiceData} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
