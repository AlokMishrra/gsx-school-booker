import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Plus, Minus, ShoppingCart, ArrowLeft, Building2, Package } from 'lucide-react';

const SchoolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: school, isLoading } = useQuery({
    queryKey: ['school', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          inventory_items (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleQuantityChange = (itemId: string, delta: number, max: number) => {
    setQuantities(prev => {
      const current = prev[itemId] || 1;
      const newQty = Math.max(1, Math.min(current + delta, max));
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleAddToCart = (item: any) => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to add items to cart.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    const quantity = quantities[item.id] || 1;
    addItem({
      inventoryItemId: item.id,
      schoolId: school!.id,
      schoolName: school!.name,
      itemName: item.name,
      itemType: item.item_type,
      pricePerHour: Number(item.price_per_hour),
      quantity,
      maxQuantity: item.quantity_available,
    });

    toast({
      title: 'Added to cart',
      description: `${quantity}x ${item.name} added to your cart.`,
    });
  };

  const isInCart = (itemId: string) => items.some(item => item.inventoryItemId === itemId);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="mb-8 h-4 w-96" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!school) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold">School not found</h1>
          <Button onClick={() => navigate('/schools')} className="mt-4">
            Back to Schools
          </Button>
        </div>
      </MainLayout>
    );
  }

  const facilities = school.inventory_items?.filter((item: any) => item.item_type === 'facility') || [];
  const equipment = school.inventory_items?.filter((item: any) => item.item_type === 'equipment') || [];

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/schools')} 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schools
        </Button>

        {/* School Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">{school.name}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{school.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{school.contact_phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{school.contact_email}</span>
            </div>
          </div>
          {school.description && (
            <p className="mt-4 text-muted-foreground">{school.description}</p>
          )}
        </div>

        {/* Facilities Section */}
        {facilities.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Facilities</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {facilities.map((item: any) => (
                <Card key={item.id} className="transition-all hover:gsx-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge className="gsx-gradient text-primary-foreground">
                        ₹{item.price_per_hour}/hr
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.description && (
                      <p className="mb-4 text-sm text-muted-foreground">{item.description}</p>
                    )}
                    {isInCart(item.id) ? (
                      <Button variant="secondary" className="w-full" disabled>
                        Already in Cart
                      </Button>
                    ) : (
                      <Button 
                        className="w-full gsx-gradient" 
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Equipment Section */}
        {equipment.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Equipment</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {equipment.map((item: any) => {
                const qty = quantities[item.id] || 1;
                return (
                  <Card key={item.id} className="transition-all hover:gsx-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity_available} available
                          </p>
                        </div>
                        <Badge className="gsx-gradient text-primary-foreground">
                          ₹{item.price_per_hour}/hr
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {item.description && (
                        <p className="mb-4 text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <div className="mb-4 flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, -1, item.quantity_available)}
                          disabled={qty <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[3ch] text-center font-medium">{qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, 1, item.quantity_available)}
                          disabled={qty >= item.quantity_available}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {isInCart(item.id) ? (
                        <Button variant="secondary" className="w-full" disabled>
                          Already in Cart
                        </Button>
                      ) : (
                        <Button 
                          className="w-full gsx-gradient" 
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {facilities.length === 0 && equipment.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No inventory items available for this school at the moment.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SchoolDetail;
