"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingCart, Plus, Calendar, Search, Filter, Loader2, 
  Trash2, FileText, User, CreditCard, DollarSign, ChevronsUpDown, Check, X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [openCustomerCombobox, setOpenCustomerCombobox] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  // Form State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        console.log("Customers fetched:", data.customers); // Debug log
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales");
      if (response.ok) {
        const data = await response.json();
        setSales(data.sales || []);
      }
    } catch (err) {
      console.error("Failed to fetch sales:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const existingItemIndex = cartItems.findIndex(item => item._id === selectedProduct._id);
    
    if (existingItemIndex > -1) {
      const newCart = [...cartItems];
      newCart[existingItemIndex].quantity += Number(itemQuantity);
      newCart[existingItemIndex].subtotal = newCart[existingItemIndex].quantity * newCart[existingItemIndex].price;
      setCartItems(newCart);
    } else {
      setCartItems([...cartItems, {
        _id: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        unit: selectedProduct.unit,
        quantity: Number(itemQuantity),
        subtotal: Number(itemQuantity) * selectedProduct.price
      }]);
    }
    
    setSelectedProduct(null);
    setItemQuantity(1);
    setProductSearch("");
  };

  const removeFromCart = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError("কমপক্ষে একটি পণ্য যোগ করুন");
      return;
    }

    setLoading(true);
    setError("");

    const totalAmount = calculateTotal();
    const paid = paidAmount ? parseFloat(paidAmount) : 0;
    const due = totalAmount - paid;

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          items: cartItems,
          totalAmount,
          paidAmount: paid,
          dueAmount: due,
          paymentMethod,
          date: saleDate,
          notes
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create sale");
      }

      await fetchSales();
      setIsAddOpen(false);
      // Reset Form
      setCartItems([]);
      setCustomerName("");
      setPaidAmount("");
      setPaymentMethod("Cash");
      setNotes("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => 
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">বিক্রয় ব্যবস্থাপনা</h1>
          <p className="text-gray-500">দৈনিক বিক্রয় এবং ইনভয়েস ট্র্যাকিং</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          নতুন বিক্রয়
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">আজকের</span>
          </div>
          <p className="text-sm text-gray-500">মোট বিক্রয়</p>
          <h3 className="text-2xl font-bold text-gray-900">
            ৳ {sales
              .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
              .reduce((sum, s) => sum + s.totalAmount, 0)
              .toLocaleString()}
          </h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CreditCard size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">আজকের</span>
          </div>
          <p className="text-sm text-gray-500">নগদ গ্রহণ</p>
          <h3 className="text-2xl font-bold text-gray-900">
            ৳ {sales
              .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
              .reduce((sum, s) => sum + s.paidAmount, 0)
              .toLocaleString()}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FileText size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">সর্বমোট</span>
          </div>
          <p className="text-sm text-gray-500">বাকি</p>
          <h3 className="text-2xl font-bold text-gray-900">
            ৳ {sales.reduce((sum, s) => sum + s.dueAmount, 0).toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="গ্রাহকের নাম বা ইনভয়েস আইডি..."
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
                <th className="px-6 py-4">গ্রাহক</th>
                <th className="px-6 py-4">আইটেম</th>
                <th className="px-6 py-4">মোট টাকা</th>
                <th className="px-6 py-4">জমা</th>
                <th className="px-6 py-4">বাকি</th>
                <th className="px-6 py-4">পেমেন্ট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    কোনো বিক্রয় তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {sale.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sale.items.length} টি আইটেম
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ৳ {sale.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      ৳ {sale.paidAmount}
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      {sale.dueAmount > 0 ? `৳ ${sale.dueAmount}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sale.paymentMethod}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sale Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন বিক্রয় এন্ট্রি</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            {/* Product Selection Area */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
              <h3 className="font-medium text-gray-900">পণ্য যোগ করুন</h3>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="পণ্য খুঁজুন..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setOpenCombobox(true);
                      setSelectedProduct(null);
                    }}
                    onFocus={() => setOpenCombobox(true)}
                  />
                  
                  {openCombobox && productSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map((product) => (
                        <div
                          key={product._id}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 flex justify-between"
                          onClick={() => {
                            setSelectedProduct(product);
                            setProductSearch(product.name);
                            setOpenCombobox(false);
                          }}
                        >
                          <span>{product.name}</span>
                          <span className="text-gray-500">৳{product.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <input
                  type="number"
                  min="1"
                  className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  placeholder="Qty"
                />
                
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={!selectedProduct}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  যোগ করুন
                </button>
              </div>
            </div>

            {/* Cart Items */}
            {cartItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-4 py-2">পণ্য</th>
                      <th className="px-4 py-2">দাম</th>
                      <th className="px-4 py-2">পরিমাণ</th>
                      <th className="px-4 py-2">মোট</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cartItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">৳{item.price}</td>
                        <td className="px-4 py-2">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-2 font-medium">৳{item.subtotal}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right">সর্বমোট:</td>
                      <td className="px-4 py-2">৳{calculateTotal()}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Customer & Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-gray-700">গ্রাহকের নাম</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="গ্রাহক নির্বাচন করুন বা টাইপ করুন..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setCustomerSearch(e.target.value);
                      setOpenCustomerCombobox(true);
                    }}
                    onFocus={() => setOpenCustomerCombobox(true)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {customerName && (
                      <button 
                        type="button"
                        onClick={() => {
                          setCustomerName("");
                          setCustomerSearch("");
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <ChevronsUpDown size={16} className="text-gray-400" />
                  </div>
                </div>

                {openCustomerCombobox && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setOpenCustomerCombobox(false)} 
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          নতুন গ্রাহক হিসেবে যোগ হবে
                        </div>
                      ) : (
                        customers
                          .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))
                          .map((customer) => (
                            <div
                              key={customer._id}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 flex flex-col"
                              onClick={() => {
                                setCustomerName(customer.name);
                                setCustomerSearch(customer.name);
                                setOpenCustomerCombobox(false);
                              }}
                            >
                              <span className="font-medium text-gray-900">{customer.name}</span>
                              <span className="text-xs text-gray-500">{customer.phone}</span>
                            </div>
                          ))
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">তারিখ</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">জমা (Paid)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">পেমেন্ট মেথড</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>
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
                disabled={loading || cartItems.length === 0}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={18} />
                    প্রসেসিং...
                  </div>
                ) : "বিক্রয় সম্পন্ন করুন"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
                  </div>
                ) : "বিক্রয় সম্পন্ন করুন"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
