import { User } from "lucide-react";
import egyptMap from "@/assets/EgyptMap.jpg";

const ExploreSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Map with Overlay */}
      <div className="absolute inset-0">
        <img
          src={egyptMap}
          alt="Map of Egypt highlighting Aswan and Luxor"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/15 to-background/40" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header Section */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold">
              Explore Aswan & Luxor <span className="text-primary">Your Way</span>
            </h2>
            {/* <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover Egypt's ancient wonders independently. No local guide needed – 
              just your curiosity and our platform to help you navigate, book, and experience 
              the magic of Aswan and Luxor.
            </p> */}
          </div>
        </div>

        {/* Pulsing City Markers */}
        {/* Aswan- positioned roughly in the middle-right */}
        <div 
          className="absolute top-[70%] right-[43%] transform -translate-x-1/2 -translate-y-1/2"
          style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
        >
          <div className="relative">
            {/* Outer ripple */}
            <div className="absolute inset-0 -m-8 rounded-full bg-primary/30 animate-ping" />
            {/* Middle glow */}
            <div className="absolute inset-0 -m-4 rounded-full bg-primary/50 blur-xl" />
            {/* Inner marker */}
            <div className="relative w-6 h-6 rounded-full bg-primary shadow-elevated border-4 border-white" />
            {/* Label */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm shadow-elevated rounded-xl px-4 py-2 whitespace-nowrap">
              <p className="text-sm font-bold">Aswan</p>
              <p className="text-xs text-muted-foreground">12 Attractions</p>
            </div>
          </div>
        </div>

        {/* Luxor - positioned roughly in the upper-middle */}
        <div 
          className="absolute top-[58%] right-[40%] transform -translate-x-1/2 -translate-y-1/2"
          style={{ animation: 'pulse-glow 3s ease-in-out infinite 1.5s' }}
        >
          <div className="relative">
            {/* Outer ripple */}
            <div className="absolute inset-0 -m-8 rounded-full bg-secondary/30 animate-ping" />
            {/* Middle glow */}
            <div className="absolute inset-0 -m-4 rounded-full bg-secondary/50 blur-xl" />
            {/* Inner marker */}
            <div className="relative w-6 h-6 rounded-full bg-secondary shadow-elevated border-4 border-white" />
            {/* Label */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm shadow-elevated rounded-xl px-4 py-2 whitespace-nowrap">
              <p className="text-sm font-bold">Luxor</p>
              <p className="text-xs text-muted-foreground">8 Experiences</p>
            </div>
          </div>
        </div>

        {/* Walking Characters Animation at Bottom */}
        <div className="pb-8">
          <div className="relative h-32 overflow-hidden">
            <div className="absolute inset-x-0 bottom-12 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            {/* Walking travelers */}
            <div className="relative h-full flex items-end justify-center">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="absolute bottom-16"
                  style={{
                    animation: `walk-across 20s linear infinite`,
                    animationDelay: `${index * 3.5}s`,
                    left: '-60px'
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-elevated">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex gap-1.5">
                      <div 
                        className="w-1.5 h-4 bg-primary/70 rounded-full"
                        style={{
                          animation: `step-left 0.6s ease-in-out infinite`,
                          animationDelay: `${index * 0.1}s`
                        }}
                      />
                      <div 
                        className="w-1.5 h-4 bg-primary/70 rounded-full"
                        style={{
                          animation: `step-right 0.6s ease-in-out infinite`,
                          animationDelay: `${index * 0.1 + 0.3}s`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Text */}
            <div className="text-center absolute bottom-0 left-0 right-0">
              <p className="text-sm md:text-base text-foreground/80 font-medium backdrop-blur-sm bg-background/30 py-2 px-4 rounded-full inline-block">
                Join thousands of independent travelers discovering Egypt
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes walk-across {
          0% {
            left: -60px;
          }
          100% {
            left: calc(100% + 60px);
          }
        }

        @keyframes step-left {
          0%, 100% {
            transform: scaleY(1);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(1.8);
            opacity: 1;
          }
        }

        @keyframes step-right {
          0%, 100% {
            transform: scaleY(1);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(1.8);
            opacity: 1;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default ExploreSection;