import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronDown,
  Edit,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfileDropdownProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Debug logging
  console.log('UserProfileDropdown - user:', user);
  console.log('UserProfileDropdown - user.firstName:', user?.firstName);
  console.log('UserProfileDropdown - user.lastName:', user?.lastName);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };



  const handleNotificationsClick = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/profile'); // For now, redirect to profile page
  };

  const handleBookingHistoryClick = () => {
    setIsOpen(false);
    navigate('/booking-history');
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center space-x-2 hover:bg-accent/50 transition-all duration-300 px-4 py-2 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900 dark:text-white">
          {user.firstName} {user.lastName}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-r from-blue-500/5 to-purple-600/5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleProfileClick}
            >
              <Edit className="w-4 h-4 mr-3" />
              Edit Profile
            </Button>



            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleNotificationsClick}
            >
              <Bell className="w-4 h-4 mr-3" />
              Notifications
              <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">5</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleSettingsClick}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleBookingHistoryClick}
            >
              <History className="w-4 h-4 mr-3" />
              Booking History
            </Button>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UserProfileDropdown;
