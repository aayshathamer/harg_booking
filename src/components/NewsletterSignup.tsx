import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";

const NewsletterSignup = () => (
  <section className="py-20 px-4 bg-gradient-to-br from-background/80 to-accent/10 relative overflow-hidden">
    {/* Animated Futuristic Background */}
    <div className="absolute inset-0 pointer-events-none z-0">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-tr from-primary/30 via-accent/20 to-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full blur-2xl animate-float" />
    </div>
    <div className="container mx-auto px-4 flex justify-center relative z-10">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-xl p-12 flex flex-col items-center w-full max-w-xl relative animate-fade-in-float">
        {/* Futuristic Animated Border/Glow */}
        <div className="absolute inset-0 rounded-3xl border-2 border-accent/30 hover:border-accent/80 hover:shadow-neon pointer-events-none transition-all duration-300 animate-glow" />
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-move drop-shadow-neon text-center z-10 relative">
          <SparklesIcon className="inline w-8 h-8 text-accent animate-spin-slow mr-2" />
          Stay in the Loop
        </h2>
        <p className="text-muted-foreground mb-6 text-center z-10 relative">Subscribe to our newsletter for the latest deals, tips, and updates about Hargeisa.</p>
        <form className="flex w-full gap-2 z-10 relative">
          <Input type="email" placeholder="Enter your email" className="flex-1 bg-white/80" />
          <Button type="submit" className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 hover:scale-110 shadow-neon animate-pop">Subscribe</Button>
        </form>
      </div>
    </div>
  </section>
);

export default NewsletterSignup;
// Custom animations (add to your global CSS or tailwind.config.js):
// animate-glow, animate-fade-in-float, animate-pop, drop-shadow-neon, shadow-neon, futuristic-font 