import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Bakery Management
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              আপনার bakery এর সব হিসাব এক জায়গায়। প্রতিদিনের উৎপাদন, খরচ, বিক্রি এবং লাভ-লোকসান সহজেই ট্র্যাক করুন।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              System Info
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>মোবাইল ও কম্পিউটার</li>
              <li>অফলাইন কাজ করে</li>
              <li>সহজ ব্যবহার</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
              © {new Date().getFullYear()} Bakery Management System. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

