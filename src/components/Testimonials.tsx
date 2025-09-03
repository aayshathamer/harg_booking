import { StarIcon } from "lucide-react";

const testimonials = [
  {
    name: "Amina H.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    review: "Hargeisa Vibes made my trip so easy! The hotel and car booking was seamless and the recommendations were spot on.",
    rating: 5,
  },
  {
    name: "Mohamed A.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    review: "I loved the activities section. Found things to do I never would have discovered on my own!",
    rating: 4,
  },
  {
    name: "Fatima Y.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    review: "The site is beautiful and easy to use. I'll definitely use it again for my next visit to Hargeisa!",
    rating: 5,
  },
];

const Testimonials = () => (
  <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto max-w-6xl">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
          What Our Users Say
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Real stories from real travelers
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center max-w-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
            <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-full mb-4 object-cover border-4 border-blue-100 dark:border-blue-900" />
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{t.name}</h3>
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, idx) => (
                <StarIcon key={idx} className={`w-4 h-4 ${idx < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">"{t.review}"</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials; 