"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Loader2, Search, Calendar, Filter, 
  ArrowDownCircle, ArrowUpCircle, DollarSign, Download,
  TrendingUp, TrendingDown
} from "lucide-react";

export default function LedgerPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, income, expense
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const [salesRes, expensesRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/expense")
      ]);

      const salesData = await salesRes.json();
      const expensesData = await expensesRes.json();

      // Combine and format transactions
      const salesTransactions = (salesData.sales || []).map(sale => ({
        id: sale._id,
        date: new Date(sale.date),
        type: "income",
        category: "বিক্রয়",
        description: `বিক্রয় - ${sale.customerName}`,
        amount: sale.totalAmount || 0,
        paymentMethod: sale.paymentMethod,
        reference: `SALE-${sale._id.slice(-6)}`,
        details: {
          items: sale.items?.length || 0,
          discount: sale.discount || 0,
          subtotal: sale.subtotal || sale.totalAmount || 0
        }
      }));

      const expenseTransactions = (expensesData.expenses || []).map(expense => ({
        id: expense._id,
        date: new Date(expense.date),
        type: "expense",
        category: expense.category,
        description: expense.title,
        amount: expense.amount || 0,
        paymentMethod: expense.paymentMethod,
        reference: `EXP-${expense._id.slice(-6)}`,
        notes: expense.notes
      }));

      // Combine and sort by date
      const allTransactions = [...salesTransactions, ...expenseTransactions]
        .filter(t => {
          const transactionDate = new Date(t.date);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          return transactionDate >= startDate && transactionDate <= endDate;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || t.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    return { income, expense, balance };
  };

  const totals = calculateTotals();

  const getBalance = (index) => {
    let runningBalance = 0;
    for (let i = 0; i <= index; i++) {
      const t = filteredTransactions[i];
      if (t.type === "income") {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
    }
    return runningBalance;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={28} className="text-indigo-600" />
            লেজার
          </h1>
          <p className="text-gray-500">সকল আর্থিক লেনদেনের বিস্তারিত বিবরণ</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500">মোট আয়</p>
          <h3 className="text-2xl font-bold text-green-600">
            ৳ {totals.income.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500">মোট খরচ</p>
          <h3 className="text-2xl font-bold text-red-600">
            ৳ {totals.expense.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500">নিট ব্যালেন্স</p>
          <h3 className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            ৳ {totals.balance.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="খুঁজুন (বিবরণ, ক্যাটাগরি, রেফারেন্স)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">সকল লেনদেন</option>
            <option value="income">আয়</option>
            <option value="expense">খরচ</option>
          </select>

          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />

          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">লেনদেনের বিবরণ</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
            <Download size={16} />
            এক্সপোর্ট
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4">ধরণ</th>
                <th className="px-6 py-4">বিবরণ</th>
                <th className="px-6 py-4">ক্যাটাগরি</th>
                <th className="px-6 py-4">রেফারেন্স</th>
                <th className="px-6 py-4 text-right">ডেবিট (খরচ)</th>
                <th className="px-6 py-4 text-right">ক্রেডিট (আয়)</th>
                <th className="px-6 py-4 text-right">ব্যালেন্স</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    কোনো লেনদেন পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, index) => {
                  const balance = getBalance(index);
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.date.toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4">
                        {transaction.type === "income" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <ArrowUpCircle size={14} />
                            আয়
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <ArrowDownCircle size={14} />
                            খরচ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{transaction.description}</div>
                        {transaction.paymentMethod && (
                          <div className="text-xs text-gray-500 mt-1">
                            {transaction.paymentMethod}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {transaction.reference}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium text-right">
                        {transaction.type === "expense" ? (
                          `৳ ${transaction.amount.toFixed(2)}`
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium text-right">
                        {transaction.type === "income" ? (
                          `৳ ${transaction.amount.toFixed(2)}`
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium text-right ${
                        balance >= 0 ? 'text-indigo-600' : 'text-red-600'
                      }`}>
                        ৳ {balance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr className="font-bold">
                <td colSpan="5" className="px-6 py-4 text-right">সর্বমোট:</td>
                <td className="px-6 py-4 text-red-600 text-right">
                  ৳ {filteredTransactions
                    .filter(t => t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </td>
                <td className="px-6 py-4 text-green-600 text-right">
                  ৳ {filteredTransactions
                    .filter(t => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </td>
                <td className={`px-6 py-4 text-right ${
                  totals.balance >= 0 ? 'text-indigo-600' : 'text-red-600'
                }`}>
                  ৳ {totals.balance.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

