"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { 
  ArrowLeft, Loader2, User, Phone, MapPin, 
  ShoppingBag, CreditCard, DollarSign, Calendar, CheckCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function CustomerDetailsPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customer details");
      }
      const data = await response.json();
      setCustomer(data.customer);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const handlePayClick = (sale) => {
    setSelectedSale(sale);
    setPaymentAmount(sale.dueAmount?.toString() || "");
    setPaymentMethod(sale.paymentMethod || "Cash");
    setPaymentNotes("");
    setIsPaymentOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSale || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId: selectedSale._id,
          paymentAmount: parseFloat(paymentAmount),
          paymentMethod,
          notes: paymentNotes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to record payment");
      }

      // Refresh customer data
      await fetchCustomer();
      setIsPaymentOpen(false);
      setSelectedSale(null);
      setPaymentAmount("");
      setPaymentNotes("");
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

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Customer not found"}</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-500 text-sm">কাস্টমার প্রোফাইল এবং লেনদেন ইতিহাস</p>
        </div>
      </div>

      {/* Info & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm md:col-span-1 h-fit">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <User size={32} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">{customer.name}</h2>
              <span className="text-xs text-gray-500">Customer ID: {customer._id.slice(-6)}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={18} className="text-gray-400" />
              <span>{customer.phone}</span>
            </div>
            {customer.address && (
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-gray-400" />
                <span>{customer.address}</span>
              </div>
            )}
            {customer.notes && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mt-4">
                <p className="font-medium text-xs text-gray-500 mb-1 uppercase">Notes</p>
                {customer.notes}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <ShoppingBag size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-500">মোট কেনাকাটা</p>
            <h3 className="text-xl font-bold text-gray-900">
              ৳ {customer.stats?.totalPurchase?.toLocaleString() || 0}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <CreditCard size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-500">মোট জমা</p>
            <h3 className="text-xl font-bold text-green-600">
              ৳ {customer.stats?.totalPaid?.toLocaleString() || 0}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <DollarSign size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-500">বর্তমান বাকি</p>
            <h3 className="text-xl font-bold text-red-600">
              ৳ {customer.stats?.totalDue?.toLocaleString() || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            লেনদেনের ইতিহাস
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4">বিবরণ</th>
                <th className="px-6 py-4">মেথড</th>
                <th className="px-6 py-4 text-right">মোট বিল</th>
                <th className="px-6 py-4 text-right">জমা</th>
                <th className="px-6 py-4 text-right">বাকি</th>
                <th className="px-6 py-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customer.salesHistory?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    কোনো লেনদেনের তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                customer.salesHistory?.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sale.items?.length || 0} টি আইটেম ক্রয়
                      <div className="text-xs text-gray-500 mt-1">
                        Invoice: #{sale._id.slice(-6)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sale.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right">
                      ৳ {sale.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium text-right">
                      ৳ {sale.paidAmount || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium text-right">
                      {sale.dueAmount > 0 ? `৳ ${sale.dueAmount}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sale.dueAmount > 0 ? (
                        <button
                          onClick={() => handlePayClick(sale)}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 mx-auto"
                        >
                          <CheckCircle size={14} />
                          পরিশোধ
                        </button>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">পরিশোধিত</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>বাকি পরিশোধ করুন</DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 py-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">মোট বিল:</span>
                  <span className="font-medium">৳{selectedSale.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">জমা:</span>
                  <span className="font-medium text-green-600">৳{selectedSale.paidAmount || 0}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-600">বাকি:</span>
                  <span className="font-medium text-red-600">৳{selectedSale.dueAmount}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পরিশোধের পরিমাণ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedSale.dueAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="পরিমাণ লিখুন"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  সর্বোচ্চ: ৳{selectedSale.dueAmount}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পেমেন্ট মেথড
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  নোট (ঐচ্ছিক)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="ট্রানজেকশন বা নোট লিখুন"
                />
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "পরিশোধ হচ্ছে..." : "পরিশোধ করুন"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
