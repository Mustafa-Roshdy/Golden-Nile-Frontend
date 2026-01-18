import { Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import templeImage from "@/assets/abu-simbel.jpg";
import balloonsImage from "@/assets/balloons-luxor.jpg";
import nubianImage from "@/assets/nubian-village.jpg";

const blogs = [
  {
    title: "10 Must-Visit Temples in Luxor & Aswan",
    excerpt: "Discover the most breathtaking ancient temples and their fascinating histories",
    image: templeImage,
    author: "Sarah Ahmed",
    date: "Dec 15, 2024",
    readTime: "8 min read",
    category: "Travel Guide",
  },
  {
    title: "Hot Air Balloon Adventure: A Complete Guide",
    excerpt: "Everything you need to know about experiencing Luxor from the sky",
    image: balloonsImage,
    author: "Mohamed Hassan",
    date: "Dec 10, 2024",
    readTime: "6 min read",
    category: "Adventures",
  },
  {
    title: "Experiencing Authentic Nubian Culture",
    excerpt: "A journey through colorful villages and rich cultural traditions",
    image: nubianImage,
    author: "Fatima Ali",
    date: "Dec 5, 2024",
    readTime: "7 min read",
    category: "Culture",
  },
];

const BlogSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Travel <span className="text-primary">Insights & Guides</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert tips, cultural insights, and must-see destinations from our travel guides
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {blogs.map((blog, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 animate-slide-up border-border"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-56 overflow-hidden">
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
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/blogs">
            <Button variant="outline" size="lg">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
