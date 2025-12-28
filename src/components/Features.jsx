"use client";
import { 
  Package, 
  Wallet, 
  ShoppingCart, 
  BookOpen, 
  TrendingUp, 
  FileText,
  CheckCircle2
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Package,
      title: "দৈনিক উৎপাদন ট্র্র্যাকিং",
      description: "আজ কী বানালেন, কত পিস — এক নজরে",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Wallet,
      title: "খরচ ব্যবস্থাপনা",
      description: "ময়দা, চিনি, ডিম — কোথায় কত খরচ হলো",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      icon: ShoppingCart,
      title: "বিক্রয় ও বাকি ট্র্র্যাকিং",
      description: "কাকে কত বিক্রি করলেন, কে কত টাকা বাকি রাখল",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: BookOpen,
      title: "কাস্টমার লেজার",
      description: "প্রতিটি কাস্টমারের হিসাব আলাদা করে দেখুন",
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      icon: TrendingUp,
      title: "লাভের হিসাব",
      description: "দিন ও মাস শেষে লাভ–লোকসান পরিষ্কার হিসাব",
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    },
    {
      icon: FileText,
      title: "সরল রিপোর্ট",
      description: "ঝামেলা ছাড়া রিপোর্ট",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600"
    }
  ];

  return (
    <section id="features" className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium mb-4">
            <CheckCircle2 size={14} className="text-indigo-600" />
            <span>সম্পূর্ণ বৈশিষ্ট্য</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            মূল বৈশিষ্ট্য
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            আপনার বেকারি ব্যবস্থাপনার জন্য প্রয়োজনীয় সব কিছু একসাথে
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative ${feature.bgColor} rounded-2xl border-2 border-transparent hover:border-${feature.color.split('-')[1]}-200 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden`}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
