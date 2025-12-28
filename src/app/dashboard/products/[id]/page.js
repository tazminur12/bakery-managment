"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import { use } from "react";

export default function ProductDetailsPage({ params }) {
  const router = useRouter();
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">পণ্যের বিবরণ</h1>
      </div>

      {/* Product Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/2 bg-gray-100 h-64 md:h-auto relative">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ImageIcon size={48} className="mb-2" />
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 md:w-1/2 space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                  <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">৳{product.price}</p>
                  <p className="text-sm text-gray-500 capitalize">per {product.unit}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">ক্রয়/খরচ মূল্য</p>
                  <p className="font-medium">৳{product.costPrice || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">সম্ভাব্য লাভ</p>
                  <p className="font-medium text-green-600">
                    ৳{(product.price - (product.costPrice || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">বিবরণ</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="border-t pt-4 text-xs text-gray-400 flex justify-between">
              <span>Added: {new Date(product.createdAt).toLocaleDateString()}</span>
              {product.updatedAt && (
                <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
