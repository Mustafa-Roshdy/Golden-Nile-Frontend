import { Button } from "@/components/ui/button";
import aswanImage from "@/assets/aswan-sunset.jpg";
import { useNavigate } from "react-router-dom";
import RequireAuth from "@/components/RequireAuth";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={aswanImage}
          alt="Sunset on the Nile"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Experience
            <br />
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Ancient Egypt?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10">
            Start planning your unforgettable journey through Luxor & Aswan today. 
            Our expert team is here to create your perfect Egyptian adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RequireAuth onAuthed={() => navigate('/trip')}>
              <Button size="lg" className="text-lg px-8 py-6">
                Plan Your Trip Now
              </Button>
            </RequireAuth>

            {/* <RequireAuth>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-foreground">
                Speak to an Expert
              </Button>
            </RequireAuth> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
