import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  MenuIcon,
  UserIcon,
  SearchIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  PhoneIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ChevronDown,
  TicketIcon,
  CarIcon,
  HotelIcon,
  ActivityIcon,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import SignUpModal from "@/components/SignUpModal";
import LoginModal from "@/components/LoginModal";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";

const NavigationMenuListItem = ({ className, title, children, href, icon: Icon, ...props }: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
  icon?: any;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus:bg-gray-100 dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white",
            className
          )}
          href={href}
          {...props}
        >
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-600 dark:text-gray-400">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUser();
  const { theme, toggleTheme } = useTheme();

  // Debug logging
  console.log('Header - isAuthenticated:', isAuthenticated);
  console.log('Header - user:', user);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 group cursor-pointer select-none"
              onClick={() => navigate('/')}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                <span className="text-2xl">🌟</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  Hargeisa Vibes
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-200">
                  Discover & Book
                </span>
              </div>
            </div>
            
            {/* Modern Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="space-x-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-800 relative group text-gray-900 dark:text-white">
                    Hotels
                    <span className="absolute left-1/2 -bottom-1 w-0 group-hover:w-full h-0.5 bg-blue-600 transition-all duration-300" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-br from-blue-500 to-purple-600 p-6 no-underline outline-none focus:shadow-md"
                            href="/services?category=Hotels%20%26%20Stays"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              Premium Hotels
                            </div>
                            <p className="text-sm leading-tight text-white/80">
                              Discover luxury accommodations with world-class amenities
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <NavigationMenuListItem href="/services?category=Hotels%20%26%20Stays" title="Luxury Suites" icon={StarIcon}>
                        5-star accommodations with premium services
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="/services?category=Hotels%20%26%20Stays" title="Budget Hotels" icon={MapPinIcon}>
                        Comfortable stays at affordable prices
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="/services?category=Hotels%20%26%20Stays" title="Book Now" icon={CalendarIcon}>
                        Check availability and make reservations
                      </NavigationMenuListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-800 relative group text-gray-900 dark:text-white">
                    Transportation
                    <span className="absolute left-1/2 -bottom-1 w-0 group-hover:w-full h-0.5 bg-blue-600 transition-all duration-300" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <NavigationMenuListItem href="/services?category=Car%20Rentals" title="Car Rentals" icon={CarIcon}>
                        Rent a car for your perfect road trip
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="#" title="Flight Tickets" icon={CalendarIcon}>
                        Book flights to your favorite destinations
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="#" title="Airport Transfer" icon={PhoneIcon}>
                        Reliable transfers to and from airports
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="#" title="Local Transport" icon={StarIcon}>
                        City buses and local transportation
                      </NavigationMenuListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-800 relative group text-gray-900 dark:text-white">
                    Activities
                    <span className="absolute left-1/2 -bottom-1 w-0 group-hover:w-full h-0.5 bg-blue-600 transition-all duration-300" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <NavigationMenuListItem href="/services?category=Activities" title="Desert Safari" icon={ActivityIcon}>
                        Thrilling desert exploration adventures
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="/services?category=Activities" title="Mountain Hiking" icon={MapPinIcon}>
                        Scenic mountain trails and tours
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="/services?category=Activities" title="Cultural Tours" icon={StarIcon}>
                        Immerse in local culture and heritage
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="/services?category=Activities" title="Water Sports" icon={ActivityIcon}>
                        Exciting water-based activities
                      </NavigationMenuListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-800 relative group text-gray-900 dark:text-white">
                    Events
                    <span className="absolute left-1/2 -bottom-1 w-0 group-hover:w-full h-0.5 bg-blue-600 transition-all duration-300" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <NavigationMenuListItem href="/services?category=Event%20Tickets" title="Music Festivals" icon={TicketIcon}>
                        Live music and cultural celebrations
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="/services?category=Event%20Tickets" title="Sports Events" icon={ActivityIcon}>
                        Exciting sports competitions
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="/services?category=Event%20Tickets" title="Art Exhibitions" icon={StarIcon}>
                        Local artists and contemporary art
                      </NavigationMenuListItem>
                      <NavigationMenuListItem href="/services?category=Event%20Tickets" title="Food Festivals" icon={CalendarIcon}>
                        Culinary celebrations and tastings
                      </NavigationMenuListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    href="/deals" 
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-smooth hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 relative"
                    )}
                  >
                    Deals
                    <span className="absolute left-1/2 -bottom-1 w-0 group-hover:w-full h-0.5 bg-blue-600 transition-all duration-300" />
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Profile Link for Desktop - Only show when signed in */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center">
                <Button
                  variant="ghost"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 px-4 py-2 rounded-full hover:scale-105"
                  onClick={() => navigate('/profile')}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </div>
            )}
            
            {/* Right side controls */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 transition-all duration-200"
                onClick={() => navigate('/services')}
              >
                <SearchIcon className="w-5 h-5" />
              </Button>
              

              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 transition-all duration-200"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </Button>
              
              {/* Auth Section - Show User Profile or Auth Buttons */}
              {isAuthenticated ? (
                <UserProfileDropdown user={user!} onLogout={handleLogout} />
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 px-4 py-2 rounded-full hover:scale-105"
                    onClick={() => setLoginOpen(true)}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-blue-600 text-white hover:shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 border-0 flex items-center gap-2 px-4 py-2 rounded-full"
                    onClick={() => setSignUpOpen(true)}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="font-semibold">Sign Up</span>
                  </Button>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 transition-all duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MenuIcon className="w-5 h-5 text-gray-900 dark:text-white" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-6 animate-slide-down bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
              <nav className="flex flex-col space-y-2">
                <a 
                  href="#" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 animate-fade-in hover:scale-105"
                  onClick={() => handleNavigation('/services?category=Hotels%20%26%20Stays')}
                >
                  <HotelIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Hotels</span>
                </a>
                <a 
                  href="#" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 animate-fade-in hover:scale-105"
                  onClick={() => handleNavigation('/services?category=Car%20Rentals')}
                >
                  <CarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Car Rentals</span>
                </a>
                <a 
                  href="#" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 animate-fade-in hover:scale-105"
                  onClick={() => handleNavigation('/services?category=Activities')}
                >
                  <ActivityIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Activities</span>
                </a>
                <a 
                  href="#" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 animate-fade-in hover:scale-105"
                  onClick={() => handleNavigation('/services?category=Event%20Tickets')}
                >
                  <TicketIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Events</span>
                </a>
                <a 
                  href="#" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 animate-fade-in hover:scale-105"
                  onClick={() => handleNavigation('/deals')}
                >
                  <StarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Deals</span>
                </a>
                
                {/* Profile Link for Mobile */}
                {isAuthenticated && (
                  <a 
                    href="#" 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 animate-fade-in hover:scale-105"
                    onClick={() => handleNavigation('/profile')}
                  >
                    <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>My Profile</span>
                  </a>
                )}
                
                {/* Mobile Auth Section */}
                {isAuthenticated ? (
                  <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex items-center space-x-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 hover:scale-105"
                      onClick={() => navigate('/profile')}
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      My Profile
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 hover:scale-105"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <Button 
                      className="w-full bg-blue-600 text-white hover:shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                      onClick={() => setLoginOpen(true)}
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 hover:scale-105"
                      onClick={() => setSignUpOpen(true)}
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
      
      {/* Modals - Now outside the header for proper positioning */}
      <SignUpModal 
        open={signUpOpen} 
        onClose={() => setSignUpOpen(false)} 
        onSwitchToLogin={() => {
          setSignUpOpen(false);
          setLoginOpen(true);
        }}
      />
      <LoginModal 
        open={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        onSwitchToSignUp={() => {
          setLoginOpen(false);
          setSignUpOpen(true);
        }}
      />
    </>
  );
};

export default Header;
// Custom animations (add to your global CSS or tailwind.config.js):
// animate-spin-slow, animate-gradient-move, animate-slide-down