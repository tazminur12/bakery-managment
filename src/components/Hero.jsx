import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Bakery Management System
        </h1>
        <p className="text-xl text-gray-700 mb-10 leading-relaxed">
          প্রতিদিন কী বানালেন, কত খরচ হলো, কাকে কত বিক্রি করলেন — সব এক জায়গায়
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            ড্যাশবোর্ডে যান
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            কী কী করা যাবে দেখুন
          </Link>
        </div>
      </div>
    </section>
  );
}

