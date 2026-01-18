import { Clock, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import templeImage from "@/assets/abu-simbel.jpg";
import balloonsImage from "@/assets/balloons-luxor.jpg";
import cruiseImage from "@/assets/nile cruise  (2).jpg";
import heroImage from "@/assets/hero-luxor.jpg";
import AncientEgyptian from "@/assets/Ancient Egyptian.webp";
import cuisineImage from "@/assets/egyptian-cuisine.jpg";
import aswanImage from "@/assets/aswan-sunset.jpg";
import hotelImage from "@/assets/hotel3.webp";

const blogs = [
  {
    id: "1",
    title: "10 Must-Visit Temples in Luxor & Aswan",
    excerpt: "Discover the most breathtaking ancient temples and their fascinating histories that span over 3,000 years",
    image: templeImage,
    author: "Sarah Ahmed",
    date: "Dec 15, 2024",
    readTime: "8 min read",
    category: "Travel Guide",
    content: "Explore the magnificent temples of Karnak, Luxor Temple, Philae Temple, and more. Each temple tells a unique story of ancient Egyptian civilization..."
  },
  {
    id: "2",
    title: "Hot Air Balloon Adventure: A Complete Guide",
    excerpt: "Everything you need to know about experiencing Luxor from the sky, including best times and what to expect",
    image: balloonsImage,
    author: "Mohamed Hassan",
    date: "Dec 10, 2024",
    readTime: "6 min read",
    category: "Adventures",
    content: "Soar above the Valley of the Kings at sunrise and witness the ancient wonders of Luxor from a unique perspective..."
  },
  {
    id: "4",
    title: "Luxury Nile Cruise: What to Expect",
    excerpt: "An insider's guide to choosing and enjoying a luxury cruise between Luxor and Aswan , experenace is amazing , please try it ....",
    image: cruiseImage,
    author: "Ahmed Ibrahim",
    date: "Nov 28, 2024",
    readTime: "10 min read",
    category: "Travel Guide",
    content: "Discover what makes a Nile cruise between Luxor and Aswan an unforgettable experience, from onboard amenities to shore excursions, "
  },
  {
    id: "5",
    title: "Best Photography Spots in Luxor",
    excerpt: "Capture the magic of ancient Egypt with our guide to the most photogenic locations",
    image: heroImage,
    author: "Emma Wilson",
    date: "Nov 20, 2024",
    readTime: "5 min read",
    category: "Photography",
    content: "From sunrise at Karnak Temple to sunset over the Nile, discover the best times and locations for stunning photography in Luxor..."
  },
  {
    id: "6",
    title: "Traditional Egyptian Cuisine in Aswan",
    excerpt: "Explore the flavors of Egypt with our comprehensive guide to authentic local dishes",
    image: cuisineImage,
    author: "Hassan Mahmoud",
    date: "Nov 15, 2024",
    readTime: "9 min read",
    category: "Food & Drink",
    content: "Taste the authentic flavors of Aswan, from traditional Nubian dishes to classic Egyptian street food..."
  },
  {
    id: "9",
    title: "Ancient Egyptian Music and Dance",
    excerpt: "Discover the rhythms and melodies that have echoed through Luxor and Aswan for millennia",
    image: AncientEgyptian,
    author: "Layla Mohamed",
    date: "Oct 30, 2024",
    readTime: "8 min read",
    category: "Culture",
    content: "Explore the rich musical heritage of ancient Egypt and experience traditional performances in Luxor and Aswan..."
  },
  {
    id: "10",
    title: "Sunset Photography at Philae Temple",
    excerpt: "Master the art of capturing golden hour magic at Aswan's island temple",
    image: aswanImage,
    author: "Emma Wilson",
    date: "Oct 25, 2024",
    readTime: "7 min read",
    category: "Photography",
    content: "Learn the best techniques and settings for photographing Philae Temple during the magical golden hour..."
  },
  {
    id: "13",
    title: "Felucca Sailing on the Nile",
    excerpt: "Experience the traditional way of traveling the Nile on a wooden sailboat",
    image: cruiseImage,
    author: "Nadia Ali",
    date: "Oct 10, 2024",
    readTime: "6 min read",
    category: "Adventures",
    content: "Discover the peaceful adventure of sailing the Nile on a traditional felucca, just as Egyptians have done for centuries... "
  },
  {
    id: "14",
    title: "Hieroglyphics Workshop in Luxor",
    excerpt: "Learn to read and write ancient Egyptian symbols with local experts",
    image: templeImage,
    author: "Dr. Amira Hassan",
    date: "Oct 5, 2024",
    readTime: "9 min read",
    category: "Culture",
    content: "Participate in hands-on workshops to understand the fascinating writing system of ancient Egypt..."
  },
  {
    id: "15",
    title: "Best Rooftop Restaurants in Aswan",
    excerpt: "Dine with stunning Nile views at Aswan's finest rooftop establishments",
    image: hotelImage,
    author: "Hassan Mahmoud",
    date: "Sep 30, 2024",
    readTime: "7 min read",
    category: "Food & Drink",
    content: "Discover the best rooftop dining experiences in Aswan, combining delicious cuisine with breathtaking views..."
  },
];

const categories = ["All", "Travel Guide", "Culture", "Adventures", "Food & Drink", "Photography"];

const Blogs = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedBlogs = selectedCategory === "All" 
    ? filteredBlogs 
    : filteredBlogs.slice(0, visibleCount);

  const hasMore = filteredBlogs.length > displayedBlogs.length;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(3);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-16">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Travel <span className="text-primary">Blog</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up">
              Expert insights, cultural guides, and travel tips to help you make the most of your Egyptian adventure
            </p>
            <div className="max-w-md mx-auto animate-scale-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {displayedBlogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No articles found matching your search.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedBlogs.map((blog, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 animate-slide-up border-border"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{blog.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{blog.readTime}</span>
                      </div>
                    </div>
                    <Link to={`/blogs/${blog.id}`}>
                      <Button variant="outline" className="w-full">
                        Read More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-12">
                <Button size="lg" onClick={handleLoadMore}>
                  Load More Articles
                </Button>
              </div>
            )}
              </>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Blogs;