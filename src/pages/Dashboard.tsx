
import React from 'react';
import { BarChart, LineChart, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, AlertTriangle, ShoppingCart, PackageCheck, ArrowUpRight, Clock } from "lucide-react";
import Layout from '../components/layout/Layout';
import { salesData, categoryData, getLowStockProducts, getSoonExpiringProducts } from '../services/mockData';

const Dashboard: React.FC = () => {
  const lowStockProducts = getLowStockProducts();
  const expiringProducts = getSoonExpiringProducts();
  
  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="stat-card">
          <div className="stat-card-accent" />
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-2">$24,563.00</h3>
              <p className="text-xs text-green-500 flex items-center mt-2">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>12% from last month</span>
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-pharma-primary">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-accent bg-pharma-success" />
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Products</p>
              <h3 className="text-2xl font-bold mt-2">1,243</h3>
              <p className="text-xs text-green-500 flex items-center mt-2">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>4% from last month</span>
              </p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-pharma-success">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-accent bg-pharma-warning" />
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
              <h3 className="text-2xl font-bold mt-2">{lowStockProducts.length}</h3>
              <p className="text-xs text-pharma-warning flex items-center mt-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Needs attention</span>
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center text-pharma-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-accent bg-pharma-accent" />
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Orders Today</p>
              <h3 className="text-2xl font-bold mt-2">32</h3>
              <p className="text-xs text-pharma-accent flex items-center mt-2">
                <ShoppingCart className="h-3 w-3 mr-1" />
                <span>3 pending approval</span>
              </p>
            </div>
            <div className="h-12 w-12 bg-pink-50 rounded-full flex items-center justify-center text-pharma-accent">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              width={700}
              height={300}
              data={salesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3A86FF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3A86FF" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <cartesianGrid strokeDasharray="3 3" vertical={false} />
              <xAxis dataKey="month" />
              <yAxis />
              <tooltip />
              <area
                type="monotone"
                dataKey="sales"
                stroke="#3A86FF"
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </LineChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={250} height={250}>
              <pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {categoryData.map((entry, index) => (
                  <cell
                    key={`cell-${index}`}
                    fill={[
                      "#3A86FF",
                      "#8FB8DE",
                      "#FF006E",
                      "#FFBE0B",
                      "#38B000",
                      "#1E293B",
                    ][index % 6]}
                  />
                ))}
              </pie>
              <tooltip />
              <legend />
            </PieChart>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Low Stock Products</CardTitle>
            <span className="pharma-badge pharma-badge-warning">
              {lowStockProducts.length} Items
            </span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="pharma-table">
                <thead>
                  <tr>
                    <th className="pharma-th">Product Name</th>
                    <th className="pharma-th">Current Stock</th>
                    <th className="pharma-th">Reorder Level</th>
                    <th className="pharma-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="pharma-td font-medium">{product.name}</td>
                      <td className="pharma-td">{product.stock}</td>
                      <td className="pharma-td">{product.reorderLevel}</td>
                      <td className="pharma-td">
                        {product.stock <= product.reorderLevel / 2 ? (
                          <span className="pharma-badge pharma-badge-accent">Critical</span>
                        ) : (
                          <span className="pharma-badge pharma-badge-warning">Low</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Soon Expiring Products</CardTitle>
            <span className="pharma-badge bg-pharma-primary text-white">
              {expiringProducts.length} Items
            </span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="pharma-table">
                <thead>
                  <tr>
                    <th className="pharma-th">Product Name</th>
                    <th className="pharma-th">Batch No</th>
                    <th className="pharma-th">Expiry Date</th>
                    <th className="pharma-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringProducts.map((product) => {
                    const expiryDate = new Date(product.expiryDate);
                    const today = new Date();
                    const daysToExpiry = Math.round((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    let status;
                    if (daysToExpiry <= 30) {
                      status = <span className="pharma-badge pharma-badge-accent">Critical</span>;
                    } else if (daysToExpiry <= 60) {
                      status = <span className="pharma-badge pharma-badge-warning">Warning</span>;
                    } else {
                      status = <span className="pharma-badge bg-pharma-primary text-white">Attention</span>;
                    }
                    
                    return (
                      <tr key={product.id}>
                        <td className="pharma-td font-medium">{product.name}</td>
                        <td className="pharma-td">{product.batchNo}</td>
                        <td className="pharma-td">{product.expiryDate}</td>
                        <td className="pharma-td">{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
