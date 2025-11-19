import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/10" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-light text-brand-light mb-8 tracking-tight leading-tight">
            LET'S CREATE<br />
            TOGETHER.
          </h2>
          
          <p className="text-lg md:text-xl text-brand-gray mb-12 max-w-2xl mx-auto leading-relaxed">
            Ready to bring your vision to life? Let's collaborate on something extraordinary.
          </p>
          
          <Button
            size="lg"
            className="group bg-brand-light text-brand-dark hover:bg-primary hover:text-brand-dark transition-elegant px-12 py-6 text-sm font-medium tracking-widest"
          >
            START A PROJECT
            <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};