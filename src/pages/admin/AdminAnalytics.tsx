import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Calendar, 
  DollarSign,
  Eye,
  Download,
  Calendar as CalendarIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { ServicesApiService } from "@/lib/servicesApi";
import { UsersApiService } from "@/lib/usersApi";
import { BookingsApiService } from "@/lib/bookingsApi";

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalBookings: 0,
      totalUsers: 0,
      totalServices: 0,
      revenueGrowth: 0,
      bookingsGrowth: 0,
      usersGrowth: 0,
      servicesGrowth: 0
    },
    monthlyData: [],
    topServices: [],
    userDemographics: {
      ageGroups: [],
      locations: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Load real data from APIs
        const [services, users, bookings, bookingStats] = await Promise.all([
          ServicesApiService.getAllServices(),
          UsersApiService.getAllUsers(),
          BookingsApiService.getAllBookings(),
          BookingsApiService.getBookingStatistics()
        ]);

        // Calculate real analytics
        const totalRevenue = bookingStats.total_revenue || 0;
        const totalBookings = bookingStats.total_bookings || 0;
        const totalUsers = users.length;
        const totalServices = services.length;

        setAnalyticsData({
          overview: {
            totalRevenue,
            totalBookings,
            totalUsers,
            totalServices,
            revenueGrowth: 0, // Would need historical data for real growth calculation
            bookingsGrowth: 0,
            usersGrowth: 0,
            servicesGrowth: 0
          },
          monthlyData: [], // Would need historical data from database
          topServices: services.slice(0, 5).map(service => ({
            name: service.title,
            bookings: 0, // Would need booking count per service
            revenue: 0,
            rating: service.rating
          })),
          userDemographics: {
            ageGroups: [], // Would need user age data
            locations: [] // Would need user location data
          }
        });
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select defaultValue="last-30-days">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `$${analyticsData.overview.totalRevenue.toLocaleString()}`}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                <>
                  {getGrowthIcon(analyticsData.overview.revenueGrowth)}
                  <span className={getGrowthColor(analyticsData.overview.revenueGrowth)}>
                    +{analyticsData.overview.revenueGrowth}%
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalBookings}</div>
            <div className="flex items-center space-x-2 text-sm">
              {getGrowthIcon(analyticsData.overview.bookingsGrowth)}
              <span className={getGrowthColor(analyticsData.overview.bookingsGrowth)}>
                +{analyticsData.overview.bookingsGrowth}%
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-sm">
              {getGrowthIcon(analyticsData.overview.usersGrowth)}
              <span className={getGrowthColor(analyticsData.overview.usersGrowth)}>
                +{analyticsData.overview.usersGrowth}%
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalServices}</div>
            <div className="flex items-center space-x-2 text-sm">
              {getGrowthIcon(analyticsData.overview.servicesGrowth)}
              <span className={getGrowthColor(analyticsData.overview.servicesGrowth)}>
                +{analyticsData.overview.servicesGrowth}%
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Revenue Trend
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{data.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${data.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{data.bookings} bookings</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{service.name}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{service.bookings} bookings</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">⭐ {service.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">${service.revenue.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Groups */}
        <Card>
          <CardHeader>
            <CardTitle>User Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.userDemographics.ageGroups.map((group) => (
                <div key={group.group} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{group.group} years</span>
                    <span className="font-medium">{group.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Location Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.userDemographics.locations.map((location) => (
                <div key={location.location} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{location.location}</span>
                    <span className="font-medium">{location.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Peak Hours</div>
              <div className="text-sm text-gray-600 mt-1">2 PM - 6 PM</div>
              <div className="text-xs text-gray-500 mt-1">Most active booking time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Best Day</div>
              <div className="text-sm text-gray-600 mt-1">Wednesday</div>
              <div className="text-xs text-gray-500 mt-1">Highest conversion rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Avg. Session</div>
              <div className="text-sm text-gray-600 mt-1">4m 32s</div>
              <div className="text-xs text-gray-500 mt-1">Time spent on site</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
