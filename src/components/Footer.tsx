import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground/5 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Golden Nile
            </div>
            <p className="text-muted-foreground mb-6">
              Your gateway to experiencing the timeless beauty and rich heritage of Luxor & Aswan, Egypt.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-colors group">
                <Facebook className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-colors group">
                <Instagram className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-colors group">
                <Twitter className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-colors group">
                <Youtube className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="/#destinations" className="text-muted-foreground hover:text-primary transition-colors">Destinations</a></li>
              <li><a href="/booking" className="text-muted-foreground hover:text-primary transition-colors">Booking</a></li>
              <li><Link to="/blogs" className="text-muted-foreground hover:text-primary transition-colors">Travel Blog</Link></li>
              <li><Link to="/community" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
               <li><Link to="/trip" className="text-muted-foreground hover:text-primary transition-colors">Trip Plan</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {/* <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Luxor, Egypt</span>
              </li> */}
              <li className="flex items-start gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>+20 123 456 7890</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>GoldenNile@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe for exclusive deals and travel tips
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1"
              />
              <Button>
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 Golden Nile Tourism. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
