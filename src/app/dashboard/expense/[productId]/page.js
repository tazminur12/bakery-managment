"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { 
  ArrowLeft, Loader2, Package, ArrowUp, ArrowDown,
  Plus, Calendar, DollarSign, AlertCircle, Edit2, Save, X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function InventoryProductDetailsPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.productId;
  
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [restockForm, setRestockForm] = useState({
    quantity: "",
    amount: "",
    paymentMethod: "Cash",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });
  
  const [usageForm, setUsageForm] = useState({
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });
  
  const [notes, setNotes] = useState("");
  const [editingNotes, setEditingNotes] = useState("");

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchHistory();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/expense?inventory=true`);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      const data = await response.json();
      const item = data.inventory?.find(p => p.productId === productId);
      if (!item) {
        throw new Error("Product not found");
      }
      setProduct(item);
      setNotes(item.notes || "");
      setEditingNotes(item.notes || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/expense");
      if (response.ok) {
        const data = await response.json();
        const productHistory = data.expenses?.filter(
          e => e.productId === productId && (e.type === "purchase" || e.type === "usage")
        ) || [];
        setHistory(productHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "purchase",
          itemName: product.itemName,
          quantity: parseFloat(restockForm.quantity),
          unit: product.unit,
          amount: restockForm.amount ? parseFloat(restockForm.amount) : 0,
          paymentMethod: restockForm.paymentMethod,
          date: restockForm.date,
          notes: restockForm.notes
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to restock");
      }

      await fetchProduct();
      await fetchHistory();
      setIsRestockOpen(false);
      setRestockForm({
        quantity: "",
        amount: "",
        paymentMethod: "Cash",
        date: new Date().toISOString().split("T")[0],
        notes: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUsage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "usage",
          itemName: product.itemName,
          quantity: parseFloat(usageForm.quantity),
          unit: product.unit,
          date: usageForm.date,
          notes: usageForm.notes
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to record usage");
      }

      await fetchProduct();
      await fetchHistory();
      setIsUsageOpen(false);
      setUsageForm({
        quantity: "",
        date: new Date().toISOString().split("T")[0],
        notes: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/expense", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productId,
          notes: editingNotes
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save notes");
      }

      setNotes(editingNotes);
      setIsEditNotesOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Product not found"}</p>
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={20} /> ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
          <p className="text-sm text-gray-500">Product ID: {product.productId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRestockOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Restock
          </button>
          <button
            onClick={() => setIsUsageOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowDown size={18} />
            Usage
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Product Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Product ID</p>
            <p className="text-lg font-mono font-semibold text-indigo-600">{product.productId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">আইটেমের নাম</p>
            <p className="text-lg font-semibold text-gray-900">{product.itemName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">ইউনিট</p>
            <p className="text-lg font-semibold text-gray-900">{product.unit}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">বর্তমান মজুদ</p>
            <p className={`text-3xl font-bold ${
              product.currentStock < 0 
                ? "text-red-600" 
                : product.currentStock < 10 
                ? "text-orange-600" 
                : "text-green-600"
            }`}>
              {product.currentStock.toFixed(2)} {product.unit}
              {product.currentStock < 0 && (
                <AlertCircle size={20} className="inline ml-2 text-red-600" />
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">মোট ক্রয়</p>
            <p className="text-2xl font-semibold text-gray-900">
              {product.totalPurchased?.toFixed(2) || 0} {product.unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">মোট ব্যবহার</p>
            <p className="text-2xl font-semibold text-gray-900">
              {product.totalUsed?.toFixed(2) || 0} {product.unit}
            </p>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">নোট/বিবরণ</p>
            <button
              onClick={() => {
                setEditingNotes(notes);
                setIsEditNotesOpen(true);
              }}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
            >
              <Edit2 size={16} />
              {notes ? "Edit" : "Add"}
            </button>
          </div>
          {notes ? (
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{notes}</p>
          ) : (
            <p className="text-gray-400 text-sm italic">কোনো নোট নেই</p>
          )}
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">ইতিহাস (Purchase & Usage)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4">টাইপ</th>
                <th className="px-6 py-4">পরিমাণ</th>
                <th className="px-6 py-4">মূল্য</th>
                <th className="px-6 py-4">নোট</th>
                <th className="px-6 py-4">এন্ট্রি করেছেন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    কোনো ইতিহাস নেই
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {entry.type === "purchase" ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <ArrowUp size={16} />
                          ক্রয়
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-600 font-medium">
                          <ArrowDown size={16} />
                          ব্যবহার
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {entry.quantity} {entry.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {entry.amount ? `৳ ${entry.amount.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.notes || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.createdBy?.name || "Unknown"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRestock} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">পরিমাণ *</label>
              <input
                required
                type="number"
                step="0.01"
                value={restockForm.quantity}
                onChange={(e) => setRestockForm({...restockForm, quantity: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">মূল্য (টাকা) (ঐচ্ছিক)</label>
              <input
                type="number"
                step="0.01"
                value={restockForm.amount}
                onChange={(e) => setRestockForm({...restockForm, amount: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">তারিখ</label>
                <input
                  type="date"
                  value={restockForm.date}
                  onChange={(e) => setRestockForm({...restockForm, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">পেমেন্ট মেথড</label>
                <select
                  value={restockForm.paymentMethod}
                  onChange={(e) => setRestockForm({...restockForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
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
                value={restockForm.notes}
                onChange={(e) => setRestockForm({...restockForm, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="অতিরিক্ত তথ্য..."
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsRestockOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "সেভ হচ্ছে..." : "Restock করুন"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Usage Modal */}
      <Dialog open={isUsageOpen} onOpenChange={setIsUsageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ব্যবহার রেকর্ড করুন</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUsage} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">পরিমাণ *</label>
              <input
                required
                type="number"
                step="0.01"
                value={usageForm.quantity}
                onChange={(e) => setUsageForm({...usageForm, quantity: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">তারিখ</label>
              <input
                type="date"
                value={usageForm.date}
                onChange={(e) => setUsageForm({...usageForm, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">নোট (ঐচ্ছিক)</label>
              <textarea
                value={usageForm.notes}
                onChange={(e) => setUsageForm({...usageForm, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="অতিরিক্ত তথ্য..."
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsUsageOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? "সেভ হচ্ছে..." : "রেকর্ড করুন"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Notes Modal */}
      <Dialog open={isEditNotesOpen} onOpenChange={setIsEditNotesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>নোট/বিবরণ সম্পাদনা করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <textarea
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="নোট/বিবরণ লিখুন..."
            />
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsEditNotesOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

