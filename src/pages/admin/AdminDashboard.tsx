import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Plus,
  Eye,
  Settings,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ServicesApiService } from "@/lib/servicesApi";
import { UsersApiService } from "@/lib/usersApi";
import { BookingsApiService } from "@/lib/bookingsApi";
import { AdminApiService } from "@/lib/adminApi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalServices: 0,
    totalUsers: 0,
    totalBookings: 0,
    revenue: 0,
    activeUsers: 0,
    pendingApprovals: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Load admin statistics from database
        const adminStats = await AdminApiService.getAdminStatistics();
        
        // Load services count
        const services = await ServicesApiService.getAllServices();
        
        // Load users count
        const users = await UsersApiService.getAllUsers();
        
        // Load bookings and statistics
        const bookings = await BookingsApiService.getAllBookings();
        const bookingStats = await BookingsApiService.getBookingStatistics();
        
        setStats({
          totalServices: adminStats.activeServices,
          totalUsers: adminStats.totalUsers,
          totalBookings: adminStats.totalBookings,
          revenue: adminStats.totalRevenue,
          activeUsers: users.filter(u => u.isActive).length,
          pendingApprovals: adminStats.pendingBookings
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    type: string;
    message: string;
    time: string;
    user: string;
  }>>([]);

  // Load recent activities
  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const activities = await AdminApiService.getRecentActivities(5);
        const formattedActivities = activities.map(activity => ({
          id: activity.id,
          type: activity.type,
          message: activity.description,
          time: formatTimeAgo(activity.timestamp),
          user: activity.username || 'system'
        }));
        setRecentActivities(formattedActivities);
      } catch (error) {
        console.error('Error loading recent activities:', error);
      }
    };

    loadRecentActivities();
  }, []);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const quickActions = [
    {
      title: 'Add Service',
      description: 'Create a new service listing',
      icon: Plus,
      action: () => navigate('/admin/services/new'),
      color: 'bg-blue-500'
    },
    {
      title: 'View Bookings',
      description: 'Check recent bookings and status',
      icon: Calendar,
      action: () => navigate('/admin/bookings'),
      color: 'bg-green-500'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      action: () => navigate('/admin/users'),
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: TrendingUp,
      action: () => navigate('/admin/analytics'),
      color: 'bg-orange-500'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'service_added':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'booking_confirmed':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'user_registered':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/admin/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => navigate('/admin/services/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalServices}
            </div>
            <p className="text-xs text-muted-foreground">
              Active service listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              Total bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `$${stats.revenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={action.action}
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <Badge variant="secondary" className="text-xs">
                        {activity.user}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Eye className="w-4 h-4 mr-2" />
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">All systems operational</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Database: Healthy</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">API: 99.9% uptime</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
