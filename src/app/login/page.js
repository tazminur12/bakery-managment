"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন login করুন।");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email বা Password ভুল। আবার চেষ্টা করুন।");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <Navbar />
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-md w-full mx-auto">
          {/* Login Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 mb-3 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                লগইন করুন
              </h1>
              <p className="text-gray-600 text-xs">
                আপনার অ্যাকাউন্টে প্রবেশ করুন
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Success Message */}
              {success && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm">
                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm">
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Email বা Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 bg-white hover:border-gray-300 text-sm"
                    placeholder="আপনার email বা username দিন"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 bg-white hover:border-gray-300 text-sm"
                    placeholder="আপনার password দিন"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-xs text-gray-700 cursor-pointer"
                  >
                    আমাকে মনে রাখুন
                  </label>
                </div>

                <div className="text-xs">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Password ভুলে গেছেন?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2 text-sm"
              >
                <span>{loading ? "Login হচ্ছে..." : "Login করুন"}</span>
                {!loading && (
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </form>
          </div>

          {/* Features Card */}
          <div className="mt-4 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto mb-1.5">
                  <Sparkles size={16} className="text-indigo-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">সুরক্ষিত</p>
              </div>
              <div>
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-1.5">
                  <Lock size={16} className="text-purple-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">দ্রুত</p>
              </div>
              <div>
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center mx-auto mb-1.5">
                  <Mail size={16} className="text-pink-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">সহজ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
