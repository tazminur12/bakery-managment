"use client";

import { useState, useEffect } from "react";
import { 
  Factory, Plus, Calendar, Package, CheckCircle, Clock, 
  Search, Filter, Loader2, Camera, Image as ImageIcon, ChevronsUpDown, Check, X 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function ProductionPage() {
  const [productionLogs, setProductionLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialFormState = {
    productName: "",
    quantity: "",
    unit: "packet",
    status: "Completed",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProductionLogs();
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
    }
  };

  const fetchProductionLogs = async () => {
    try {
      const response = await fetch("/api/production");
      if (response.ok) {
        const data = await response.json();
        setProductionLogs(data.productionLogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch production logs:", err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUploading(!!imageFile);
    setError("");

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const response = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: imageUrl
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to log production");
      }

      await fetchProductionLogs();
      setIsAddOpen(false);
      setFormData(initialFormState);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  // Filter logs based on search
  const filteredLogs = productionLogs.filter(log => 
    log.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalProductionToday = filteredLogs
    .filter(log => new Date(log.date).toDateString() === new Date().toDateString())
    .length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">উৎপাদন ব্যবস্থাপনা</h1>
          <p className="text-gray-500">প্রতিদিনের উৎপাদনের হিসাব এবং ট্র্যাকিং</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          নতুন উৎপাদন যোগ করুন
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Factory size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">আজকের এন্ট্রি</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalProductionToday}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">মোট সম্পন্ন</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {productionLogs.filter(l => l.status === "Completed").length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">প্রক্রিয়াধীন</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {productionLogs.filter(l => l.status === "In Progress").length}
            </h3>
          </div>
        </div>
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
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
                <th className="px-6 py-4">পণ্যের নাম</th>
                <th className="px-6 py-4">পরিমাণ</th>
                <th className="px-6 py-4">ছবি</th>
                <th className="px-6 py-4">স্ট্যাটাস</th>
                <th className="px-6 py-4">এন্ট্রি করেছেন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    কোনো উৎপাদনের তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {log.productName}
                      {log.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">{log.notes}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {log.quantity} <span className="text-gray-500 font-normal">{log.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      {log.image ? (
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-200">
                          <img src={log.image} alt={log.productName} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        log.status === "Completed" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {log.status === "Completed" ? "সম্পন্ন" : "চলমান"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.createdBy?.name || "Unknown"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Production Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন উৎপাদন এন্ট্রি</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-gray-700">পণ্যের নাম *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="পণ্য নির্বাচন করুন বা টাইপ করুন..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                  value={formData.productName}
                  onChange={(e) => {
                    setFormData({ ...formData, productName: e.target.value });
                    setOpenCombobox(true);
                  }}
                  onFocus={() => setOpenCombobox(true)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {formData.productName && (
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, productName: "" });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <ChevronsUpDown size={16} className="text-gray-400" />
                </div>
              </div>

              {openCombobox && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setOpenCombobox(false)} 
                  />
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {products.filter(p => p.name.toLowerCase().includes(formData.productName.toLowerCase())).length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        কোন পণ্য পাওয়া যায়নি
                      </div>
                    ) : (
                      products
                        .filter(p => p.name.toLowerCase().includes(formData.productName.toLowerCase()))
                        .map((product) => (
                          <div
                            key={product._id}
                            className={cn(
                              "px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 flex items-center justify-between",
                              formData.productName === product.name ? "bg-indigo-50 text-indigo-700" : "text-gray-700"
                            )}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                productName: product.name,
                                unit: product.unit
                              });
                              setOpenCombobox(false);
                            }}
                          >
                            <span>{product.name}</span>
                            {formData.productName === product.name && <Check size={16} />}
                          </div>
                        ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">পরিমাণ *</label>
                <input
                  required
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">একক (Unit) *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="pcs">পিস (pcs)</option>
                  <option value="kg">কেজি (kg)</option>
                  <option value="packet">প্যাকেট (Packet)</option>
                  <option value="box">বক্স (box)</option>
                  <option value="doz">ডজন (doz)</option>
                  <option value="pound">পাউন্ড (Pound)</option>
                  <option value="gram">গ্রাম (gram)</option>
                  <option value="liter">লিটার (Liter)</option>
                  <option value="slice">স্লাইস (Slice)</option>
                  <option value="tray">ট্রে (Tray)</option>
                  <option value="jar">জার (Jar)</option>
                  <option value="bosta">বস্তা (Sack)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">তারিখ</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">স্ট্যাটাস</label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Completed"
                    checked={formData.status === "Completed"}
                    onChange={handleInputChange}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>সম্পন্ন</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="In Progress"
                    checked={formData.status === "In Progress"}
                    onChange={handleInputChange}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>চলমান</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">নোট (ঐচ্ছিক)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="অতিরিক্ত তথ্য..."
              />
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
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
                ) : "সেভ করুন"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
