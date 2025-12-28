"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Factory,
  ShoppingCart,
  Wallet,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Static navigation data
const NAV_ITEMS = [
  { label: "ড্যাশবোর্ড", href: "/dashboard", icon: LayoutDashboard },
  { label: "উৎপাদন", href: "/dashboard/production", icon: Factory },
  { label: "পণ্য", href: "/dashboard/products", icon: Package },
  { label: "বিক্রয়", href: "/dashboard/sales", icon: ShoppingCart },
  { label: "খরচ", href: "/dashboard/expense", icon: Wallet },
  { label: "কাস্টমার", href: "/dashboard/customers", icon: Users },
  { label: "লেজার", href: "/ledger", icon: BookOpen },
  { label: "রিপোর্ট", href: "/reports", icon: BarChart3 },
  { label: "কর্মচারী", href: "/dashboard/employees", icon: Users },
  {
    label: "সেটিংস",
    href: "/dashboard/settings",
    icon: Settings,
    submenu: [
      { label: "সাধারণ সেটিংস", href: "/dashboard/settings/general", icon: Settings },
      { label: "ইউজার ম্যানেজমেন্ট", href: "/dashboard/settings/users", icon: Users },
      { label: "রোল ম্যানেজমেন্ট", href: "/dashboard/settings/roles", icon: Shield },
    ],
  },
];

export default function Sidebar({
  isSidebarOpen,
  toggleSidebar,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isSubmenuActive = (item) => {
    return item.submenu?.some((subItem) => pathname.startsWith(subItem.href));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-20",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Bakery Name / Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {isSidebarOpen ? (
            <span className="font-bold text-xl text-indigo-600 truncate">
              বেকারি সিস্টেম
            </span>
          ) : (
            <span className="font-bold text-xl text-indigo-600 mx-auto">
              BS
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {isSidebarOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || isSubmenuActive(item);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isSubmenuOpen = openSubmenus[item.label] || isSubmenuActive(item);

              return (
                <div key={item.label}>
                  <Link
                    href={hasSubmenu ? "#" : item.href}
                    onClick={(e) => {
                      if (hasSubmenu) {
                        e.preventDefault();
                        if (isSidebarOpen) toggleSubmenu(item.label);
                      }
                    }}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group justify-between",
                      isActive && !hasSubmenu
                        ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <div className="flex items-center">
                      <item.icon
                        size={20}
                        className={cn(
                          "flex-shrink-0 transition-colors",
                          isActive
                            ? "text-indigo-600"
                            : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />
                      {isSidebarOpen && (
                        <span className="ml-3 truncate">{item.label}</span>
                      )}
                    </div>
                    {isSidebarOpen && hasSubmenu && (
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          isSubmenuOpen ? "transform rotate-180" : ""
                        )}
                      />
                    )}
                  </Link>

                  {/* Submenu */}
                  {isSidebarOpen && hasSubmenu && isSubmenuOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                      {item.submenu.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
                              isSubActive
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                          >
                            {subItem.icon && <subItem.icon size={16} className="mr-2" />}
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Total Due */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          {isSidebarOpen ? (
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                আজকের মোট বাকি
              </p>
              <p className="text-lg font-bold text-red-500">৳ ৫,৪৩০</p>
            </div>
          ) : (
            <div className="flex justify-center" title="আজকের মোট বাকি: ৳ ৫,৪৩০">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                ৳
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Bottom Drawer */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out transform md:hidden flex flex-col max-h-[85vh] font-kalpurush",
          isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />
        <div className="px-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-800">মেনু</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 grid grid-cols-2 gap-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl transition-all border",
                  isActive
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                    : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200"
                )}
              >
                <item.icon
                  size={24}
                  className={cn(
                    "mb-2",
                    isActive ? "text-indigo-600" : "text-gray-400"
                  )}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-500 font-medium">
              আজকের মোট বাকি
            </span>
            <span className="text-base font-bold text-red-500">৳ ৫,৪৩০</span>
          </div>
        </div>
      </div>
    </>
  );
}
