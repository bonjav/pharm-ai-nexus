
import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { InvoiceData, formatCurrency } from '../../utils/invoiceUtils';
import { Package } from 'lucide-react';

interface InvoiceProps {
  data: InvoiceData;
}

// Using forwardRef to allow this component to be used with react-to-print
export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ data }, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto" id="invoice-content">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-pharma-primary text-white p-1.5 rounded">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-pharma-dark">Dysla PharmaAssist</h1>
          </div>
          <p className="text-sm text-gray-500">123 Pharmacy Street</p>
          <p className="text-sm text-gray-500">Healthtown, HT 12345</p>
          <p className="text-sm text-gray-500">contact@dyslapharma.com</p>
          <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-pharma-dark">INVOICE</h2>
          <p className="text-md font-semibold">{data.invoiceNumber}</p>
          <p className="text-sm text-gray-500 mt-2">Date: {data.invoiceDate}</p>
          <p className="text-sm text-gray-500">Due Date: {data.dueDate}</p>
          <div className="mt-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              data.status === 'paid' 
                ? 'bg-green-100 text-green-700'
                : data.status === 'pending' 
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {data.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-md font-semibold mb-2 text-gray-700 border-b pb-1">Customer Details</h3>
        <p className="font-medium">{data.customerDetails.name}</p>
        <p className="text-sm text-gray-600">{data.customerDetails.address}</p>
        <p className="text-sm text-gray-600">{data.customerDetails.email}</p>
        <p className="text-sm text-gray-600">{data.customerDetails.phone}</p>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border text-left">Product</th>
              <th className="py-2 px-4 border text-right">Qty</th>
              <th className="py-2 px-4 border text-right">Price</th>
              <th className="py-2 px-4 border text-right">Tax</th>
              <th className="py-2 px-4 border text-right">Discount</th>
              <th className="py-2 px-4 border text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4 border">{item.name}</td>
                <td className="py-2 px-4 border text-right">{item.quantity}</td>
                <td className="py-2 px-4 border text-right">{formatCurrency(item.price)}</td>
                <td className="py-2 px-4 border text-right">{formatCurrency(item.tax)}</td>
                <td className="py-2 px-4 border text-right">{formatCurrency(item.discount)}</td>
                <td className="py-2 px-4 border text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Tax:</span>
            <span>{formatCurrency(data.tax)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Discount:</span>
            <span>{formatCurrency(data.discount)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold border-t border-gray-300 mt-1">
            <span>Total:</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-8">
        <h3 className="text-md font-semibold mb-2 text-gray-700">Payment Method</h3>
        <p>{data.paymentMethod}</p>
      </div>

      {/* Thank You Note */}
      <div className="text-center text-gray-600 mt-12">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';

export default Invoice;
