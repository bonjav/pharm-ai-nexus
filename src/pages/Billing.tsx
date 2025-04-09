import React, { useState } from 'react';
import { Search, Plus, ShoppingCart, X, Pill, AlertTriangle, UserPlus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import Layout from '../components/layout/Layout';
import { customers, products, bills, getAlternativeProducts } from '../services/mockData';
import { formatDistance } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InvoiceModal from '../components/invoice/InvoiceModal';
import { prepareInvoiceData, InvoiceData } from '../utils/invoiceUtils';

const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
}

const Billing: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [alternativeItem, setAlternativeItem] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState<boolean>(false);
  const [showAddCustomer, setShowAddCustomer] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const onAddCustomer = (data: CustomerFormValues) => {
    const newCustomerId = `customer-${customers.length + 1}`;
    const newCustomer = {
      id: newCustomerId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      lastPurchase: new Date(),
    };
    
    customers.push(newCustomer);
    
    setSelectedCustomer(newCustomerId);
    
    setShowAddCustomer(false);
    
    toast({
      title: "Customer Added",
      description: `${data.name} has been added successfully.`,
    });
    
    form.reset();
  };

  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: typeof products[0]) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (product.stock <= 0) {
      setAlternativeItem(product.id);
      setShowAlternatives(true);
      return;
    }

    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, subTotal: (item.quantity + 1) * item.price } 
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        subTotal: product.price,
      }]);
    }

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity, subTotal: quantity * item.price } 
        : item
    ));
  };

  const handleGenerateInvoice = () => {
    if (!selectedCustomer || cart.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a customer and add products to the cart before generating an invoice.",
        variant: "destructive",
      });
      return;
    }

    const newBill = {
      id: `B${String(bills.length + 1).padStart(3, '0')}`,
      customerId: selectedCustomer,
      customerName: customers.find(c => c.id === selectedCustomer)?.name || '',
      items: cart.map(item => ({
        id: item.id,
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        discount: 0,
        tax: item.price * item.quantity * 0.10,
        total: item.subTotal,
      })),
      subtotal: subtotal,
      tax: tax,
      discount: 0,
      total: total,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      status: 'paid' as const,
    };

    const customer = customers.find(c => c.id === selectedCustomer);
    
    if (customer) {
      const invoice = prepareInvoiceData(newBill, customer);
      setInvoiceData(invoice);
      setShowInvoice(true);

      bills.push(newBill);
    }
  };

  const handleShowBillHistory = () => {
    setShowHistory(true);
  };

  const handleViewInvoice = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    const customer = customers.find(c => c.id === bill?.customerId);
    
    if (bill && customer) {
      const invoice = prepareInvoiceData(bill, customer);
      setInvoiceData(invoice);
      setShowInvoice(true);
      setShowHistory(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subTotal, 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  return (
    <Layout title="Billing">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">Product Search</CardTitle>
                <CardDescription>
                  Search for products to add to the current bill
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShowBillHistory}
                className="flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4" />
                View Bill History
              </Button>
            </CardHeader>
            <CardHeader>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by product name or category..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="pharma-table">
                  <thead>
                    <tr>
                      <th className="pharma-th">Product</th>
                      <th className="pharma-th">Category</th>
                      <th className="pharma-th">Stock</th>
                      <th className="pharma-th">Price</th>
                      <th className="pharma-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.slice(0, 5).map((product) => (
                        <tr key={product.id} className="hover:bg-muted/30">
                          <td className="pharma-td font-medium">{product.name}</td>
                          <td className="pharma-td">{product.category}</td>
                          <td className="pharma-td">
                            {product.stock === 0 ? (
                              <Badge variant="destructive" className="bg-red-500">
                                Out of stock
                              </Badge>
                            ) : product.stock <= product.reorderLevel ? (
                              <Badge variant="outline" className="bg-pharma-warning text-pharma-dark">
                                Low: {product.stock}
                              </Badge>
                            ) : (
                              <span>{product.stock}</span>
                            )}
                          </td>
                          <td className="pharma-td">${product.price.toFixed(2)}</td>
                          <td className="pharma-td">
                            <Button
                              size="sm"
                              variant={product.stock === 0 ? "outline" : "default"}
                              className={product.stock === 0 ? "border-pharma-primary text-pharma-primary hover:bg-pharma-primary/10" : "bg-pharma-primary hover:bg-pharma-primary/90"}
                              onClick={() => handleAddToCart(product)}
                            >
                              {product.stock === 0 ? "Alternatives" : "Add"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="pharma-td text-center py-8 text-muted-foreground">
                          No products found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Current Cart</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardDescription>
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
                </CardDescription>
                <div className="w-full sm:w-64 flex gap-2">
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddCustomer(true)}
                    title="Add new customer"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.subTotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">
                    Search for products above to add them to your cart
                  </p>
                </div>
              )}
            </CardContent>
            
            {cart.length > 0 && (
              <CardFooter className="flex flex-col">
                <Separator className="mb-4" />
                <div className="space-y-1.5 w-full">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedCustomer ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Customer</h3>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium">
                          {customers.find(c => c.id === selectedCustomer)?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customers.find(c => c.id === selectedCustomer)?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customers.find(c => c.id === selectedCustomer)?.phone}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-muted/40 p-4 rounded-md text-center">
                    <p className="text-muted-foreground mb-2">
                      Select a customer to continue with billing
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddCustomer(true)}
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add New Customer
                    </Button>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Payment Method</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Bill Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full bg-pharma-primary hover:bg-pharma-primary/90"
                disabled={cart.length === 0 || !selectedCustomer}
                onClick={handleGenerateInvoice}
              >
                Generate Invoice
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={showAlternatives} onOpenChange={setShowAlternatives}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-pharma-warning" />
              Product Out of Stock
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              <span className="font-medium">
                {products.find(p => p.id === alternativeItem)?.name}
              </span> is currently out of stock.
            </p>
            
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Pill className="h-4 w-4 text-pharma-primary" />
              AI Recommended Alternatives
            </h4>
            
            <div className="space-y-2">
              {alternativeItem && getAlternativeProducts(alternativeItem).map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-gray-100">
                        Stock: {product.stock}
                      </Badge>
                      <span className="text-sm">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-pharma-primary hover:bg-pharma-primary/90"
                    onClick={() => {
                      handleAddToCart(product);
                      setShowAlternatives(false);
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Fill in the customer details below to add them to your customer database.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddCustomer)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, State, Zip" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-pharma-primary hover:bg-pharma-primary/90">
                  Add Customer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bill History</DialogTitle>
            <DialogDescription>
              View previous bills and generate invoices
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.length > 0 ? (
                    bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.id}</TableCell>
                        <TableCell>{bill.date}</TableCell>
                        <TableCell>{bill.customerName}</TableCell>
                        <TableCell className="text-right">${bill.total.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={bill.status === 'paid' ? 'default' : 
                                  bill.status === 'pending' ? 'outline' : 'destructive'}
                            className={bill.status === 'paid' ? 'bg-green-500' : ''}
                          >
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewInvoice(bill.id)}
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No bills found. Generate your first bill to see it here.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {invoiceData && (
        <InvoiceModal 
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
          invoiceData={invoiceData}
        />
      )}
    </Layout>
  );
};

export default Billing;
