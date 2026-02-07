import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Building2, Calendar, CreditCard, Users, TrendingUp, 
  Plus, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [schoolsRes, collegesRes, bookingsRes, paymentsRes, pendingRes] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact' }),
        supabase.from('colleges').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id, total_amount', { count: 'exact' }),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const totalRevenue = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        schools: schoolsRes.count || 0,
        colleges: collegesRes.count || 0,
        bookings: bookingsRes.count || 0,
        revenue: totalRevenue,
        pending: pendingRes.count || 0,
      };
    },
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`*, colleges (name, email)`)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: collegeAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-college-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`total_amount, status, colleges (id, name, email)`);
      
      if (error) throw error;

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

  // Pending payments query
  const { data: pendingPayments } = useQuery({
    queryKey: ['admin-pending-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`*, bookings (colleges (name))`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gsx-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gsx-warning" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
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
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of your Zero's School platform</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start gap-3"
            onClick={() => navigate('/admin/schools')}
          >
            <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
              <Plus className="h-5 w-5 text-background" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Add School</p>
              <p className="text-xs text-muted-foreground">Add new school</p>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start gap-3"
            onClick={() => navigate('/admin/bookings')}
          >
            <div className="h-10 w-10 rounded-lg bg-gsx-warning/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-gsx-warning" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Pending ({stats?.pending || 0})</p>
              <p className="text-xs text-muted-foreground">Review bookings</p>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start gap-3"
            onClick={() => navigate('/admin/bulk')}
          >
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Building2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Bulk Import</p>
              <p className="text-xs text-muted-foreground">CSV upload</p>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 justify-start gap-3"
            onClick={() => navigate('/admin/reports')}
          >
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Reports</p>
              <p className="text-xs text-muted-foreground">View analytics</p>
            </div>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : (
            <>
              <Card className="animate-fade-in hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground">
                    <Building2 className="h-6 w-6 text-background" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.schools}</p>
                    <p className="text-sm text-muted-foreground">Total Schools</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="animate-fade-in hover:shadow-md transition-shadow" style={{ animationDelay: '50ms' }}>
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
              <Card className="animate-fade-in hover:shadow-md transition-shadow" style={{ animationDelay: '100ms' }}>
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
              <Card className="animate-fade-in hover:shadow-md transition-shadow" style={{ animationDelay: '150ms' }}>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/bookings')}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : recentBookings && recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {recentBookings.map((booking: any, index: number) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(booking.status)}
                        <div>
                          <p className="font-medium text-sm">{booking.colleges?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.booking_date), 'MMM dd')} • {booking.start_time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{Number(booking.total_amount).toLocaleString()}</p>
                        <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
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
                <TrendingUp className="h-5 w-5" />
                Top Colleges by Spending
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
                            <p className="font-medium text-sm">{college.name}</p>
                            <p className="text-xs text-muted-foreground">{college.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{college.confirmedBookings}/{college.totalBookings}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
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

        {/* Pending Payments */}
        {pendingPayments && pendingPayments.length > 0 && (
          <Card className="animate-slide-up border-gsx-warning" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gsx-warning">
                <AlertCircle className="h-5 w-5" />
                Pending UPI Payments ({pendingPayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border border-gsx-warning/30 bg-gsx-warning/5 p-3">
                    <div>
                      <p className="font-medium text-sm">{payment.bookings?.colleges?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        Waiting for UPI confirmation
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{Number(payment.amount).toLocaleString()}</p>
                      <Badge variant="outline" className="text-gsx-warning border-gsx-warning">
                        Pending
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
