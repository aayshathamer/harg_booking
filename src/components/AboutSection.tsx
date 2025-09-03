                              const AboutSection = () => (
  <section className="py-16 bg-background/80">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-4xl font-bold mb-4 text-primary">Welcome to Hargeisa Vibes</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-xl">
          Your one-stop platform to discover, book, and experience the best of Hargeisa. From luxury hotels to local adventures, we make your journey seamless and memorable.
        </p>
        <button className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform">Learn More</button>
      </div>
      <div className="flex-1 flex justify-center">
        <img src="/public/placeholder.svg" alt="Hargeisa City" className="w-72 h-72 object-contain drop-shadow-xl" />
      </div>
    </div>
  </section>
);

export default AboutSection; 