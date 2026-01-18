import templeImage from "@/assets/hero-luxor.jpg";
import nubianImage from "@/assets/nubian-village.jpg";
import cuisineImage from "@/assets/egyptian-cuisine.jpg";

const experiences = [
  {
    title: "Pharaonic Temples",
    description: "Walk through 3,000 years of history at magnificent temple complexes",
    image: templeImage,
    facts: [
      "Karnak Temple covers 200 acres",
      "134 massive columns in the Hypostyle Hall",
      "Hieroglyphics tell ancient stories",
    ],
  },
  {
    title: "Nubian Culture",
    description: "Discover the vibrant traditions of the Nubian people",
    image: nubianImage,
    facts: [
      "Colorful painted houses",
      "Traditional music & dance",
      "Authentic handicrafts",
    ],
  },
  {
    title: "Egyptian Cuisine",
    description: "Savor the rich flavors of authentic Egyptian food",
    image: cuisineImage,
    facts: [
      "Traditional koshari & falafel",
      "Fresh Nile fish specialties",
      "Sweet basbousa & kunafa",
    ],
  },
];

const CulturalSection = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Cultural & <span className="text-primary">Travel Experiences</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Immerse yourself in the rich heritage and traditions of ancient and modern Egypt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="group animate-scale-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative h-80 rounded-2xl overflow-hidden mb-6 shadow-lg">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {exp.title}
                  </h3>
                  <p className="text-white/90">
                    {exp.description}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {exp.facts.map((fact, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-muted-foreground">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CulturalSection;
