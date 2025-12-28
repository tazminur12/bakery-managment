"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { 
  ArrowLeft, Loader2, ShoppingCart, User, Calendar,
  CreditCard, DollarSign, FileText, Package, Percent
} from "lucide-react";
import Link from "next/link";

export default function SaleDetailsPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [sale, setSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await fetch(`/api/sales?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch sale details");
        }
        const data = await response.json();
        setSale(data.sale);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSale();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Sale not found"}</p>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">বিক্রয় বিবরণ</h1>
            <p className="text-gray-500 text-sm">Invoice: #{sale._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">গ্রাহক</p>
              <p className="font-semibold text-gray-900">{sale.customerName}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">তারিখ</p>
              <p className="font-semibold text-gray-900">
                {new Date(sale.date).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">পেমেন্ট</p>
              <p className="font-semibold text-gray-900">{sale.paymentMethod}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${sale.status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">স্ট্যাটাস</p>
              <p className={`font-semibold ${sale.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                {sale.status === 'Paid' ? 'পরিশোধিত' : 'বাকি'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Package size={18} className="text-gray-500" />
            বিক্রিত পণ্যের তালিকা
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">পণ্যের নাম</th>
                <th className="px-6 py-4 text-right">দাম</th>
                <th className="px-6 py-4 text-right">পরিমাণ</th>
                <th className="px-6 py-4 text-right">মোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      ৳ {item.price?.toFixed(2) || item.price}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {item.quantity} {item.unit || 'টি'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 text-right">
                      ৳ {item.subtotal?.toFixed(2) || item.subtotal}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    কোনো পণ্য পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              {sale.subtotal && sale.subtotal > 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-3 text-right font-medium text-gray-700">
                    উপমোট:
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">
                    ৳ {sale.subtotal.toFixed(2)}
                  </td>
                </tr>
              )}
              {sale.discount && sale.discount > 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-3 text-right font-medium text-red-600">
                    <div className="flex items-center justify-end gap-2">
                      <Percent size={16} />
                      ছাড়:
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">
                    -৳ {sale.discount.toFixed(2)}
                  </td>
                </tr>
              )}
              <tr className="font-bold">
                <td colSpan="3" className="px-6 py-4 text-right text-gray-900">
                  সর্বমোট:
                </td>
                <td className="px-6 py-4 text-right text-lg text-indigo-600">
                  ৳ {sale.totalAmount?.toFixed(2) || sale.totalAmount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-500">মোট বিক্রয়</p>
          <h3 className="text-2xl font-bold text-gray-900">
            ৳ {sale.totalAmount?.toFixed(2) || sale.totalAmount}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-500">জমা করা হয়েছে</p>
          <h3 className="text-2xl font-bold text-green-600">
            ৳ {sale.paidAmount?.toFixed(2) || sale.paidAmount}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-500">বাকি আছে</p>
          <h3 className="text-2xl font-bold text-red-600">
            ৳ {sale.dueAmount > 0 ? sale.dueAmount.toFixed(2) : '0.00'}
          </h3>
        </div>
      </div>

      {/* Notes */}
      {sale.notes && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText size={18} className="text-gray-500" />
            নোট
          </h3>
          <p className="text-gray-600">{sale.notes}</p>
        </div>
      )}

      {/* Created Info */}
      {sale.createdBy && (
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500">
          <p>
            এই বিক্রয় এন্ট্রি তৈরি করেছেন: <span className="font-medium text-gray-700">{sale.createdBy.name}</span>
            {sale.createdAt && (
              <> - {new Date(sale.createdAt).toLocaleString('en-GB')}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

