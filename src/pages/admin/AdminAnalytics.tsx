import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Users, MousePointer, Calendar, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  totalSessions: number;
  totalPageViews: number;
  totalClicks: number;
  totalBookings: number;
  uniqueUsers: number;
  recentEvents: any[];
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSessions: 0,
    totalPageViews: 0,
    totalClicks: 0,
    totalBookings: 0,
    uniqueUsers: 0,
    recentEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch all tracking data
      const { data: trackingData, error } = await supabase
        .from('user_tracking')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Calculate analytics
      const sessions = new Set(trackingData?.map(e => e.session_id) || []);
      const users = new Set(trackingData?.filter(e => e.user_id).map(e => e.user_id) || []);
      const pageViews = trackingData?.filter(e => e.event_type === 'page_view').length || 0;
      const clicks = trackingData?.filter(e => e.event_type === 'click').length || 0;
      const bookings = trackingData?.filter(e => e.event_type === 'booking').length || 0;

      setAnalytics({
        totalSessions: sessions.size,
        totalPageViews: pageViews,
        totalClicks: clicks,
        totalBookings: bookings,
        uniqueUsers: users.size,
        recentEvents: trackingData?.slice(0, 50) || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Sessions',
      value: analytics.totalSessions,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Page Views',
      value: analytics.totalPageViews,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Clicks',
      value: analytics.totalClicks,
      icon: MousePointer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Bookings',
      value: analytics.totalBookings,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Unique Users',
      value: analytics.uniqueUsers,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track user behavior and engagement</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-2">
                    <div className="skeleton h-10 w-10 rounded-lg" />
                    <div className="skeleton h-8 w-16" />
                    <div className="skeleton h-4 w-24" />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="skeleton h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {analytics.recentEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{event.event_type.replace('_', ' ')}</span>
                        {event.element_text && (
                          <span className="text-sm text-muted-foreground">- {event.element_text}</span>
                        )}
                      </div>
                      {event.page_url && (
                        <p className="text-sm text-muted-foreground truncate">{event.page_url}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Session: {event.session_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
