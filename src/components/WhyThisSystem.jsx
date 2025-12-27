export default function WhyThisSystem() {
  const benefits = [
    "ছোট ও মাঝারি bakery জন্য বানানো",
    "সহজ ব্যবহার",
    "মোবাইল ও কম্পিউটার দুটোতেই চলে",
    "ইন্টারনেট না থাকলেও কাজ করে (PWA)"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          কেন এই সিস্টেম
        </h2>
        <ul className="space-y-4 text-lg text-gray-700">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-3 text-gray-900">•</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

