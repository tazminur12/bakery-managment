"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { 
  ArrowLeft, Loader2, User, Phone, MapPin, 
  ShoppingBag, CreditCard, DollarSign, Calendar 
} from "lucide-react";

export default function CustomerDetailsPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    if (id) {
      fetchCustomer();
    }
  }, [id]);

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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customer.salesHistory?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
                      ৳ {sale.paidAmount}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium text-right">
                      {sale.dueAmount > 0 ? `৳ ${sale.dueAmount}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
