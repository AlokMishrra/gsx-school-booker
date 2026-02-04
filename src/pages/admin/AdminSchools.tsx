import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Building2, Search, Edit2, IndianRupee, MapPin } from 'lucide-react';

// Simplified schema - only name, address, and price
const schoolSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  price_per_shift: z.string().min(1, 'Price is required'),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

const INDIAN_STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Telangana', 'Kerala'
];

const AdminSchools = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<string>('all');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState('');

  const { data: schools, isLoading } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select(`*, inventory_items (id, price_per_hour)`)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const schoolForm = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      price_per_shift: '',
    },
  });

  const createSchoolMutation = useMutation({
    mutationFn: async (data: SchoolFormData) => {
      // Create school
      const { data: school, error: schoolError } = await supabase.from('schools').insert([{
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        contact_email: 'admin@gsx.com',
        contact_phone: '0000000000',
      }]).select().single();
      
      if (schoolError) throw schoolError;

      // Create default inventory item with price
      const { error: inventoryError } = await supabase.from('inventory_items').insert([{
        school_id: school.id,
        name: 'School Booking',
        item_type: 'facility',
        price_per_hour: parseFloat(data.price_per_shift) / 5, // Per hour price (5 hours per shift)
        quantity_available: 1,
      }]);

      if (inventoryError) throw inventoryError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'School added successfully' });
      setSchoolDialogOpen(false);
      schoolForm.reset();
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const updateSchoolMutation = useMutation({
    mutationFn: async ({ id, data, inventoryId }: { id: string; data: SchoolFormData; inventoryId?: string }) => {
      const { error: schoolError } = await supabase.from('schools').update({
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
      }).eq('id', id);
      
      if (schoolError) throw schoolError;

      // Update price in inventory
      if (inventoryId) {
        const { error: inventoryError } = await supabase.from('inventory_items')
          .update({ price_per_hour: parseFloat(data.price_per_shift) / 5 })
          .eq('id', inventoryId);
        if (inventoryError) throw inventoryError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'School updated successfully' });
      setSchoolDialogOpen(false);
      setEditingSchool(null);
      schoolForm.reset();
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'School deleted successfully' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const bulkUpdatePriceMutation = useMutation({
    mutationFn: async ({ schoolIds, pricePerShift }: { schoolIds: string[]; pricePerShift: number }) => {
      // Get inventory items for selected schools
      const { data: items } = await supabase
        .from('inventory_items')
        .select('id')
        .in('school_id', schoolIds);

      if (items && items.length > 0) {
        const itemIds = items.map(i => i.id);
        const { error } = await supabase
          .from('inventory_items')
          .update({ price_per_hour: pricePerShift / 5 })
          .in('id', itemIds);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: `Price updated for ${selectedSchools.length} schools` });
      setBulkEditDialogOpen(false);
      setSelectedSchools([]);
      setBulkPrice('');
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleSchoolSubmit = (data: SchoolFormData) => {
    if (editingSchool) {
      updateSchoolMutation.mutate({ 
        id: editingSchool.id, 
        data,
        inventoryId: editingSchool.inventory_items?.[0]?.id 
      });
    } else {
      createSchoolMutation.mutate(data);
    }
  };

  const openEditSchool = (school: any) => {
    setEditingSchool(school);
    const pricePerHour = school.inventory_items?.[0]?.price_per_hour || 0;
    schoolForm.reset({
      name: school.name,
      address: school.address,
      city: school.city || '',
      state: school.state || '',
      price_per_shift: String(pricePerHour * 5), // Convert to per-shift price
    });
    setSchoolDialogOpen(true);
  };

  const toggleSchoolSelection = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredSchools?.map(s => s.id) || [];
    setSelectedSchools(filteredIds);
  };

  const handleBulkPriceUpdate = () => {
    if (!bulkPrice || selectedSchools.length === 0) return;
    bulkUpdatePriceMutation.mutate({
      schoolIds: selectedSchools,
      pricePerShift: parseFloat(bulkPrice),
    });
  };

  // Filter schools
  const filteredSchools = schools?.filter((school: any) => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (school.city?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesState = filterState === 'all' || school.state === filterState;
    return matchesSearch && matchesState;
  });

  const getSchoolPrice = (school: any) => {
    const pricePerHour = school.inventory_items?.[0]?.price_per_hour || 0;
    return pricePerHour * 5; // Per shift price
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schools Management</h1>
            <p className="text-muted-foreground">Add and manage schools with pricing</p>
          </div>
          <Dialog open={schoolDialogOpen} onOpenChange={(open) => {
            setSchoolDialogOpen(open);
            if (!open) {
              setEditingSchool(null);
              schoolForm.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gsx-gradient">
                <Plus className="mr-2 h-4 w-4" />
                Add School
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
              </DialogHeader>
              <Form {...schoolForm}>
                <form onSubmit={schoolForm.handleSubmit(handleSchoolSubmit)} className="space-y-4">
                  <FormField
                    control={schoolForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter school name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={schoolForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={schoolForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={schoolForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INDIAN_STATES.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={schoolForm.control}
                    name="price_per_shift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Shift (₹)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" className="pl-9" placeholder="5000" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full gsx-gradient" disabled={createSchoolMutation.isPending || updateSchoolMutation.isPending}>
                    {editingSchool ? 'Update School' : 'Add School'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {INDIAN_STATES.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions Bar */}
        {selectedSchools.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4 animate-fade-in">
            <p className="text-sm font-medium">
              {selectedSchools.length} school{selectedSchools.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedSchools([])}>
                Clear Selection
              </Button>
              <Dialog open={bulkEditDialogOpen} onOpenChange={setBulkEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gsx-gradient">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Bulk Edit Price
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Price for {selectedSchools.length} Schools</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">New Price per Shift (₹)</label>
                      <div className="relative mt-2">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-9"
                          placeholder="5000"
                          value={bulkPrice}
                          onChange={(e) => setBulkPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full gsx-gradient" 
                      onClick={handleBulkPriceUpdate}
                      disabled={!bulkPrice || bulkUpdatePriceMutation.isPending}
                    >
                      Update Price
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Select All */}
        {filteredSchools && filteredSchools.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedSchools.length === filteredSchools.length && filteredSchools.length > 0}
              onCheckedChange={(checked) => {
                if (checked) selectAllFiltered();
                else setSelectedSchools([]);
              }}
            />
            <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
              Select all ({filteredSchools.length})
            </label>
          </div>
        )}

        {/* Schools Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredSchools && filteredSchools.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSchools.map((school: any, index: number) => (
              <Card 
                key={school.id} 
                className={`transition-all hover:gsx-shadow animate-fade-in ${
                  selectedSchools.includes(school.id) ? 'ring-2 ring-primary' : ''
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedSchools.includes(school.id)}
                      onCheckedChange={() => toggleSchoolSelection(school.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{school.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{school.city}, {school.state}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{school.address}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-primary font-semibold">
                          ₹{getSchoolPrice(school).toLocaleString()}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={() => openEditSchool(school)}>
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteSchoolMutation.mutate(school.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery || filterState !== 'all' ? 'No schools match your search' : 'No schools added yet'}
              </p>
              <Button className="mt-4 gsx-gradient" onClick={() => setSchoolDialogOpen(true)}>
                Add Your First School
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSchools;
