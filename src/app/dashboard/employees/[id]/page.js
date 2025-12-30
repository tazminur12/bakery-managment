"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { 
  ArrowLeft, Loader2, User, Phone, MapPin, 
  CreditCard, DollarSign, Calendar, FileText, Eye,
  AlertCircle, TrendingUp
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
  const [isAdvancePaymentOpen, setIsAdvancePaymentOpen] = useState(false);
  
  // Salary Payment State
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryPaymentMethod, setSalaryPaymentMethod] = useState("Cash");
  const [salaryPaymentDate, setSalaryPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [salaryPaymentMonth, setSalaryPaymentMonth] = useState(new Date().getMonth() + 1);
  const [salaryPaymentYear, setSalaryPaymentYear] = useState(new Date().getFullYear());
  const [salaryPaymentNotes, setSalaryPaymentNotes] = useState("");
  const [paymentType, setPaymentType] = useState("full"); // "full" or "advance"
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
      setPaymentType("full");
      setIsSalaryPaymentOpen(true);
    }
  };

  const handleAdvancePaymentClick = () => {
    if (employee) {
      const balanceInfo = calculateBalance();
      setSalaryAmount(balanceInfo.balance > 0 ? balanceInfo.balance.toString() : "");
      setSalaryPaymentMethod("Cash");
      setSalaryPaymentDate(new Date().toISOString().split("T")[0]);
      setSalaryPaymentMonth(new Date().getMonth() + 1);
      setSalaryPaymentYear(new Date().getFullYear());
      setSalaryPaymentNotes("");
      setPaymentType("advance");
      setIsAdvancePaymentOpen(true);
    }
  };

  // Calculate balance based on salary period
  const calculateBalance = () => {
    if (!employee) return { balance: 0, totalPaid: 0, periodLabel: "" };
    
    const salaryPeriod = employee.salaryPeriod || "monthly";
    const salary = employee.salary || 0;
    let periodStart, periodEnd, periodLabel;
    const now = new Date();
    
    if (salaryPeriod === "monthly") {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      periodLabel = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
    } else if (salaryPeriod === "weekly") {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
      periodStart = new Date(now.setDate(diff));
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
      periodLabel = `Week of ${periodStart.toLocaleDateString()}`;
    } else if (salaryPeriod === "daily") {
      periodStart = new Date(now);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(now);
      periodEnd.setHours(23, 59, 59, 999);
      periodLabel = now.toLocaleDateString();
    } else if (salaryPeriod === "custom" && employee.salaryDays) {
      // For custom, calculate based on days since joining or last payment
      const days = parseInt(employee.salaryDays);
      // Get last payment date or joining date
      const lastPayment = employee.salaryHistory?.[0];
      const baseDate = lastPayment ? new Date(lastPayment.paymentDate) : new Date(employee.joiningDate);
      const daysSinceBase = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24));
      const periodsSinceBase = Math.floor(daysSinceBase / days);
      periodStart = new Date(baseDate);
      periodStart.setDate(baseDate.getDate() + (periodsSinceBase * days));
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + days - 1);
      periodEnd.setHours(23, 59, 59, 999);
      periodLabel = `${days} দিন`;
    } else {
      // Default to monthly
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      periodLabel = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
    }
    
    const periodPayments = employee.salaryHistory?.filter(p => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate >= periodStart && paymentDate <= periodEnd;
    }) || [];
    
    const totalPaidThisPeriod = periodPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const balance = salary - totalPaidThisPeriod;
    
    return { 
      balance: Math.max(0, balance), 
      totalPaid: totalPaidThisPeriod,
      periodLabel 
    };
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
          notes: salaryPaymentNotes,
          paymentType: paymentType || "full"
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to record salary payment");
      }

      // Refresh employee data
      await fetchEmployee();
      setIsSalaryPaymentOpen(false);
      setIsAdvancePaymentOpen(false);
      setSalaryAmount("");
      setSalaryPaymentNotes("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancePaymentSubmit = async (e) => {
    e.preventDefault();
    await handleSalaryPaymentSubmit(e);
  };

  const balanceInfo = calculateBalance();

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
      <div className="text-center py-8 sm:py-12">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Employee Info Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm md:col-span-1 h-fit">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden">
              {employee.image ? (
                <img src={employee.image} alt={employee.name} className="h-full w-full object-cover" />
              ) : (
                <User size={32} />
              )}
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-gray-900 truncate">{employee.name}</h2>
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
                <span className="text-sm text-gray-500">
                  {employee.salaryPeriod === "monthly" ? "মাসিক" : 
                   employee.salaryPeriod === "weekly" ? "সাপ্তাহিক" : 
                   employee.salaryPeriod === "daily" ? "দৈনিক" : 
                   `${employee.salaryDays || ""} দিন`} বেতন:
                </span>
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
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
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

          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
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

          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${
                balanceInfo.balance > 0 ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
              }`}>
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="text-sm text-gray-500">বর্তমান পিরিয়ডের বাকি</p>
            <h3 className={`text-xl font-bold ${
              balanceInfo.balance > 0 ? "text-orange-600" : "text-green-600"
            }`}>
              ৳ {balanceInfo.balance.toLocaleString()}
            </h3>
            {balanceInfo.totalPaid > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                পরিশোধিত: ৳{balanceInfo.totalPaid.toLocaleString()}
              </p>
            )}
            {balanceInfo.periodLabel && (
              <p className="text-xs text-gray-400 mt-1">
                {balanceInfo.periodLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Salary Payment History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            বেতন পরিশোধের ইতিহাস
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleAdvancePaymentClick}
              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Advance Payment
            </button>
            <button
              onClick={handleSalaryPaymentClick}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <DollarSign size={16} />
              Full Salary
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4">মাস/বছর</th>
                <th className="px-6 py-4">পরিমাণ</th>
                <th className="px-6 py-4">টাইপ</th>
                <th className="px-6 py-4">পেমেন্ট মেথড</th>
                <th className="px-6 py-4">নোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employee.salaryHistory?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.paymentType === "advance" 
                          ? "bg-orange-100 text-orange-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {payment.paymentType === "advance" ? "Advance" : "Full Salary"}
                      </span>
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

      {/* Advance Payment Dialog */}
      <Dialog open={isAdvancePaymentOpen} onOpenChange={setIsAdvancePaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Advance Payment</DialogTitle>
          </DialogHeader>
          
          {employee && (
            <form onSubmit={handleAdvancePaymentSubmit} className="space-y-4 py-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              
              <div className="bg-orange-50 p-4 rounded-lg space-y-2 border border-orange-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">কর্মচারীর নাম:</span>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {employee.salaryPeriod === "monthly" ? "মাসিক" : 
                     employee.salaryPeriod === "weekly" ? "সাপ্তাহিক" : 
                     employee.salaryPeriod === "daily" ? "দৈনিক" : 
                     `${employee.salaryDays || ""} দিন`} বেতন:
                  </span>
                  <span className="font-medium">৳{employee.salary?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">বর্তমান পিরিয়ডে পরিশোধিত:</span>
                  <span className="font-medium">৳{balanceInfo.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-700">বাকি আছে:</span>
                  <span className="text-orange-600">৳{balanceInfo.balance.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advance পরিমাণ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balanceInfo.balance}
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Advance পরিমাণ"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  সর্বোচ্চ: ৳{balanceInfo.balance.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পরিশোধের তারিখ
                </label>
                <input
                  type="date"
                  value={salaryPaymentDate}
                  onChange={(e) => setSalaryPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Advance payment নোট..."
                />
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsAdvancePaymentOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading || parseFloat(salaryAmount) > balanceInfo.balance}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "পরিশোধ হচ্ছে..." : "Advance দিন"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Salary Payment Dialog */}
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
                  <span className="text-gray-600">
                    {employee.salaryPeriod === "monthly" ? "মাসিক" : 
                     employee.salaryPeriod === "weekly" ? "সাপ্তাহিক" : 
                     employee.salaryPeriod === "daily" ? "দৈনিক" : 
                     `${employee.salaryDays || ""} দিন`} বেতন:
                  </span>
                  <span className="font-medium">৳{employee.salary?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">বর্তমান পিরিয়ডে পরিশোধিত:</span>
                  <span className="font-medium">৳{balanceInfo.totalPaid.toLocaleString()}</span>
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
