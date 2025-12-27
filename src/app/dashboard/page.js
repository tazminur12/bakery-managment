import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  ShoppingCart, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Today's Sales",
      value: "৳ 24,500",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: "145",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Expenses",
      value: "৳ 8,200",
      change: "-2.4%",
      trend: "down",
      icon: CreditCard,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Production",
      value: "1,200 Units",
      change: "+5.1%",
      trend: "up",
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const recentOrders = [
    { id: "#ORD-001", customer: "Rahim Store", items: "Bread, Bun", amount: "৳ 450", status: "Delivered", time: "10 mins ago" },
    { id: "#ORD-002", customer: "Karim Bakery", items: "Cake, Biscuits", amount: "৳ 1,200", status: "Pending", time: "25 mins ago" },
    { id: "#ORD-003", customer: "City Mart", items: "Pastry", amount: "৳ 850", status: "Processing", time: "40 mins ago" },
    { id: "#ORD-004", customer: "Local Shop", items: "Donuts", amount: "৳ 320", status: "Delivered", time: "1 hour ago" },
    { id: "#ORD-005", customer: "School Canteen", items: "Puffs", amount: "৳ 600", status: "Delivered", time: "2 hours ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-rose-600"
              }`}>
                {stat.trend === "up" ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase font-medium">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "Delivered" ? "bg-green-100 text-green-800" :
                        order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert / Quick Actions */}
        <div className="space-y-6">
          {/* Production Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Production Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Bread (Regular)</span>
                  <span className="font-medium text-gray-900">85%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cakes</span>
                  <span className="font-medium text-gray-900">45%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Biscuits</span>
                  <span className="font-medium text-gray-900">92%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-indigo-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Daily Target</h3>
            <p className="text-indigo-100 text-sm mb-6">You have reached 75% of your daily sales target.</p>
            <div className="flex items-end gap-2">
               <span className="text-3xl font-bold">75%</span>
               <span className="text-indigo-200 text-sm mb-1">Achieved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
