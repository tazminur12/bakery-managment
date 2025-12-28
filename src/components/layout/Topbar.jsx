"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, Calendar, User, LogOut, Settings, ChevronDown } from "lucide-react";
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
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-10 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu size={24} />
        </button>

        <h1 className="text-xl font-semibold text-gray-800 truncate">
       আমির হামজা বেকারি সিস্টেম
        </h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden sm:flex items-center text-sm text-gray-500 gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <Calendar size={16} className="text-gray-400" />
          <span>{today}</span>
        </div>

        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none">
                {session?.user?.name || "Guest User"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {session?.user?.email || "Visitor"}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 overflow-hidden">
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
            <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || "Guest User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || "Visitor"}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={16} className="mr-3" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings/general"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings size={16} className="mr-3" />
                  Settings
                </Link>
              </div>

              <div className="border-t border-gray-100 my-1" />

              <div className="py-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
