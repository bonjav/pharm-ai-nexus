
import { Bill, Customer } from '../services/mockData';
import { format } from 'date-fns';

export const generateInvoiceNumber = (billId: string): string => {
  // Create a formatted invoice number based on bill ID
  const prefix = 'INV';
  const dateCode = format(new Date(), 'yyyyMMdd');
  const billNumber = billId.replace(/\D/g, '');
  return `${prefix}-${dateCode}-${billNumber.padStart(4, '0')}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const calculateDueDate = (invoiceDate: Date): string => {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days
  return format(dueDate, 'yyyy-MM-dd');
};

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerDetails: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    tax: number;
    discount: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: string;
}

export const prepareInvoiceData = (bill: Bill, customer: Customer): InvoiceData => {
  const invoiceDate = new Date(bill.date);
  
  return {
    invoiceNumber: generateInvoiceNumber(bill.id),
    invoiceDate: format(invoiceDate, 'yyyy-MM-dd'),
    dueDate: calculateDueDate(invoiceDate),
    customerDetails: {
      name: customer.name,
      address: customer.address,
      email: customer.email,
      phone: customer.phone,
    },
    items: bill.items.map(item => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price,
      tax: item.tax,
      discount: item.discount,
      total: item.total,
    })),
    subtotal: bill.subtotal,
    tax: bill.tax,
    discount: bill.discount,
    total: bill.total,
    paymentMethod: bill.paymentMethod,
    status: bill.status,
  };
};
