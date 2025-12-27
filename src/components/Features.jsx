export default function Features() {
  const features = [
    {
      title: "Daily Production Tracking",
      description: "আজ কী বানালেন, কত পিস — এক নজরে"
    },
    {
      title: "Expense Management",
      description: "ময়দা, চিনি, ডিম — কোথায় কত খরচ হলো"
    },
    {
      title: "Sales & Due Tracking",
      description: "কাকে কত বিক্রি করলেন, কে কত টাকা বাকি রাখল"
    },
    {
      title: "Customer Ledger",
      description: "প্রতিটি কাস্টমারের হিসাব আলাদা করে দেখুন"
    },
    {
      title: "Profit Calculation",
      description: "দিন ও মাস শেষে লাভ–লোকসান পরিষ্কার হিসাব"
    },
    {
      title: "Simple Reports",
      description: "ঝামেলা ছাড়া রিপোর্ট"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          মূল বৈশিষ্ট্য
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border bg-white shadow-sm p-6"
            >
              <h3 className="text-2xl font-semibold leading-none tracking-tight text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

