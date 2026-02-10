import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Building2, Calendar, CreditCard, Users, TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [schoolsRes, collegesRes, bookingsRes, paymentsRes] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact' }),
        supabase.from('colleges').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id, total_amount', { count: 'exact' }),
        supabase.from('payments').select('amount').eq('status', 'completed'),
      ]);

      const totalRevenue = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        schools: schoolsRes.count || 0,
        colleges: collegesRes.count || 0,
        bookings: bookingsRes.count || 0,
        revenue: totalRevenue,
      };
    },
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          colleges (name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // College Analytics - bookings by college
  const { data: collegeAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-college-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          total_amount,
          status,
          colleges (id, name, email)
        `);
      
      if (error) throw error;

      // Aggregate by college
      const collegeStats: Record<string, {
        name: string;
        email: string;
        totalBookings: number;
        confirmedBookings: number;
        totalSpent: number;
      }> = {};

      data.forEach((booking: any) => {
        const collegeId = booking.colleges?.id;
        if (!collegeId) return;

        if (!collegeStats[collegeId]) {
          collegeStats[collegeId] = {
            name: booking.colleges.name,
            email: booking.colleges.email,
            totalBookings: 0,
            confirmedBookings: 0,
            totalSpent: 0,
          };
        }

        collegeStats[collegeId].totalBookings++;
        if (booking.status === 'confirmed' || booking.status === 'completed') {
          collegeStats[collegeId].confirmedBookings++;
          collegeStats[collegeId].totalSpent += Number(booking.total_amount);
        }
      });

      return Object.values(collegeStats).sort((a, b) => b.totalSpent - a.totalSpent);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-gsx-success text-gsx-success-foreground';
      case 'pending':
        return 'bg-gsx-warning text-gsx-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return '';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your GSX platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : (
            <>
              <Card className="animate-fade-in hover:gsx-shadow transition-shadow">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg gsx-gradient">
                    <Building2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.schools}</p>
                    <p className="text-sm text-muted-foreground">Total Schools</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="animate-fade-in hover:gsx-shadow transition-shadow" style={{ animationDelay: '50ms' }}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                    <Users className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.colleges}</p>
                    <p className="text-sm text-muted-foreground">Registered Colleges</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="animate-fade-in hover:gsx-shadow transition-shadow" style={{ animationDelay: '100ms' }}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.bookings}</p>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="animate-fade-in hover:gsx-shadow transition-shadow" style={{ animationDelay: '150ms' }}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gsx-success/10">
                    <CreditCard className="h-6 w-6 text-gsx-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹{stats?.revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Bookings */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : recentBookings && recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking: any, index: number) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div>
                        <p className="font-medium">{booking.colleges?.name || 'Unknown College'}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.booking_date), 'PPP')} • {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">₹{booking.total_amount}</span>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No bookings yet</p>
              )}
            </CardContent>
          </Card>

          {/* College Analytics */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                College Booking Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : collegeAnalytics && collegeAnalytics.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>College</TableHead>
                      <TableHead className="text-center">Bookings</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collegeAnalytics.slice(0, 5).map((college, index) => (
                      <TableRow key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{college.name}</p>
                            <p className="text-xs text-muted-foreground">{college.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{college.confirmedBookings}/{college.totalBookings}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          ₹{college.totalSpent.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No college data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
