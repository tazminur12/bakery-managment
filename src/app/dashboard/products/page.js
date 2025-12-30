"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Plus, Search, Edit, Trash2, Camera, Loader2, 
  Image as ImageIcon, Filter, Eye 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  // Image Handling
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const initialFormState = {
    name: "",
    price: "",
    costPrice: "",
    unit: "packet",
    category: "Cake",
    description: "",
    image: null
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Image upload failed");
    return data.url;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setImageFile(null);
    setImagePreview(null);
    setError("");
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUploading(!!imageFile);
    setError("");

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: imageUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create product");
      }

      await fetchProducts();
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleEditClick = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      costPrice: product.costPrice || "",
      unit: product.unit,
      category: product.category,
      description: product.description || "",
      image: product.image
    });
    setImagePreview(product.image);
    setImageFile(null);
    setIsEditOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUploading(!!imageFile);
    setError("");

    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentProduct._id,
          ...formData,
          image: imageUrl
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update product");
      }

      await fetchProducts();
      setIsEditOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?id=${currentProduct._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      await fetchProducts();
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(item => {
    const name = (item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    const query = (searchTerm || "").toLowerCase();
    return name.includes(query) || category.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">পণ্য তালিকা</h1>
          <p className="text-gray-500">সকল পণ্যের তালিকা এবং ব্যবস্থাপনা</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          নতুন পণ্য যোগ করুন
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8 sm:py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-8 sm:py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>কোনো পণ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 border border-gray-200">
                  {product.category}
                </div>
              </div>
              
              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 mb-1 text-base sm:text-lg truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
                
                <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">বিক্রয় মূল্য</p>
                    <p className="font-bold text-indigo-600">৳ {product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">বর্তমান স্টক</p>
                    <p className={`font-medium ${product.stock !== undefined && product.stock !== null ? (product.stock < 50 ? 'text-red-600' : 'text-green-600') : 'text-gray-400'}`}>
                      {product.stock !== undefined && product.stock !== null ? `${product.stock} ${product.unit}` : 'স্টক নেই'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-3 sm:px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <button 
                  onClick={() => router.push(`/dashboard/products/${product._id}`)}
                  className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                  title="বিস্তারিত দেখুন"
                >
                  <Eye size={18} />
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(product)}
                    className="text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => { setCurrentProduct(product); setIsDeleteOpen(true); }}
                    className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "পণ্য এডিট করুন" : "নতুন পণ্য যোগ করুন"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={isEditOpen ? handleUpdateProduct : handleAddProduct} className="space-y-4 py-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            {/* Image Upload */}
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="h-32 w-full aspect-video rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Camera size={32} className="mx-auto mb-2" />
                      <span className="text-xs">Add Photo</span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 shadow-sm">
                  <Camera size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">পণ্যের নাম *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="যেমন: ভ্যানিলা কেক"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">বিক্রয় মূল্য *</label>
                <input
                  required
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ক্রয়/খরচ মূল্য</label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ক্যাটাগরি</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Cake">কেক (Cake)</option>
                  <option value="Laddu">লাড্ডু (Laddu)</option>
                  <option value="Biscuits">বিস্কুট (Biscuits)</option>
                  <option value="Chanachur">চানাচুর (Chanachur)</option>
                  <option value="Singara">সিঙ্গারা (Singara)</option>
                  <option value="Samucha">সমুচা (Samucha)</option>
                  <option value="Semai">সেমাই (Semai)</option>
                  <option value="Bread">পাউরুটি (Bread)</option>
                  <option value="Pastry">পেস্ট্রি (Pastry)</option>
                  <option value="Drinks">পানীয় (Drinks)</option>
                  <option value="Other">অন্যান্য (Other)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">একক (Unit) *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="pcs">পিস (pcs)</option>
                  <option value="kg">কেজি (kg)</option>
                  <option value="packet">প্যাকেট (Packet)</option>
                  <option value="box">বক্স (box)</option>
                  <option value="doz">ডজন (doz)</option>
                  <option value="pound">পাউন্ড (Pound)</option>
                  <option value="gram">গ্রাম (gram)</option>
                  <option value="liter">লিটার (Liter)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">বিবরণ</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="পণ্যের বিস্তারিত বিবরণ..."
              />
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={18} />
                    {isUploading ? "আপলোড হচ্ছে..." : "সেভ হচ্ছে..."}
                  </div>
                ) : (
                  isEditOpen ? "আপডেট করুন" : "সেভ করুন"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm text-center p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-red-600" size={24} />
          </div>
          <DialogTitle className="text-xl font-bold mb-2">পণ্য মুছে ফেলবেন?</DialogTitle>
          <p className="text-gray-500 mb-6">
            আপনি কি নিশ্চিত যে আপনি <strong>{currentProduct?.name}</strong> মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              বাতিল
            </button>
            <button
              onClick={handleDeleteProduct}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {loading ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
