import { Home, Flame, MapPin, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  {
    id: 1,
    title: "Homes",
    icon: Home,
    badge: null
  },
  {
    id: 2,
    title: "Experiences",
    icon: Flame,
    badge: "NEW"
  },
  {
    id: 3,
    title: "Packages",
    icon: Package,
    badge: "NEW"
  }
];

const CategoryTiles = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: typeof CATEGORIES[0]) => {
    if (category.title === "Packages") {
      navigate("/packages");
    }
    // Add other category navigations if needed
  };

  return (
    <div className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8 py-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="group flex flex-col items-center gap-2 relative transition-all duration-300 hover:scale-105"
              >
                <div className="relative">
                  <Icon
                    className="w-6 h-6 text-muted-foreground transition-all duration-500 group-hover:rotate-12 group-hover:text-foreground"
                    strokeWidth={1.5}
                  />
                  {category.badge && (
                    <span className="absolute -top-2 -right-3 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                      {category.badge}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {category.title}
                </span>
                <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryTiles;
