import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Please Sign In</h1>
          <p className="mb-6 text-muted-foreground">
            You need to be signed in to view your cart
          </p>
          <Button onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Your Cart is Empty</h1>
          <p className="mb-6 text-muted-foreground">
            Browse schools and add items to your cart to get started
          </p>
          <Button onClick={() => navigate('/schools')}>
            Browse Schools
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Group items by school
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.schoolId]) {
      acc[item.schoolId] = {
        schoolName: item.schoolName,
        items: [],
      };
    }
    acc[item.schoolId].items.push(item);
    return acc;
  }, {} as Record<string, { schoolName: string; items: typeof items }>);

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <p className="text-muted-foreground">
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-6 lg:col-span-2">
            {Object.entries(groupedItems).map(([schoolId, { schoolName, items: schoolItems }]) => (
              <Card key={schoolId}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{schoolName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {schoolItems.map((item) => (
                    <div
                      key={item.inventoryItemId}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.itemName}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.itemType} • ₹{item.pricePerHour}/hr
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.inventoryItemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="min-w-[2ch] text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.inventoryItemId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.inventoryItemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.inventoryItemId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.itemName}
                      </span>
                      <span>₹{item.pricePerHour * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal (per hour)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    * Final amount will be calculated based on selected hours
                  </p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/booking')}
                >
                  Proceed to Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/schools')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Browsing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
