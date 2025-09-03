import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FacebookIcon, TwitterIcon, InstagramIcon, MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🌟</div>
              <span className="text-xl font-bold">
                Hargeisa Vibes
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your gateway to extraordinary experiences in Hargeisa and beyond. 
              Discover, book, and enjoy the best services all in one place.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <FacebookIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <TwitterIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <InstagramIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Hotels & Accommodations</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Car Rentals</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Event Tickets</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Tours & Activities</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Special Deals</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Booking Guide</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Cancellation Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-gray-300 text-sm">
              Subscribe to get the latest deals and travel tips
            </p>
            <div className="space-y-3">
              <Input 
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <MailIcon className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <MapPinIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-gray-300 text-sm">Ahmed Gurey Street, Hargeisa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-gray-300 text-sm">+252 63 123 4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MailIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-gray-300 text-sm">hello@hargeisavibes.com</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 Hargeisa Vibes. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;