"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Wallet, Plus, Calendar, Search, Filter, Loader2, 
  Trash2, DollarSign, PieChart, TrendingDown, ArrowUpRight,
  Package, ShoppingCart, ArrowDown, ArrowUp, AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ExpensePage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("inventory"); // inventory, purchase, usage, expenses
  
  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialFormState = {
    type: "purchase", // purchase, usage, expense
    productId: "",
    itemName: "",
    quantity: "",
    unit: "kg",
    amount: "",
    category: "Raw Material",
    paymentMethod: "Cash",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    // Legacy fields
    title: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchExpenses();
    fetchInventory();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expense");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/expense?inventory=true");
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory || []);
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add entry");
      }

      await fetchExpenses();
      await fetchInventory();
      setIsAddOpen(false);
      setFormData(initialFormState);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/expense?id=${currentExpense._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      await fetchExpenses();
      await fetchInventory();
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const searchLower = searchTerm.toLowerCase();
    if (expense.type === "purchase" || expense.type === "usage") {
      return expense.itemName?.toLowerCase().includes(searchLower) ||
             expense.category?.toLowerCase().includes(searchLower);
    }
    return expense.title?.toLowerCase().includes(searchLower) ||
           expense.category?.toLowerCase().includes(searchLower);
  });

  const purchases = expenses.filter(e => e.type === "purchase");
  const usages = expenses.filter(e => e.type === "usage");
  const otherExpenses = expenses.filter(e => e.type === "expense" || !e.type);

  const totalExpenseToday = expenses
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalExpenseMonth = expenses
    .filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const openAddModal = (type) => {
    setFormData({
      ...initialFormState,
      type: type,
      date: new Date().toISOString().split("T")[0]
    });
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">খরচ ব্যবস্থাপনা</h1>
          <p className="text-gray-500">কাঁচামাল ক্রয়, ব্যবহার এবং খরচের হিসাব</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openAddModal("purchase")}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ShoppingCart size={18} className="mr-2" />
            ক্রয়
          </button>
          <button
            onClick={() => openAddModal("usage")}
            className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowDown size={18} className="mr-2" />
            ব্যবহার
          </button>
          <button
            onClick={() => openAddModal("expense")}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            অন্যান্য খরচ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "inventory"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Package size={18} className="inline mr-2" />
            মজুদ (Inventory)
          </button>
          <button
            onClick={() => setActiveTab("purchase")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "purchase"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ShoppingCart size={18} className="inline mr-2" />
            ক্রয় ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "usage"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ArrowDown size={18} className="inline mr-2" />
            ব্যবহার ({usages.length})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "expenses"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Wallet size={18} className="inline mr-2" />
            অন্যান্য খরচ ({otherExpenses.length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">আজকের</span>
          </div>
          <p className="text-sm text-gray-500">আজকের খরচ</p>
          <h3 className="text-2xl font-bold text-gray-900">৳ {totalExpenseToday.toLocaleString()}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <PieChart size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">এই মাস</span>
          </div>
          <p className="text-sm text-gray-500">মাসিক খরচ</p>
          <h3 className="text-2xl font-bold text-gray-900">৳ {totalExpenseMonth.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Package size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">মজুদ</span>
          </div>
          <p className="text-sm text-gray-500">মোট আইটেম</p>
          <h3 className="text-2xl font-bold text-gray-900">{inventory.length} টি</h3>
        </div>
      </div>

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">বর্তমান মজুদ</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">আইটেম</th>
                  <th className="px-6 py-4">ইউনিট</th>
                  <th className="px-6 py-4">বর্তমান মজুদ</th>
                  <th className="px-6 py-4">মোট ক্রয়</th>
                  <th className="px-6 py-4">মোট ব্যবহার</th>
                  <th className="px-6 py-4">সর্বশেষ আপডেট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      কোনো মজুদ পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr 
                      key={item._id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/expense/${item.productId}`)}
                    >
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-indigo-600">
                        {item.productId || "N/A"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.itemName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          item.currentStock < 0 
                            ? "text-red-600" 
                            : item.currentStock < 10 
                            ? "text-orange-600" 
                            : "text-green-600"
                        }`}>
                          {item.currentStock.toFixed(2)} {item.unit}
                          {item.currentStock < 0 && (
                            <AlertCircle size={16} className="inline ml-2 text-red-600" />
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.totalPurchased?.toFixed(2) || 0} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.totalUsed?.toFixed(2) || 0} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase/Usage/Expenses Tab */}
      {(activeTab === "purchase" || activeTab === "usage" || activeTab === "expenses") && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">তারিখ</th>
                  <th className="px-6 py-4">বিবরণ</th>
                  {activeTab !== "expenses" && <th className="px-6 py-4">পরিমাণ</th>}
                  <th className="px-6 py-4">ক্যাটাগরি</th>
                  <th className="px-6 py-4">মেথড</th>
                  <th className="px-6 py-4">টাকা</th>
                  <th className="px-6 py-4">এন্ট্রি করেছেন</th>
                  <th className="px-6 py-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={activeTab === "expenses" ? "7" : "8"} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                    </td>
                  </tr>
                ) : (() => {
                  const itemsToShow = activeTab === "purchase" 
                    ? purchases.filter(e => 
                        e.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.category?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    : activeTab === "usage"
                    ? usages.filter(e => 
                        e.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.category?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    : otherExpenses.filter(e => 
                        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.category?.toLowerCase().includes(searchTerm.toLowerCase())
                      );

                  if (itemsToShow.length === 0) {
                    return (
                      <tr>
                        <td colSpan={activeTab === "expenses" ? "7" : "8"} className="px-6 py-12 text-center text-gray-500">
                          কোনো তথ্য পাওয়া যায়নি
                        </td>
                      </tr>
                    );
                  }

                  return itemsToShow.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {expense.type === "purchase" && <ArrowUp size={16} className="inline mr-1 text-green-600" />}
                        {expense.type === "usage" && <ArrowDown size={16} className="inline mr-1 text-orange-600" />}
                        {expense.productId && (
                          <span className="font-mono text-xs text-indigo-600 mr-2">[{expense.productId}]</span>
                        )}
                        {expense.itemName || expense.title}
                        {expense.notes && (
                          <p className="text-xs text-gray-500 mt-0.5">{expense.notes}</p>
                        )}
                      </td>
                      {activeTab !== "expenses" && (
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {expense.quantity} {expense.unit}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {expense.paymentMethod}
                      </td>
                      <td className="px-6 py-4 font-bold text-red-600">
                        {expense.amount ? `৳ ${expense.amount.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {expense.createdBy?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setCurrentExpense(expense); setIsDeleteOpen(true); }}
                          className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="w-full max-w-md max-h-[95vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {formData.type === "purchase" && "নতুন ক্রয় যোগ করুন"}
              {formData.type === "usage" && "ব্যবহার রেকর্ড করুন"}
              {formData.type === "expense" && "নতুন খরচ যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            {(formData.type === "purchase" || formData.type === "usage") ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">আইটেমের নাম *</label>
                  {formData.type === "purchase" ? (
                    <input
                      required
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                      placeholder="যেমন: ময়দা, তেল, চিনি"
                    />
                  ) : (
                    <select
                      required
                      name="itemName"
                      value={formData.itemName && formData.unit ? `${formData.itemName}|${formData.unit}` : ""}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        // Parse itemName and unit from the value (format: "itemName|unit")
                        const [itemName, unit] = selectedValue.split("|");
                        const selectedItem = inventory.find(item => item.itemName === itemName && item.unit === unit);
                        setFormData({
                          ...formData,
                          itemName: itemName || "",
                          unit: unit || formData.unit,
                          productId: selectedItem?.productId || ""
                        });
                      }}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-base"
                    >
                      <option value="">Product ID নির্বাচন করুন</option>
                      {inventory.length === 0 ? (
                        <option value="" disabled>কোনো মজুদ নেই। প্রথমে ক্রয় করুন।</option>
                      ) : (
                        inventory.map((item) => (
                          <option key={item._id} value={`${item.itemName}|${item.unit}`}>
                            [{item.productId || "N/A"}] {item.itemName} ({item.unit}) - {item.currentStock.toFixed(2)} {item.unit} মজুদ
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">পরিমাণ *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ইউনিট *</label>
                    <select
                      required
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      disabled={formData.type === "usage"}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-base ${
                        formData.type === "usage" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="kg">কেজি (kg)</option>
                      <option value="liter">লিটার (liter)</option>
                      <option value="gram">গ্রাম (gram)</option>
                      <option value="piece">পিস (piece)</option>
                      <option value="packet">প্যাকেট (packet)</option>
                      <option value="bag">ব্যাগ (bag)</option>
                    </select>
                    {formData.type === "usage" && (
                      <p className="text-xs text-gray-500">ইউনিট আইটেম নির্বাচন করলে স্বয়ংক্রিয়ভাবে সেট হবে</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">মূল্য (টাকা) (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ক্যাটাগরি</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-base"
                    >
                      <option value="Raw Material">কাঁচামাল (Raw Material)</option>
                      <option value="Utility">ইউটিলিটি বিল (Utility)</option>
                      <option value="Other">অন্যান্য (Other)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">তারিখ</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">পেমেন্ট মেথড</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-base"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">নোট (ঐচ্ছিক)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    rows={2}
                    placeholder="অতিরিক্ত তথ্য..."
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">খরচের বিবরণ *</label>
                  <input
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    placeholder="যেমন: বিদ্যুৎ বিল, মেরামত"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">পরিমাণ (টাকা) *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ক্যাটাগরি</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-base"
                    >
                      <option value="Raw Material">কাঁচামাল (Raw Material)</option>
                      <option value="Utility">ইউটিলিটি বিল (Utility)</option>
                      <option value="Salary">বেতন (Salary)</option>
                      <option value="Transport">পরিবহন (Transport)</option>
                      <option value="Maintenance">মেরামত (Maintenance)</option>
                      <option value="Food">খাবার (Food)</option>
                      <option value="Other">অন্যান্য (Other)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">তারিখ</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">পেমেন্ট মেথড</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-base"
                    >
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">নোট (ঐচ্ছিক)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    rows={2}
                    placeholder="অতিরিক্ত তথ্য..."
                  />
                </div>
              </>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg text-base"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-base"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={18} />
                    সেভ হচ্ছে...
                  </div>
                ) : "সেভ করুন"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="w-full max-w-sm max-h-[95vh] overflow-y-auto mx-2 sm:mx-auto text-center p-4 sm:p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-red-600" size={24} />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold mb-2">এন্ট্রি মুছে ফেলবেন?</DialogTitle>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            আপনি কি নিশ্চিত যে আপনি <strong>{currentExpense?.itemName || currentExpense?.title}</strong> এর এন্ট্রি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg text-base"
            >
              বাতিল
            </button>
            <button
              onClick={handleDeleteExpense}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-base disabled:opacity-50"
            >
              {loading ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
