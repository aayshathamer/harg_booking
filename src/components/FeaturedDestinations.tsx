import { MapPinIcon } from "lucide-react";

const destinations = [
  {
    name: "Naasa Hablood Hills",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    desc: "Iconic twin hills and a must-see natural wonder near Hargeisa.",
  },
  {
    name: "Hargeisa War Memorial",
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    desc: "A symbol of the city's resilience and a historical landmark.",
  },
  {
    name: "Laas Geel Caves",
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    desc: "Ancient cave paintings and a UNESCO heritage site.",
  },
  {
    name: "Livestock Market",
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    desc: "Experience the vibrant local culture at Africa's largest livestock market.",
  },
];

const FeaturedDestinations = () => (
  <section className="py-20 px-6 bg-white dark:bg-gray-900">
    <div className="container mx-auto max-w-6xl">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
          Featured Destinations
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the most popular places in Hargeisa
        </p>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {destinations.map((dest, i) => (
          <div key={i} className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
            <img src={dest.img} alt={dest.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
                {dest.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{dest.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedDestinations; 