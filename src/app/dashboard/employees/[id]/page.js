"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { 
  ArrowLeft, Loader2, User, Phone, MapPin, 
  CreditCard, DollarSign, Calendar, FileText, Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function EmployeeDetailsPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSalaryPaymentOpen, setIsSalaryPaymentOpen] = useState(false);
  
  // Salary Payment State
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryPaymentMethod, setSalaryPaymentMethod] = useState("Cash");
  const [salaryPaymentDate, setSalaryPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [salaryPaymentMonth, setSalaryPaymentMonth] = useState(new Date().getMonth() + 1);
  const [salaryPaymentYear, setSalaryPaymentYear] = useState(new Date().getFullYear());
  const [salaryPaymentNotes, setSalaryPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch employee details");
      }
      const data = await response.json();
      setEmployee(data.employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleSalaryPaymentClick = () => {
    if (employee) {
      setSalaryAmount(employee.salary?.toString() || "");
      setSalaryPaymentMethod("Cash");
      setSalaryPaymentDate(new Date().toISOString().split("T")[0]);
      setSalaryPaymentMonth(new Date().getMonth() + 1);
      setSalaryPaymentYear(new Date().getFullYear());
      setSalaryPaymentNotes("");
      setIsSalaryPaymentOpen(true);
    }
  };

  const handleSalaryPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!employee || !salaryAmount || parseFloat(salaryAmount) <= 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/salary-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee._id,
          amount: parseFloat(salaryAmount),
          paymentMethod: salaryPaymentMethod,
          paymentDate: salaryPaymentDate,
          month: parseInt(salaryPaymentMonth),
          year: parseInt(salaryPaymentYear),
          notes: salaryPaymentNotes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to record salary payment");
      }

      // Refresh employee data
      await fetchEmployee();
      setIsSalaryPaymentOpen(false);
      setSalaryAmount("");
      setSalaryPaymentNotes("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = ["জানুয়ারী", "ফেব্রুয়ারী", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    return months[month - 1] || month;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Employee not found"}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
          <p className="text-gray-500 text-sm">কর্মচারীর প্রোফাইল এবং বেতন ইতিহাস</p>
        </div>
      </div>

      {/* Info & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employee Info Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm md:col-span-1 h-fit">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden">
              {employee.image ? (
                <img src={employee.image} alt={employee.name} className="h-full w-full object-cover" />
              ) : (
                <User size={32} />
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">{employee.name}</h2>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {employee.employeeId}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={18} className="text-gray-400" />
              <span>{employee.phone}</span>
            </div>
            {employee.address && (
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-gray-400" />
                <span>{employee.address}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <FileText size={18} className="text-gray-400" />
              <span>{employee.role}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar size={18} className="text-gray-400" />
              <span>যোগদান: {new Date(employee.joiningDate).toLocaleDateString()}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">মাসিক বেতন:</span>
                <span className="font-bold text-indigo-600">৳ {employee.salary?.toLocaleString() || 0}</span>
              </div>
            </div>
            <div className="pt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {employee.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <CreditCard size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-500">মোট পরিশোধিত</p>
            <h3 className="text-xl font-bold text-gray-900">
              ৳ {employee.stats?.totalPaid?.toLocaleString() || 0}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <DollarSign size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-500">মোট পেমেন্ট</p>
            <h3 className="text-xl font-bold text-green-600">
              {employee.stats?.totalPayments || 0} বার
            </h3>
          </div>
        </div>
      </div>

      {/* Salary Payment History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            বেতন পরিশোধের ইতিহাস
          </h3>
          <button
            onClick={handleSalaryPaymentClick}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <DollarSign size={16} />
            নতুন বেতন পরিশোধ
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4">মাস/বছর</th>
                <th className="px-6 py-4">পরিমাণ</th>
                <th className="px-6 py-4">পেমেন্ট মেথড</th>
                <th className="px-6 py-4">নোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employee.salaryHistory?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    কোনো বেতন পরিশোধের তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                employee.salaryHistory?.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getMonthName(payment.month)} {payment.year}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ৳ {payment.amount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {payment.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Payment Dialog */}
      <Dialog open={isSalaryPaymentOpen} onOpenChange={setIsSalaryPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>বেতন পরিশোধ করুন</DialogTitle>
          </DialogHeader>
          
          {employee && (
            <form onSubmit={handleSalaryPaymentSubmit} className="space-y-4 py-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">কর্মচারীর নাম:</span>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">মাসিক বেতন:</span>
                  <span className="font-medium">৳{employee.salary?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employee ID:</span>
                  <span className="font-mono text-xs">{employee.employeeId}</span>
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
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="পরিমাণ লিখুন"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    মাস
                  </label>
                  <select
                    value={salaryPaymentMonth}
                    onChange={(e) => setSalaryPaymentMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="1">জানুয়ারী</option>
                    <option value="2">ফেব্রুয়ারী</option>
                    <option value="3">মার্চ</option>
                    <option value="4">এপ্রিল</option>
                    <option value="5">মে</option>
                    <option value="6">জুন</option>
                    <option value="7">জুলাই</option>
                    <option value="8">আগস্ট</option>
                    <option value="9">সেপ্টেম্বর</option>
                    <option value="10">অক্টোবর</option>
                    <option value="11">নভেম্বর</option>
                    <option value="12">ডিসেম্বর</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    বছর
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    value={salaryPaymentYear}
                    onChange={(e) => setSalaryPaymentYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পরিশোধের তারিখ
                </label>
                <input
                  type="date"
                  value={salaryPaymentDate}
                  onChange={(e) => setSalaryPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পেমেন্ট মেথড
                </label>
                <select
                  value={salaryPaymentMethod}
                  onChange={(e) => setSalaryPaymentMethod(e.target.value)}
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
                  value={salaryPaymentNotes}
                  onChange={(e) => setSalaryPaymentNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="ট্রানজেকশন বা নোট লিখুন"
                />
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsSalaryPaymentOpen(false)}
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

