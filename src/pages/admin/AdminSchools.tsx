import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Package, Building2 } from 'lucide-react';

const schoolSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().min(10, 'Invalid phone number').max(15),
  description: z.string().max(1000).optional(),
});

const inventorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  item_type: z.enum(['facility', 'equipment']),
  price_per_hour: z.string().min(1, 'Price is required'),
  quantity_available: z.string().min(1, 'Quantity is required'),
});

type SchoolFormData = z.infer<typeof schoolSchema>;
type InventoryFormData = z.infer<typeof inventorySchema>;

const AdminSchools = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [editingSchool, setEditingSchool] = useState<any>(null);

  const { data: schools, isLoading } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          inventory_items (*)
        `)
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
      contact_email: '',
      contact_phone: '',
      description: '',
    },
  });

  const inventoryForm = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      description: '',
      item_type: 'facility',
      price_per_hour: '',
      quantity_available: '1',
    },
  });

  const createSchoolMutation = useMutation({
    mutationFn: async (data: SchoolFormData) => {
      const { error } = await supabase.from('schools').insert([{
        name: data.name,
        address: data.address,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        description: data.description || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'School created successfully' });
      setSchoolDialogOpen(false);
      schoolForm.reset();
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const updateSchoolMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SchoolFormData }) => {
      const { error } = await supabase.from('schools').update(data).eq('id', id);
      if (error) throw error;
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

  const createInventoryMutation = useMutation({
    mutationFn: async (data: InventoryFormData & { school_id: string }) => {
      const { error } = await supabase.from('inventory_items').insert([{
        name: data.name,
        description: data.description || null,
        item_type: data.item_type,
        school_id: data.school_id,
        price_per_hour: parseFloat(data.price_per_hour),
        quantity_available: parseInt(data.quantity_available),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'Inventory item added successfully' });
      setInventoryDialogOpen(false);
      inventoryForm.reset();
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      toast({ title: 'Inventory item deleted successfully' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleSchoolSubmit = (data: SchoolFormData) => {
    if (editingSchool) {
      updateSchoolMutation.mutate({ id: editingSchool.id, data });
    } else {
      createSchoolMutation.mutate(data);
    }
  };

  const handleInventorySubmit = (data: InventoryFormData) => {
    if (!selectedSchool) return;
    createInventoryMutation.mutate({ ...data, school_id: selectedSchool.id });
  };

  const openEditSchool = (school: any) => {
    setEditingSchool(school);
    schoolForm.reset({
      name: school.name,
      address: school.address,
      contact_email: school.contact_email,
      contact_phone: school.contact_phone,
      description: school.description || '',
    });
    setSchoolDialogOpen(true);
  };

  const openAddInventory = (school: any) => {
    setSelectedSchool(school);
    inventoryForm.reset();
    setInventoryDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schools Management</h1>
            <p className="text-muted-foreground">Add, edit, and manage schools and their inventory</p>
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
            <DialogContent className="max-w-lg">
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
                          <Input {...field} />
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={schoolForm.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={schoolForm.control}
                      name="contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={schoolForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
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

        {/* Schools List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : schools && schools.length > 0 ? (
          <div className="space-y-4">
            {schools.map((school: any) => (
              <Card key={school.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {school.name}
                        <Badge variant={school.is_active ? 'default' : 'secondary'}>
                          {school.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {school.address} • {school.contact_phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditSchool(school)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => deleteSchoolMutation.mutate(school.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Inventory Items ({school.inventory_items?.length || 0})</h4>
                    <Button variant="outline" size="sm" onClick={() => openAddInventory(school)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  {school.inventory_items && school.inventory_items.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {school.inventory_items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-2">
                            {item.item_type === 'facility' ? (
                              <Building2 className="h-4 w-4 text-primary" />
                            ) : (
                              <Package className="h-4 w-4 text-primary" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ₹{item.price_per_hour}/hr • Qty: {item.quantity_available}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-8 w-8 p-0"
                            onClick={() => deleteInventoryMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No inventory items yet</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No schools added yet</p>
              <Button className="mt-4 gsx-gradient" onClick={() => setSchoolDialogOpen(true)}>
                Add Your First School
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Inventory Dialog */}
        <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item to {selectedSchool?.name}</DialogTitle>
            </DialogHeader>
            <Form {...inventoryForm}>
              <form onSubmit={inventoryForm.handleSubmit(handleInventorySubmit)} className="space-y-4">
                <FormField
                  control={inventoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inventoryForm.control}
                  name="item_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="facility">Facility</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={inventoryForm.control}
                    name="price_per_hour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Hour (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={inventoryForm.control}
                    name="quantity_available"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={inventoryForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gsx-gradient" disabled={createInventoryMutation.isPending}>
                  Add Item
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSchools;
