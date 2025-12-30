"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, Loader2, Calendar, TrendingUp, TrendingDown,
  DollarSign, ShoppingCart, Wallet, PieChart, FileText,
  Download, Filter
} from "lucide-react";

export default function ReportsPage() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });
  const [reportType, setReportType] = useState("summary"); // summary, sales, expense, profit

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [salesRes, expensesRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/expense")
      ]);

      const salesData = await salesRes.json();
      const expensesData = await expensesRes.json();

      // Filter by date range
      const filteredSales = (salesData.sales || []).filter(sale => {
        const saleDate = new Date(sale.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        return saleDate >= startDate && saleDate <= endDate;
      });

      const filteredExpenses = (expensesData.expenses || []).filter(expense => {
        const expenseDate = new Date(expense.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      setSales(filteredSales);
      setExpenses(filteredExpenses);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profit = totalSales - totalExpenses;
    const profitMargin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(2) : 0;
    const totalOrders = sales.length;
    const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;

    return {
      totalSales,
      totalExpenses,
      profit,
      profitMargin,
      totalOrders,
      avgOrderValue
    };
  };

  // Sales by category/payment method
  const getSalesByPaymentMethod = () => {
    const methodMap = {};
    sales.forEach(sale => {
      const method = sale.paymentMethod || "Cash";
      methodMap[method] = (methodMap[method] || 0) + (sale.totalAmount || 0);
    });
    return Object.entries(methodMap).map(([method, amount]) => ({ method, amount }));
  };

  // Expenses by category
  const getExpensesByCategory = () => {
    const categoryMap = {};
    expenses.forEach(expense => {
      const category = expense.category || "অন্যান্য";
      categoryMap[category] = (categoryMap[category] || 0) + (expense.amount || 0);
    });
    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Daily sales trend
  const getDailySalesTrend = () => {
    const dailyMap = {};
    sales.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString('en-GB');
      dailyMap[date] = (dailyMap[date] || 0) + (sale.totalAmount || 0);
    });
    return Object.entries(dailyMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
  };

  const summary = calculateSummary();
  const salesByPayment = getSalesByPaymentMethod();
  const expensesByCategory = getExpensesByCategory();
  const dailyTrend = getDailySalesTrend();

  const maxDailyAmount = dailyTrend.length > 0 ? Math.max(...dailyTrend.map(d => d.amount)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={28} className="text-indigo-600" />
            রিপোর্ট এবং বিশ্লেষণ
          </h1>
          <p className="text-gray-500">বিক্রয়, খরচ এবং লাভের বিস্তারিত রিপোর্ট</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span className="text-gray-500">থেকে</span>
            <input
              type="date"
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download size={18} />
            PDF ডাউনলোড
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <ShoppingCart size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500">মোট বিক্রয়</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                ৳ {summary.totalSales.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-gray-400 mt-2">{summary.totalOrders} টি অর্ডার</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <Wallet size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500">মোট খরচ</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                ৳ {summary.totalExpenses.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-gray-400 mt-2">{expenses.length} টি খরচ</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${summary.profit >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                  {summary.profit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                </div>
              </div>
              <p className="text-sm text-gray-500">নিট লাভ/ক্ষতি</p>
              <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${summary.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                ৳ {summary.profit.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-gray-400 mt-2">{summary.profitMargin}% মার্জিন</p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <DollarSign size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500">গড় অর্ডার মূল্য</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                ৳ {summary.avgOrderValue}
              </h3>
              <p className="text-xs text-gray-400 mt-2">প্রতি অর্ডার</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Daily Sales Trend */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                দৈনিক বিক্রয় ট্রেন্ড
              </h3>
              <div className="space-y-3">
                {dailyTrend.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">কোনো ডেটা নেই</p>
                ) : (
                  dailyTrend.map((day, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-16 sm:w-20 text-xs sm:text-sm text-gray-600">{day.date}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 sm:h-6 relative overflow-hidden">
                        <div
                          className="bg-indigo-600 h-5 sm:h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${maxDailyAmount > 0 ? (day.amount / maxDailyAmount) * 100 : 0}%` }}
                        >
                          <span className="text-[10px] sm:text-xs font-medium text-white">
                            {day.amount.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="w-20 sm:w-24 text-xs sm:text-sm font-medium text-gray-900 text-right">
                        ৳ {day.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sales by Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <PieChart size={20} className="text-indigo-600" />
                পেমেন্ট মেথড অনুযায়ী বিক্রয়
              </h3>
              <div className="space-y-4">
                {salesByPayment.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">কোনো ডেটা নেই</p>
                ) : (
                  salesByPayment.map((item, index) => {
                    const total = salesByPayment.reduce((sum, i) => sum + i.amount, 0);
                    const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
                    const colors = ['bg-indigo-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{item.method}</span>
                          <span className="text-sm font-bold text-gray-900">
                            ৳ {item.amount.toFixed(2)} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`${colors[index % colors.length]} h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" />
              ক্যাটাগরি অনুযায়ী খরচ
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">ক্যাটাগরি</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">পরিমাণ</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">শতাংশ</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">গ্রাফ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expensesByCategory.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                        কোনো খরচ পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    expensesByCategory.map((item, index) => {
                      const total = expensesByCategory.reduce((sum, i) => sum + i.amount, 0);
                      const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
                      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500'];
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-gray-900">{item.category}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-medium text-red-600">
                            ৳ {item.amount.toFixed(2)}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-gray-600">{percentage}%</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className={`${colors[index % colors.length]} h-2 rounded-full`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
