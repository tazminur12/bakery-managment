export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      description: "প্রতিদিনের বানানো পণ্য লিখুন"
    },
    {
      number: 2,
      description: "খরচ ও বিক্রির হিসাব যোগ করুন"
    },
    {
      number: 3,
      description: "দিন শেষে লাভ ও বাকি দেখুন"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          কীভাবে কাজ করে
        </h2>
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="flex items-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold mr-4">
                {step.number}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-lg text-gray-900">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

