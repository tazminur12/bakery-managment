"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
          <Sparkles size={16} className="text-indigo-600" />
          <span>স্মার্ট বেকারি ব্যবস্থাপনা সিস্টেম</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          হামজা বেকারি সিস্টেম
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed max-w-3xl mx-auto font-medium">
          প্রতিদিন কী বানালেন, কত খরচ হলো, কাকে কত বিক্রি করলেন — সব এক জায়গায়
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>ড্যাশবোর্ডে যান</span>
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            কী কী করা যাবে দেখুন
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-lg">
            <div className="text-2xl font-bold text-indigo-600 mb-1">১০০%</div>
            <div className="text-sm text-gray-600 font-medium">স্বয়ংক্রিয়</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">২৪/৭</div>
            <div className="text-sm text-gray-600 font-medium">অ্যাক্সেস</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-lg">
            <div className="text-2xl font-bold text-pink-600 mb-1">সহজ</div>
            <div className="text-sm text-gray-600 font-medium">ব্যবহার</div>
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
    </section>
  );
}
