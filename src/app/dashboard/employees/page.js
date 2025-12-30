"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Edit, Trash2, User, Phone, 
  Calendar, CreditCard, FileText, MapPin, 
  AlertCircle, Camera, Loader2, Users, Eye
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ROLES_LIST } from "@/lib/constants";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  // Image Handling
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const initialFormState = {
    name: "",
    phone: "",
    role: "Baker / Production Staff",
    salary: "",
    salaryPeriod: "monthly", // monthly, weekly, daily, custom
    salaryDays: "", // for custom period
    joiningDate: new Date().toISOString().split("T")[0],
    nid: "",
    address: "",
    emergencyContact: "",
    status: "active",
    image: null
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
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

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUploading(!!imageFile);
    setError("");

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: imageUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create employee");
      }

      await fetchEmployees();
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleEditClick = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
      salary: employee.salary,
      salaryPeriod: employee.salaryPeriod || "monthly",
      salaryDays: employee.salaryDays || "",
      joiningDate: new Date(employee.joiningDate).toISOString().split("T")[0],
      nid: employee.nid || "",
      address: employee.address || "",
      emergencyContact: employee.emergencyContact || "",
      status: employee.status,
      image: employee.image
    });
    setImagePreview(employee.image);
    setImageFile(null);
    setIsEditOpen(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUploading(!!imageFile);
    setError("");

    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const response = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentEmployee._id,
          ...formData,
          image: imageUrl
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update employee");
      }

      await fetchEmployees();
      setIsEditOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/employees?id=${currentEmployee._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      await fetchEmployees();
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">কর্মচারী</h1>
          <p className="text-gray-500">কর্মচারীর বিবরণ, বেতন এবং ভূমিকা পরিচালনা করুন</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          নতুন কর্মচারী যোগ করুন
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="নাম, আইডি (BK-2025-XXXX), বা ফোন দিয়ে অনুসন্ধান করুন..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p>কোনো কর্মচারী পাওয়া যায়নি</p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div key={employee._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                      {employee.image ? (
                        <img src={employee.image} alt={employee.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-50">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{employee.name}</h3>
                      <p className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        {employee.employeeId}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{employee.role}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.status === 'active' ? 'bg-green-100 text-green-700' : employee.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {employee.status === 'active' ? 'সক্রিয়' : employee.status === 'inactive' ? 'নিষ্ক্রিয়' : 'বরখাস্ত'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>যোগদান: {new Date(employee.joiningDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">
                      ৳ {employee.salary.toLocaleString()}
                      <span className="text-xs text-gray-500 ml-1">
                        ({employee.salaryPeriod === "monthly" ? "মাসিক" : 
                          employee.salaryPeriod === "weekly" ? "সাপ্তাহিক" : 
                          employee.salaryPeriod === "daily" ? "দৈনিক" : 
                          `${employee.salaryDays || ""} দিন`})
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                <Link
                  href={`/dashboard/employees/${employee._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  title="বিস্তারিত দেখুন"
                >
                  <Eye size={16} /> বিস্তারিত
                </Link>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(employee)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                  >
                    <Edit size={16} /> এডিট
                  </button>
                  <button 
                    onClick={() => { setCurrentEmployee(employee); setIsDeleteOpen(true); }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 size={16} /> মুছে ফেলুন
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "কর্মচারী এডিট করুন" : "নতুন কর্মচারী যোগ করুন"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={isEditOpen ? handleUpdateEmployee : handleAddEmployee} className="space-y-6 py-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            {/* Image Upload */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 shadow-sm">
                  <Camera size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">পূর্ণ নাম *</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="কর্মচারীর নাম"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ফোন নম্বর *</label>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ভূমিকা *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {ROLES_LIST.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">বেতন পরিমাণ *</label>
                <input
                  required
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">বেতন পিরিয়ড *</label>
                <select
                  required
                  name="salaryPeriod"
                  value={formData.salaryPeriod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="monthly">মাসিক (Monthly)</option>
                  <option value="weekly">সাপ্তাহিক (Weekly)</option>
                  <option value="daily">দৈনিক (Daily)</option>
                  <option value="custom">কাস্টম দিন (Custom Days)</option>
                </select>
              </div>

              {formData.salaryPeriod === "custom" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">দিন সংখ্যা *</label>
                  <input
                    required={formData.salaryPeriod === "custom"}
                    type="number"
                    min="1"
                    name="salaryDays"
                    value={formData.salaryDays}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="যেমন: 15, 20, 30"
                  />
                  <p className="text-xs text-gray-500">কত দিন পর পর বেতন দেওয়া হবে</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">যোগদানের তারিখ *</label>
                <input
                  required
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">জাতীয় পরিচয়পত্র নম্বর</label>
                <input
                  name="nid"
                  value={formData.nid}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="জাতীয় পরিচয়পত্র নম্বর"
                />
              </div>

              <div className="col-span-full space-y-2">
                <label className="text-sm font-medium text-gray-700">ঠিকানা</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="বর্তমান ঠিকানা"
                  rows={2}
                />
              </div>

              <div className="col-span-full space-y-2">
                <label className="text-sm font-medium text-gray-700">জরুরি যোগাযোগ</label>
                <input
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="নাম ও ফোন"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">স্ট্যাটাস</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="active">সক্রিয়</option>
                  <option value="inactive">নিষ্ক্রিয়</option>
                  <option value="terminated">বরখাস্ত</option>
                </select>
              </div>
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
                {loading && <Loader2 className="animate-spin mr-2" size={18} />}
                {isEditOpen ? "কর্মচারী আপডেট করুন" : "কর্মচারী তৈরি করুন"}
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
          <DialogTitle className="text-xl font-bold mb-2">কর্মচারী মুছে ফেলবেন?</DialogTitle>
          <p className="text-gray-500 mb-6">
            আপনি কি নিশ্চিত যে আপনি <strong>{currentEmployee?.name}</strong> মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              বাতিল
            </button>
            <button
              onClick={handleDeleteEmployee}
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
