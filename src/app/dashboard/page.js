"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  ShoppingCart, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Wallet,
  AlertCircle,
  Loader2,
  Eye,
  Calendar,
  BarChart3,
  UserCheck
} from "lucide-react";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    todayExpenses: 0,
    todaySalaryPayments: 0,
    totalSalaryPaid: 0,
    profit: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalDue: 0,
    monthlySales: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [recentSalaryPayments, setRecentSalaryPayments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [salesRes, expensesRes, customersRes, productsRes, salaryPaymentsRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/expense"),
        fetch("/api/customers"),
        fetch("/api/products"),
        fetch("/api/salary-payments")
      ]);

      const salesData = await salesRes.json();
      const expensesData = await expensesRes.json();
      const customersData = await customersRes.json();
      const productsData = await productsRes.json();
      const salaryPaymentsData = await salaryPaymentsRes.json();

      const sales = salesData.sales || [];
      const expenses = expensesData.expenses || [];
      const customers = customersData.customers || [];
      const products = productsData.products || [];
      const salaryPayments = salaryPaymentsData.payments || [];

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      // Calculate today's statistics
      const todaySales = sales
        .filter(s => {
          const saleDate = new Date(s.date);
          return saleDate >= today && saleDate <= todayEnd;
        })
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

      const todayOrders = sales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= today && saleDate <= todayEnd;
      }).length;

      // Calculate today's expenses (only regular expenses, not salary payments)
      const todayExpenses = expenses
        .filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate >= today && expenseDate <= todayEnd;
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      // Also include today's salary payments separately
      const todaySalaryPayments = salaryPayments
        .filter(sp => {
          const paymentDate = new Date(sp.paymentDate);
          return paymentDate >= today && paymentDate <= todayEnd;
        })
        .reduce((sum, sp) => sum + (sp.amount || 0), 0);

      // Calculate total salary paid (all time)
      const totalSalaryPaid = salaryPayments.reduce((sum, sp) => sum + (sp.amount || 0), 0);

      // Monthly sales (current month)
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthlySales = sales
        .filter(s => {
          const saleDate = new Date(s.date);
          return saleDate >= currentMonth && saleDate <= monthEnd;
        })
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

      // Total due
      const totalDue = sales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);

      // Get recent sales (last 5)
      const recentSalesList = sales
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      // Get recent salary payments (last 5)
      const recentSalaryList = salaryPayments
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, 5);

      // Low stock products (stock < 50 or not set)
      const lowStock = products.filter(p => !p.stock || p.stock < 50).slice(0, 5);

      // Daily sales data for last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        const daySales = sales
          .filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= date && saleDate <= dateEnd;
          })
          .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

        last7Days.push({
          date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          amount: daySales
        });
      }

      setStats({
        todaySales,
        todayOrders,
        todayExpenses,
        todaySalaryPayments,
        totalSalaryPaid,
        profit: todaySales - todayExpenses,
        totalCustomers: customers.length,
        totalProducts: products.length,
        totalDue,
        monthlySales
      });

      setRecentSales(recentSalesList);
      setLowStockProducts(lowStock);
      setDailySalesData(last7Days);
      setRecentSalaryPayments(recentSalaryList);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const maxDailyAmount = dailySalesData.length > 0 ? Math.max(...dailySalesData.map(d => d.amount)) : 1;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
          <p className="text-gray-500 mt-1">আপনার ব্যবসার সারাংশ</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={18} />
          {new Date().toLocaleDateString('bn-BD', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Sales */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">আজ</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">আজকের বিক্রয়</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              ৳ {stats.todaySales.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center mt-2 text-xs text-gray-400">
              <ShoppingCart size={14} className="mr-1" />
              {stats.todayOrders} টি অর্ডার
            </div>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">এই মাস</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">মাসিক বিক্রয়</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              ৳ {stats.monthlySales.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center mt-2 text-xs text-gray-400">
              <TrendingUp size={14} className="mr-1" />
              মাসিক লক্ষ্য
            </div>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <Wallet size={24} className="text-red-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">আজ</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">আজকের খরচ</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              ৳ {stats.todayExpenses.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Total Due */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-50">
              <CreditCard size={24} className="text-orange-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">মোট</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">মোট বাকি</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              ৳ {stats.totalDue.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center mt-2 text-xs text-gray-400">
              <Users size={14} className="mr-1" />
              {stats.totalCustomers} গ্রাহক
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">মোট গ্রাহক</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</h3>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50">
              <Users size={24} className="text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">মোট পণ্য</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Package size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">মোট বেতন পরিশোধিত</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">
                ৳ {stats.totalSalaryPaid.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <UserCheck size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">নিট লাভ (আজ)</p>
              <h3 className={`text-2xl font-bold mt-1 ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ৳ {stats.profit.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${stats.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              {stats.profit >= 0 ? (
                <TrendingUp size={24} className="text-green-600" />
              ) : (
                <TrendingDown size={24} className="text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-600" />
              সাম্প্রতিক বিক্রয়
            </h2>
            <Link 
              href="/dashboard/sales"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              সব দেখুন →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                  <th className="px-6 py-4">তারিখ</th>
                  <th className="px-6 py-4">গ্রাহক</th>
                  <th className="px-6 py-4">মোট</th>
                  <th className="px-6 py-4">স্ট্যাটাস</th>
                  <th className="px-6 py-4">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      কোনো বিক্রয় পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  recentSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(sale.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {sale.customerName}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ৳ {sale.totalAmount?.toFixed(2) || sale.totalAmount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sale.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {sale.status === "Paid" ? "পরিশোধিত" : "বাকি"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/sales/${sale._id}`}
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <Eye size={14} />
                          দেখুন
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-600" />
              গত ৭ দিনের বিক্রয়
            </h3>
            <div className="space-y-3">
              {dailySalesData.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-600">{day.date}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="bg-indigo-600 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(day.amount / maxDailyAmount) * 100}%` }}
                    >
                      {day.amount > 0 && (
                        <span className="text-xs font-medium text-white">
                          ৳{(day.amount / 1000).toFixed(0)}k
                        </span>
                      )}
                </div>
              </div>
                </div>
              ))}
                </div>
              </div>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-6 bg-orange-50/30">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-orange-600" />
                কম স্টক সতর্কতা
              </h3>
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
              <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">স্টক: {product.stock || 0} {product.unit || 'টি'}</p>
                </div>
                    <Link
                      href={`/dashboard/products/${product._id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      দেখুন
                    </Link>
                </div>
                ))}
              </div>
              <Link
                href="/dashboard/products"
                className="mt-4 block text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                সব পণ্য দেখুন →
              </Link>
            </div>
          )}

          {/* Recent Salary Payments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserCheck size={20} className="text-indigo-600" />
                সাম্প্রতিক বেতন পরিশোধ
              </h3>
              <Link 
                href="/dashboard/employees"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                সব দেখুন →
              </Link>
            </div>
            <div className="p-6">
              {recentSalaryPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">কোনো বেতন পরিশোধের তথ্য নেই</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSalaryPayments.map((payment) => (
                    <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{payment.employeeName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500">
                            {payment.month}/{payment.year}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.paymentDate).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-sm">
                          ৳{payment.amount?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-500">{payment.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-indigo-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-bold mb-4">দ্রুত কার্যক্রম</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/sales"
                className="block w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors text-center"
              >
                নতুন বিক্রয়
              </Link>
              <Link
                href="/dashboard/production"
                className="block w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors text-center"
              >
                উৎপাদন এন্ট্রি
              </Link>
              <Link
                href="/dashboard/expense"
                className="block w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors text-center"
              >
                খরচ যোগ করুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
