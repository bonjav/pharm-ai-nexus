
// Types
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  batchNo: string;
  expiryDate: string;
  stock: number;
  price: number;
  manufacturer: string;
  location: string;
  reorderLevel: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface BillingItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  items: BillingItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  date: string;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'cancelled';
}

// Dashboard Mock Data
export const salesData = [
  { month: 'Jan', sales: 12000 },
  { month: 'Feb', sales: 14000 },
  { month: 'Mar', sales: 18000 },
  { month: 'Apr', sales: 16000 },
  { month: 'May', sales: 21000 },
  { month: 'Jun', sales: 19000 },
  { month: 'Jul', sales: 23000 },
  { month: 'Aug', sales: 25000 },
  { month: 'Sep', sales: 22000 },
  { month: 'Oct', sales: 27000 },
  { month: 'Nov', sales: 26000 },
  { month: 'Dec', sales: 32000 },
];

export const categoryData = [
  { name: 'Antibiotics', value: 25 },
  { name: 'Pain Relief', value: 18 },
  { name: 'Vitamins', value: 15 },
  { name: 'Cardiovascular', value: 12 },
  { name: 'Gastrointestinal', value: 10 },
  { name: 'Others', value: 20 },
];

// Products Mock Data
export const products: Product[] = [
  {
    id: '1',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    description: 'Antibiotic for bacterial infections',
    batchNo: 'AM5001',
    expiryDate: '2026-03-15',
    stock: 120,
    price: 12.99,
    manufacturer: 'Pharma Labs Inc.',
    location: 'Shelf A-12',
    reorderLevel: 30,
  },
  {
    id: '2',
    name: 'Paracetamol 500mg',
    category: 'Pain Relief',
    description: 'Pain reliever and fever reducer',
    batchNo: 'PC5002',
    expiryDate: '2025-05-22',
    stock: 210,
    price: 5.49,
    manufacturer: 'MediCorp',
    location: 'Shelf B-05',
    reorderLevel: 50,
  },
  {
    id: '3',
    name: 'Cetirizine 10mg',
    category: 'Allergy',
    description: 'Antihistamine for allergies',
    batchNo: 'CT1003',
    expiryDate: '2025-11-30',
    stock: 8,
    price: 8.99,
    manufacturer: 'AllergyCare',
    location: 'Shelf C-03',
    reorderLevel: 20,
  },
  {
    id: '4',
    name: 'Metformin 850mg',
    category: 'Diabetes',
    description: 'Oral antidiabetic medication',
    batchNo: 'MT8501',
    expiryDate: '2025-04-16',
    stock: 75,
    price: 15.79,
    manufacturer: 'DiabeCare',
    location: 'Shelf D-09',
    reorderLevel: 25,
  },
  {
    id: '5',
    name: 'Atorvastatin 20mg',
    category: 'Cardiovascular',
    description: 'Cholesterol-lowering medication',
    batchNo: 'AT2001',
    expiryDate: '2025-08-01',
    stock: 65,
    price: 22.50,
    manufacturer: 'HeartHealth Inc.',
    location: 'Shelf E-02',
    reorderLevel: 20,
  },
  {
    id: '6',
    name: 'Omeprazole 20mg',
    category: 'Gastrointestinal',
    description: 'Proton pump inhibitor',
    batchNo: 'OM2001',
    expiryDate: '2025-02-28',
    stock: 45,
    price: 18.25,
    manufacturer: 'GastroPharm',
    location: 'Shelf F-04',
    reorderLevel: 15,
  },
  {
    id: '7',
    name: 'Vitamin D3 1000IU',
    category: 'Vitamins',
    description: 'Vitamin D supplement',
    batchNo: 'VD1001',
    expiryDate: '2026-12-10',
    stock: 180,
    price: 9.99,
    manufacturer: 'VitaLife',
    location: 'Shelf G-01',
    reorderLevel: 40,
  },
  {
    id: '8',
    name: 'Aspirin 75mg',
    category: 'Cardiovascular',
    description: 'Anti-platelet medication',
    batchNo: 'AS7501',
    expiryDate: '2026-01-15',
    stock: 15,
    price: 6.49,
    manufacturer: 'HeartHealth Inc.',
    location: 'Shelf E-03',
    reorderLevel: 30,
  },
];

// Customers Mock Data
export const customers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '555-123-4567',
    address: '123 Main St, Anytown, ST 12345',
  },
  {
    id: '2',
    name: 'Emma Johnson',
    email: 'emma.johnson@email.com',
    phone: '555-987-6543',
    address: '456 Oak Ave, Somewhere, ST 67890',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '555-456-7890',
    address: '789 Pine Rd, Nowhere, ST 34567',
  }
];

// Bills Mock Data
export const bills: Bill[] = [
  {
    id: 'B001',
    customerId: '1',
    customerName: 'John Smith',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Amoxicillin 500mg',
        quantity: 2,
        price: 12.99,
        discount: 0,
        tax: 1.82,
        total: 27.80,
      },
      {
        id: '2',
        productId: '2',
        productName: 'Paracetamol 500mg',
        quantity: 1,
        price: 5.49,
        discount: 0,
        tax: 0.77,
        total: 6.26,
      }
    ],
    subtotal: 31.47,
    tax: 2.59,
    discount: 0,
    total: 34.06,
    date: '2025-04-08',
    paymentMethod: 'Credit Card',
    status: 'paid'
  },
  {
    id: 'B002',
    customerId: '2',
    customerName: 'Emma Johnson',
    items: [
      {
        id: '1',
        productId: '7',
        productName: 'Vitamin D3 1000IU',
        quantity: 3,
        price: 9.99,
        discount: 5.00,
        tax: 3.15,
        total: 28.12,
      }
    ],
    subtotal: 29.97,
    tax: 3.15,
    discount: 5.00,
    total: 28.12,
    date: '2025-04-07',
    paymentMethod: 'Cash',
    status: 'paid'
  },
  {
    id: 'B003',
    customerId: '3',
    customerName: 'Michael Brown',
    items: [
      {
        id: '1',
        productId: '5',
        productName: 'Atorvastatin 20mg',
        quantity: 1,
        price: 22.50,
        discount: 0,
        tax: 3.15,
        total: 25.65,
      },
      {
        id: '2',
        productId: '6',
        productName: 'Omeprazole 20mg',
        quantity: 1,
        price: 18.25,
        discount: 0,
        tax: 2.56,
        total: 20.81,
      }
    ],
    subtotal: 40.75,
    tax: 5.71,
    discount: 0,
    total: 46.46,
    date: '2025-04-09',
    paymentMethod: 'Insurance',
    status: 'pending'
  }
];

// Helper function to get alternative products based on category
export const getAlternativeProducts = (productId: string, maxItems: number = 3): Product[] => {
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  
  return products
    .filter(p => p.category === product.category && p.id !== productId && p.stock > 0)
    .slice(0, maxItems);
};

// Helper function to get soon-expiring products
export const getSoonExpiringProducts = (daysThreshold: number = 90): Product[] => {
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + daysThreshold);
  
  return products.filter(product => {
    const expiryDate = new Date(product.expiryDate);
    return expiryDate <= thresholdDate && expiryDate >= today;
  });
};

// Helper function to get low stock products
export const getLowStockProducts = (): Product[] => {
  return products.filter(product => product.stock <= product.reorderLevel);
};
