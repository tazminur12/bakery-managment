"use client";
import { FileText, Calculator, TrendingUp, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: FileText,
      title: "উৎপাদন রেকর্ড করুন",
      description: "প্রতিদিনের বানানো পণ্য লিখুন",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      number: 2,
      icon: Calculator,
      title: "হিসাব যোগ করুন",
      description: "খরচ ও বিক্রির হিসাব যোগ করুন",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      number: 3,
      icon: TrendingUp,
      title: "লাভ দেখুন",
      description: "দিন শেষে লাভ ও বাকি দেখুন",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            কীভাবে কাজ করে
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            তিনটি সহজ ধাপে আপনার বেকারি ব্যবস্থাপনা শুরু করুন
          </p>
        </div>
        
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-30"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  <div className={`${step.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-${step.color.split('-')[1]}-200`}>
                    {/* Number Badge */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-xl mb-4 shadow-lg`}>
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`${step.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                      <Icon size={24} className={step.iconColor} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow (between steps) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-24 -right-4 z-10">
                      <ArrowRight size={32} className="text-purple-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
