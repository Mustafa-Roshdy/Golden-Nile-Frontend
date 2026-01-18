import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import templeImage from "@/assets/luxor-temple.jpg";
import cruiseImage from "@/assets/aswan-sunset.jpg";
import balloonsImage from "@/assets/balloons-luxor.jpg";
import nubianImage from "@/assets/nubian-village.jpg";

const attractions = [
  {
    title: "Ancient Temples",
    description: "Marvel at the timeless ancient wonders of Luxor and Aswan.",
    image: templeImage,
    highlights: ["3000+ years old", "UNESCO Sites", "Expert guides"],
  },
  {
    title: "Nile River Cruises",
    description: "Luxurious journey in Luxor and Aswan on the world's longest river",
    image: cruiseImage,
    highlights: ["5-star ships", "All inclusive", "Scenic views"],
  },
  {
    title: "Hot Air Balloon Rides",
    description: "Witness breathtaking sunrise views over the Valley of the Kings",
    image: balloonsImage,
    highlights: ["Sunrise flights", "Safe & certified", "Photo opportunities"],
  },
  {
    title: "Cultural Sites",
    description: "Experience vibrant Nubian villages and traditional Egyptian culture",
    image: nubianImage,
    highlights: ["Local cuisine", "Handicrafts", "Cultural shows"],
  },
];

const AttractionsSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true }, [
    Autoplay({ delay: 2000 }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [slidesInView, setSlidesInView] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setSlidesInView(emblaApi.slidesInView());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section id="destinations" className="py-20 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Top <span className="text-primary">Attractions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the most iconic landmarks and experiences in Luxor & Aswan
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Carousel Viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {attractions.map((attraction, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 pl-4"
                >
                  <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-[500px]">
                    <div className="relative h-full overflow-hidden">
                      <img
                        src={attraction.image}
                        alt={attraction.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                      <h3 className="text-3xl font-bold mb-3 drop-shadow-md">
                        {attraction.title}
                      </h3>
                      <p className="text-white/90 mb-4 text-lg line-clamp-2 drop-shadow-sm">
                        {attraction.description}
                      </p>
                      <div
                        className={`flex flex-wrap gap-2 mb-4 transition-opacity duration-300 delay-100 ${slidesInView.indexOf(index) > -1
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                          }`}
                      >
                        {attraction.highlights.map((highlight, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 z-10 hidden md:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 z-10 hidden md:flex"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Dot Navigation */}
        <div className="flex justify-center mt-8 gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === selectedIndex
                ? "bg-primary w-8"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AttractionsSection;
