"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors">
              Bakery Management
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="#features" 
              className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Features
            </Link>

            {session ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
                >
                  <LayoutDashboard size={16} className="mr-2" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 overflow-hidden">
                        {session.user?.image ? (
                            <img src={session.user.image} alt="User" className="h-full w-full object-cover" />
                        ) : (
                            <User size={16} />
                        )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                        {session.user?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/login" 
                className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
              aria-label="Menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
