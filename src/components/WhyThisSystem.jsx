"use client";
import { CheckCircle2, Smartphone, Zap, WifiOff } from "lucide-react";

export default function WhyThisSystem() {
  const benefits = [
    {
      icon: CheckCircle2,
      text: "ছোট ও মাঝারি bakery জন্য বানানো",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: Zap,
      text: "সহজ ব্যবহার",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Smartphone,
      text: "মোবাইল ও কম্পিউটার দুটোতেই চলে",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: WifiOff,
      text: "ইন্টারনেট না থাকলেও কাজ করে (PWA)",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            কেন এই সিস্টেম
          </h2>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            আপনার ব্যবসার জন্য সেরা সমাধান
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-white/20"
              >
                <div className="flex items-start gap-3">
                  <div className={`${benefit.bgColor} ${benefit.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-base font-semibold text-gray-900 leading-relaxed">
                      {benefit.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
            <p className="text-white text-lg font-semibold mb-3">
              এখনই শুরু করুন আপনার ব্যবসার ডিজিটাল রূপান্তর
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-medium">
                ✓ বিনামূল্যে
              </div>
              <div className="bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-medium">
                ✓ দ্রুত সেটআপ
              </div>
              <div className="bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-medium">
                ✓ ২৪/৭ সাপোর্ট
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
