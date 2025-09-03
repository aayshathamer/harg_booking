import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Star, Heart, Calendar, MapPin, DollarSign, Eye } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface Notification {
  id: string;
  type: 'deal' | 'reminder' | 'booking' | 'promotion' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: {
    price?: number;
    location?: string;
    date?: string;
    discount?: number;
  };
}

const Notifications = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'deals' | 'bookings'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top when component mounts
  useScrollToTop();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Simulate loading notifications data
    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'deal',
            title: 'New Deal Alert! 🎉',
            message: 'Luxury Desert Safari Package is now 25% off! Limited time offer.',
            isRead: false,
            createdAt: '2024-01-15T10:30:00Z',
            actionUrl: '/deals/1',
            metadata: {
              price: 299,
              location: 'Hargeisa Desert',
              discount: 25,
            },
          },
          {
            id: '2',
            type: 'reminder',
            title: 'Upcoming Booking Reminder',
            message: 'Your Mountain Hiking Tour is scheduled for tomorrow at 9:00 AM.',
            isRead: false,
            createdAt: '2024-01-15T09:15:00Z',
            actionUrl: '/bookings/1',
            metadata: {
              date: '2024-01-16',
              location: 'Golis Mountains',
            },
          },
          {
            id: '3',
            type: 'promotion',
            title: 'Special Member Discount',
            message: 'As a valued member, get 15% off on all car rentals this week!',
            isRead: true,
            createdAt: '2024-01-14T16:45:00Z',
            actionUrl: '/services?category=Car%20Rentals',
            metadata: {
              discount: 15,
            },
          },
          {
            id: '4',
            type: 'booking',
            title: 'Booking Confirmed',
            message: 'Your Cultural Heritage Tour has been confirmed for January 20th.',
            isRead: true,
            createdAt: '2024-01-14T14:20:00Z',
            actionUrl: '/bookings/2',
            metadata: {
              date: '2024-01-20',
              location: 'Hargeisa Old Town',
            },
          },
          {
            id: '5',
            type: 'system',
            title: 'Welcome to Hargeisa Vibes!',
            message: 'Thank you for joining our community. Start exploring amazing deals and services.',
            isRead: true,
            createdAt: '2024-01-13T11:00:00Z',
            actionUrl: '/deals',
          },
          {
            id: '6',
            type: 'deal',
            title: 'Flash Sale Alert! ⚡',
            message: 'Premium Hotel stays are 30% off for the next 24 hours only!',
            isRead: false,
            createdAt: '2024-01-15T08:00:00Z',
            actionUrl: '/deals/2',
            metadata: {
              price: 199,
              discount: 30,
            },
          },
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user, navigate]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deal':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'reminder':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'booking':
        return <Check className="w-5 h-5 text-primary" />;
      case 'promotion':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'deal':
        return 'border-l-green-500 bg-green-50';
      case 'reminder':
        return 'border-l-blue-500 bg-blue-50';
      case 'booking':
        return 'border-l-primary bg-primary/5';
      case 'promotion':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'system':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'deals') return notification.type === 'deal';
    if (filter === 'bookings') return notification.type === 'booking';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Notifications
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Stay updated with your latest activities and offers
          </p>
        </div>

        {/* Stats and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-lg">
            {(['all', 'unread', 'deals', 'bookings'] as const).map((tab) => (
              <Button
                key={tab}
                variant={filter === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(tab)}
                className="capitalize"
              >
                {tab}
                {tab === 'unread' && unreadCount > 0 && (
                  <Badge className="ml-2 bg-blue-500 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-l-4 ${getNotificationColor(notification.type)} hover:shadow-lg transition-all duration-300 ${
                  !notification.isRead ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-2 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          {notification.metadata && (
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                              {notification.metadata.price && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>${notification.metadata.price}</span>
                                </div>
                              )}
                              {notification.metadata.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{notification.metadata.location}</span>
                                </div>
                              )}
                              {notification.metadata.date && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(notification.metadata.date).toLocaleDateString()}</span>
                                </div>
                              )}
                              {notification.metadata.discount && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-green-600 font-medium">
                                    {notification.metadata.discount}% OFF
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-gray-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            
                            <div className="flex space-x-2">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              
                              {notification.actionUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(notification.actionUrl!)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
