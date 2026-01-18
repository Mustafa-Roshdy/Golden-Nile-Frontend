import { useParams, Link, useLocation } from "react-router-dom";
import { Clock, User, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import templeImage from "@/assets/abu-simbel.jpg";
import balloonsImage from "@/assets/balloons-luxor.jpg";
import nubianImage from "@/assets/nubian-village.jpg";
import cruiseImage from "@/assets/nile.jpg";
import heroImage from "@/assets/hero-luxor.jpg";
import cuisineImage from "@/assets/egyptian-cuisine.jpg";
import aswanImage from "@/assets/aswan-sunset.jpg";
import hotelImage from "@/assets/hotel2.jpg";
import { useEffect } from "react";

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
    content: `Luxor and Aswan are home to some of the most magnificent temples in the world. These ancient structures stand as testament to the incredible engineering and artistic achievements of ancient Egyptian civilization.

## 1. Karnak Temple Complex

The Karnak Temple Complex is the largest religious building ever constructed. Its main temple, dedicated to Amun-Ra, covers over 200 acres and took over 2,000 years to complete. The Great Hypostyle Hall features 134 massive columns arranged in 16 rows, creating a forest of stone that's truly awe-inspiring.

## 2. Luxor Temple

Located on the east bank of the Nile, Luxor Temple is a stunning example of ancient Egyptian architecture. Built around 1400 BCE, this temple was dedicated to the rejuvenation of kingship. Don't miss the Avenue of Sphinxes that once connected it to Karnak Temple.

## 3. Temple of Hatshepsut

This mortuary temple of Queen Hatshepsut is built into the cliffs at Deir el-Bahari. Its three terraced levels connected by long ramps make it one of the most visually striking temples in Egypt.

## 4. Abu Simbel Temples

These twin temples, carved into a mountainside, are among the most iconic monuments of ancient Egypt. The four colossal statues of Ramesses II at the entrance are 20 meters high and truly impressive.

## 5. Philae Temple

Located on an island in the Nile near Aswan, Philae Temple is dedicated to the goddess Isis. The temple complex was relocated to its current location to save it from the rising waters of Lake Nasser.

## Planning Your Visit

The best time to visit these temples is early morning or late afternoon to avoid the heat. Most temples open at 6 AM, perfect for catching the sunrise. Consider hiring a knowledgeable guide to fully appreciate the historical and cultural significance of these magnificent structures.

Each temple offers unique insights into ancient Egyptian religion, art, and daily life. Take your time to explore, photograph, and absorb the incredible atmosphere of these timeless monuments.`
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
    content: `Soaring above Luxor in a hot air balloon at sunrise is one of the most magical experiences Egypt has to offer. Here's everything you need to know to make the most of this incredible adventure.

## What to Expect

Your day starts early—very early. Most balloon companies pick you up from your hotel around 4:30 AM. After a light snack and safety briefing, you'll head to the launch site on the West Bank of the Nile.

## The Flight Experience

As the sun rises, you'll gently lift off and float above the Valley of the Kings, Hatshepsut's Temple, and the Nile River. The flight typically lasts 45-60 minutes, reaching heights of up to 1,500 feet.

## Best Time to Go

The balloon season runs from October to May. Winter mornings (December-February) can be chilly, so dress in layers. The best views come during the clear winter months.

## What to Bring

- Warm layers for the early morning
- Camera with a good battery (you'll take lots of photos!)
- Comfortable, closed-toe shoes
- Sunglasses and sunscreen

## Safety Considerations

All reputable balloon companies follow strict safety protocols. Pilots are experienced and licensed. Weather conditions are carefully monitored—if it's too windy, flights are postponed.

## Photography Tips

The golden hour light is perfect for photography. Use a fast shutter speed to avoid blur from the balloon's movement. Wide-angle lenses work best to capture the expansive views.

## After Landing

Most tours include a celebratory drink and certificate. You'll return to your hotel around 8 AM, leaving plenty of time to explore Luxor's temples.

This is truly a once-in-a-lifetime experience that provides a unique perspective on ancient Egypt's most famous monuments.`
  },
  {
    id: "3",
    title: "Experiencing Authentic Nubian Culture",
    excerpt: "A journey through colorful villages and rich cultural traditions of the Nubian people along the Nile",
    image: nubianImage,
    author: "Fatima Ali",
    date: "Dec 5, 2024",
    readTime: "7 min read",
    category: "Culture",
    content: `The Nubian people have inhabited the Nile Valley for thousands of years, maintaining their unique culture, language, and traditions. A visit to a Nubian village in Aswan offers an authentic glimpse into this rich heritage.

## Getting There

Most Nubian villages are located on the West Bank of the Nile, accessible by boat. The journey across the river is part of the experience, offering beautiful views of Elephantine Island and the Aswan skyline.

## Colorful Architecture

Nubian houses are instantly recognizable by their vibrant colors—bright blues, yellows, and oranges adorn the walls. These colors aren't just decorative; they have cultural significance and help keep homes cool in the desert heat.

## Nubian Hospitality

Nubians are known for their warm hospitality. Many families welcome visitors into their homes for traditional tea and conversation. This personal interaction offers insights into daily life and customs.

## Traditional Crafts

Nubian craftspeople are skilled in various traditional arts:
- Basket weaving using palm fronds
- Pottery with distinctive Nubian designs
- Jewelry making with traditional patterns
- Henna application

## Music and Dance

Nubian music has a distinctive rhythm and style. Traditional instruments include the tambour (a type of lyre) and various drums. If you're lucky, you might witness or participate in a traditional dance performance.

## Language and Heritage

While Arabic is widely spoken, many Nubians still speak their traditional language. Learning a few Nubian phrases shows respect and is always appreciated.

## Crocodile Connection

Historically, Nubians lived alongside Nile crocodiles. Some families still keep small crocodiles, considering them good luck. These are harmless and part of the cultural experience.

## Supporting the Community

When visiting, consider buying handicrafts directly from artisans and dining at local restaurants. This helps support the Nubian community and preserve their cultural traditions.

A visit to a Nubian village is more than tourism—it's a cultural exchange that enriches both visitors and hosts.`
  },
  // ... keeping existing blog data structure but adding full content
  {
    id: "4",
    title: "Luxury Nile Cruise: What to Expect",
    excerpt: "An insider's guide to choosing and enjoying a luxury cruise between Luxor and Aswan",
    image: cruiseImage,
    author: "Ahmed Ibrahim",
    date: "Nov 28, 2024",
    readTime: "10 min read",
    category: "Travel Guide",
    content: `A Nile cruise between Luxor and Aswan is the ultimate way to experience ancient Egypt in comfort and style. Here's your complete guide to making the most of this unforgettable journey.`
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
    content: `Luxor is a photographer's paradise, offering countless opportunities to capture the grandeur of ancient Egypt. From sunrise at the temples to golden hour along the Nile, here are the best spots and times for stunning photography.`
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
    content: `Aswan's culinary scene blends traditional Nubian flavors with classic Egyptian cuisine. From aromatic spices to fresh Nile fish, discover the authentic tastes that make this region special.`
  },
  {
    id: "9",
    title: "Ancient Egyptian Music and Dance",
    excerpt: "Discover the rhythms and melodies that have echoed through Luxor and Aswan for millennia",
    image: nubianImage,
    author: "Layla Mohamed",
    date: "Oct 30, 2024",
    readTime: "8 min read",
    category: "Culture",
    content: `Music and dance have been integral to Egyptian culture for thousands of years. Learn about traditional instruments, rhythms, and where to experience authentic performances in Luxor and Aswan.`
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
    content: `Philae Temple offers some of the most dramatic sunset photography opportunities in Egypt. Learn the best techniques, camera settings, and compositions to capture this magical location.`
  },
 
  {
    id: "12",
    title: "Aswan High Dam and Lake Nasser",
    excerpt: "Understanding the engineering marvel that transformed modern Egypt",
    image: aswanImage,
    author: "Khaled Ibrahim",
    date: "Oct 15, 2024",
    readTime: "10 min read",
    category: "Travel Guide",
    content: `The Aswan High Dam is one of the world's largest embankment dams. Learn about its construction, impact on Egypt, and the stunning Lake Nasser it created.`
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
    content: `A felucca ride on the Nile offers a peaceful escape from the busy tourist sites. Experience the river as Egyptians have for centuries, powered only by wind and current.`
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
    content: `Unlock the secrets of hieroglyphics in hands-on workshops led by Egyptologists. Learn to write your name in ancient Egyptian symbols and understand this fascinating writing system.`
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
    content: `Aswan's rooftop restaurants combine delicious cuisine with breathtaking views of the Nile and surrounding monuments. Discover the best spots for an unforgettable dining experience.`
  },
];

const BlogDetail = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const { id } = useParams();
  const blog = blogs.find((b) => b.id === id);

  const currentUrl = window.location.href;

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  if (!blog) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <Link to="/blogs">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-16">
        {/* Hero Section */}
        <section className="relative h-[60vh] overflow-hidden">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <Link to="/blogs">
                <Button variant="ghost" className="mb-4 text-white hover:text-white hover:bg-white/20">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blogs
                </Button>
              </Link>
              <div className="max-w-4xl">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold mb-4 inline-block">
                  {blog.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
                  {blog.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  {blog.excerpt}
                </p>
                <div className="whitespace-pre-line text-foreground leading-relaxed">
                  {blog.content}
                </div>
              </div>

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Share this article</h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={shareToFacebook}>Facebook</Button>
                  <Button variant="outline" size="sm" onClick={shareToTwitter}>Twitter</Button>
                  <Button variant="outline" size="sm" onClick={shareToLinkedIn}>LinkedIn</Button>
                  <Button variant="outline" size="sm" onClick={copyLink}>Copy Link</Button>
                </div>
              </div>

              {/* Back to Blogs */}
              <div className="mt-12 text-center">
                <Link to="/blogs">
                  <Button size="lg">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Read More Articles
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default BlogDetail;

