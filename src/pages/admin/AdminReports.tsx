import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const COLORS = ['hsl(262, 83%, 58%)', 'hsl(280, 87%, 65%)', 'hsl(330, 81%, 60%)', 'hsl(142, 76%, 36%)'];

const AdminReports = () => {
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin-revenue-report'],
    queryFn: async () => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(startOfDay(date), 'yyyy-MM-dd');
      });

      const { data, error } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', last7Days[0]);

      if (error) throw error;

      const revenueByDay = last7Days.map(date => {
        const dayRevenue = data
          ?.filter(p => format(new Date(p.created_at), 'yyyy-MM-dd') === date)
          .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        return {
          date: format(new Date(date), 'MMM dd'),
          revenue: dayRevenue,
        };
      });

      return revenueByDay;
    },
  });

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['admin-booking-status-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('status');

      if (error) throw error;

      const statusCount = data.reduce((acc: Record<string, number>, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    },
  });

  const { data: topSchools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['admin-top-schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_items')
        .select(`
          inventory_items (
            schools (name)
          )
        `);

      if (error) throw error;

      const schoolCounts = data.reduce((acc: Record<string, number>, item: any) => {
        const schoolName = item.inventory_items?.schools?.name;
        if (schoolName) {
          acc[schoolName] = (acc[schoolName] || 0) + 1;
        }
        return acc;
      }, {});

      return Object.entries(schoolCounts)
        .map(([name, bookings]) => ({ name, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">View insights and performance metrics</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <Skeleton className="h-64" />
              ) : statusData && statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-muted-foreground">No booking data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Schools */}
        <Card>
          <CardHeader>
            <CardTitle>Top Schools by Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {schoolsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : topSchools && topSchools.length > 0 ? (
              <div className="space-y-4">
                {topSchools.map((school, index) => (
                  <div key={school.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{school.name}</span>
                    </div>
                    <span className="text-muted-foreground">{school.bookings} bookings</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No booking data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
