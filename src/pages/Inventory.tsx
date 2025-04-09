
import React, { useState } from 'react';
import { Search, Plus, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Layout from '../components/layout/Layout';
import { products, Product } from '../services/mockData';

const Inventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(product => product.category)))];

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof Product];
    const bValue = b[sortBy as keyof Product];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const getStockStatus = (product: Product) => {
    if (product.stock <= product.reorderLevel / 2) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (product.stock <= product.reorderLevel) {
      return <Badge variant="outline" className="bg-pharma-warning text-pharma-dark">Low</Badge>;
    } else {
      return <Badge variant="outline" className="bg-pharma-success text-white">In Stock</Badge>;
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <Layout title="Inventory Management">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Category</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-pharma-primary hover:bg-pharma-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details of the new product below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right text-sm font-medium">
                    Name
                  </label>
                  <Input id="name" placeholder="Product name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="category" className="text-right text-sm font-medium">
                    Category
                  </label>
                  <Input id="category" placeholder="Category" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="batchNo" className="text-right text-sm font-medium">
                    Batch No.
                  </label>
                  <Input id="batchNo" placeholder="Batch number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="serialNo" className="text-right text-sm font-medium">
                    Serial No.
                  </label>
                  <Input id="serialNo" placeholder="Serial number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="stock" className="text-right text-sm font-medium">
                    Stock
                  </label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="Initial stock" 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="price" className="text-right text-sm font-medium">
                    Price ($)
                  </label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="col-span-3" 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  className="bg-pharma-primary hover:bg-pharma-primary/90"
                  onClick={() => {
                    toast({
                      title: "Product Added",
                      description: "The product has been added to inventory.",
                    });
                  }}
                >
                  Save Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your pharmacy products, track stock levels, and monitor expiry dates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="pharma-table">
              <thead>
                <tr>
                  <th className="pharma-th">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 hover:text-pharma-primary">
                        Product <ArrowUpDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleSort('name')}>
                          Sort by Name
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('category')}>
                          Sort by Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </th>
                  <th className="pharma-th">Category</th>
                  <th className="pharma-th">Batch No.</th>
                  <th className="pharma-th">Serial No.</th>
                  <th className="pharma-th">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 hover:text-pharma-primary">
                        Stock <ArrowUpDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleSort('stock')}>
                          Sort by Stock Level
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </th>
                  <th className="pharma-th">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 hover:text-pharma-primary">
                        Price <ArrowUpDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleSort('price')}>
                          Sort by Price
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </th>
                  <th className="pharma-th">Expiry Date</th>
                  <th className="pharma-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="pharma-td font-medium">{product.name}</td>
                    <td className="pharma-td">{product.category}</td>
                    <td className="pharma-td">{product.batchNo}</td>
                    <td className="pharma-td">{product.id}</td>
                    <td className="pharma-td">
                      {product.stock}
                      {product.stock <= product.reorderLevel && (
                        <span className="ml-2 text-xs text-pharma-warning">
                          (Reorder at {product.reorderLevel})
                        </span>
                      )}
                    </td>
                    <td className="pharma-td">${product.price.toFixed(2)}</td>
                    <td className="pharma-td">{product.expiryDate}</td>
                    <td className="pharma-td">{getStockStatus(product)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Inventory;
