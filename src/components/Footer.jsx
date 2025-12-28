"use client";

import Link from "next/link";
import { Sparkles, Home, Zap, Smartphone, Shield, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                হামজা বেকারি
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              আপনার bakery এর সব হিসাব এক জায়গায়। প্রতিদিনের উৎপাদন, খরচ, বিক্রি এবং লাভ-লোকসান সহজেই ট্র্যাক করুন।
            </p>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center hover:bg-indigo-500/30 transition-colors cursor-pointer">
                <Shield size={16} className="text-indigo-300" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 backdrop-blur-sm flex items-center justify-center hover:bg-purple-500/30 transition-colors cursor-pointer">
                <Smartphone size={16} className="text-purple-300" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 backdrop-blur-sm flex items-center justify-center hover:bg-pink-500/30 transition-colors cursor-pointer">
                <Zap size={16} className="text-pink-300" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Home size={16} className="text-indigo-400" />
              দ্রুত লিংক
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-300 hover:text-indigo-300 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>হোম</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-sm text-gray-300 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>বৈশিষ্ট্য</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-300 hover:text-pink-300 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>লগইন</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* System Info */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-purple-400" />
              সিস্টেম তথ্য
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <span>মোবাইল ও কম্পিউটার</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span>অফলাইন কাজ করে</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span>সহজ ব্যবহার</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Mail size={16} className="text-pink-400" />
              যোগাযোগ
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2 hover:text-indigo-300 transition-colors cursor-pointer">
                <Mail size={14} className="text-indigo-400" />
                <span>support@bakery.com</span>
              </li>
              <li className="flex items-center gap-2 hover:text-purple-300 transition-colors cursor-pointer">
                <Phone size={14} className="text-purple-400" />
                <span>+৮৮০ ১XXX-XXXXXX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} হামজা বেকারি সিস্টেম। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-gray-300 hover:text-indigo-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                লগইন
              </Link>
              <div className="h-4 w-px bg-white/20"></div>
              <Link
                href="#features"
                className="text-sm text-gray-300 hover:text-purple-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                বৈশিষ্ট্য
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
