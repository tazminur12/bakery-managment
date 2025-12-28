"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, Calendar, User, LogOut, Settings, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Topbar({ toggleMobileMenu }) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Date indicator
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-10 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
            <Sparkles size={16} className="text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
            আমির হামজা বেকারি সিস্টেম
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden sm:flex items-center text-sm text-gray-600 gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
          <Calendar size={16} className="text-indigo-500" />
          <span className="font-medium">{today}</span>
        </div>

        <div className="h-8 w-px bg-gradient-to-b from-transparent via-indigo-200 to-transparent hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-indigo-50 p-1.5 rounded-lg transition-all duration-200 border border-transparent hover:border-indigo-200 hover:shadow-sm"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">
                {session?.user?.name || "Guest User"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {session?.user?.email || "Visitor"}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white border-2 border-white shadow-md overflow-hidden ring-2 ring-indigo-100">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="User"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={18} />
              )}
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden sm:block transition-transform duration-200" style={{
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-indigo-100 py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 sm:hidden">
                <p className="text-sm font-semibold text-gray-900">
                  {session?.user?.name || "Guest User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || "Visitor"}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={16} className="mr-3 text-indigo-500" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings/general"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings size={16} className="mr-3 text-purple-500" />
                  Settings
                </Link>
              </div>

              <div className="border-t border-gray-100 my-1" />

              <div className="py-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} className="mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
