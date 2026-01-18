import { MessageCircle, Users, Camera, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const CommunitySection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    members: 0,
    photos: 0,
    stories: 0
  });
  const sectionRef = useRef<HTMLElement>(null);

  const targetCounts = {
    members: 1000,
    photos: 611,
    stories: 598
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
      if (entry.isIntersecting) {
          setIsVisible(true);
          setCounts({ members: 0, photos: 0, stories: 0 });
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounts({
        members: Math.floor(targetCounts.members * progress),
        photos: Math.floor(targetCounts.photos * progress),
        stories: Math.floor(targetCounts.stories * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounts(targetCounts);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="flex -space-x-4">
                <div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border-4 border-background flex items-center justify-center"
                  style={{ animation: 'float-up 3s ease-in-out infinite' }}
                >
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-background flex items-center justify-center"
                  style={{ animation: 'float-down 3s ease-in-out infinite' }}
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 border-4 border-background flex items-center justify-center"
                  style={{ animation: 'float-up 3s ease-in-out infinite 0.5s' }}
                >
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-teal-500 border-4 border-background flex items-center justify-center"
                  style={{ animation: 'float-down 3s ease-in-out infinite 0.5s' }}
                >
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our <span className="text-primary">Travel Community</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with fellow travelers exploring Luxor & Aswan. Share your experiences, 
            get insider tips, and inspire your next Egyptian adventure.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {counts.members.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {counts.photos.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Shared Photos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {counts.stories.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Travel Stories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>

          <Link to="/community">
            <Button size="lg" className="text-lg px-8 py-6">
              Explore Community
            </Button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-down {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }
      `}</style>
    </section>
  );
};

export default CommunitySection;
