import { SearchIcon, CalendarIcon, StarIcon, MapPinIcon } from "lucide-react";

const steps = [
  {
    icon: <SearchIcon className="w-8 h-8 text-blue-600" />,
    title: "Search",
    desc: "Find hotels, cars, tickets, and activities tailored to your needs.",
  },
  {
    icon: <CalendarIcon className="w-8 h-8 text-purple-600" />,
    title: "Book",
    desc: "Reserve your spot instantly with our seamless booking system.",
  },
  {
    icon: <MapPinIcon className="w-8 h-8 text-green-600" />,
    title: "Explore",
    desc: "Enjoy your trip and discover the best of Hargeisa with ease.",
  },
  {
    icon: <StarIcon className="w-8 h-8 text-yellow-500" />,
    title: "Review",
    desc: "Share your experience and help others plan their journey.",
  },
];

const HowItWorks = () => (
  <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto max-w-6xl">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
          How It Works
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Plan, book, and experience Hargeisa in a few simple steps
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">{step.icon}</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks; 