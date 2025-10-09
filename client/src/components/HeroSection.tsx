import { Button } from "@/components/ui/button";
import { Leaf, ArrowRight, Recycle, Users } from "lucide-react";
import heroImage from "@assets/stock_images/goa_india_coastal_be_f1b6d957.jpg";

interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export default function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
  return (
    <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Leaf className="w-12 h-12 text-primary" />
          <h1 className="text-5xl md:text-6xl font-bold">
            CircularGoa
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl mb-4 text-white/90">
          Goa's Circular Economy Hub for Small Businesses
        </p>
        
        <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">
          Connect with local businesses to exchange waste and surplus materials. 
          Reduce landfill, save costs, and build a sustainable future together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary-border gap-2 backdrop-blur-sm"
            data-testid="button-hero-get-started"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onLearnMore}
            className="backdrop-blur-sm bg-white/20 border-white/40 text-white hover:bg-white/30"
            data-testid="button-hero-learn-more"
          >
            Learn More
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
            <Recycle className="w-8 h-8 text-primary mb-2 mx-auto" />
            <h3 className="font-semibold mb-1">Reduce Waste</h3>
            <p className="text-sm text-white/80">Divert materials from landfills</p>
          </div>
          <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
            <Users className="w-8 h-8 text-accent mb-2 mx-auto" />
            <h3 className="font-semibold mb-1">Build Community</h3>
            <p className="text-sm text-white/80">Connect with local businesses</p>
          </div>
          <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
            <Leaf className="w-8 h-8 text-primary mb-2 mx-auto" />
            <h3 className="font-semibold mb-1">Save Resources</h3>
            <p className="text-sm text-white/80">Lower costs and emissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
