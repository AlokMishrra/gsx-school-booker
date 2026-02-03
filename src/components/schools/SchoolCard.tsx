import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MapPin, Phone, Mail, ChevronDown, Building2, Package } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  item_type: 'facility' | 'equipment';
  price_per_hour: number;
  quantity_available: number;
}

interface School {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  contact_email: string;
  contact_phone: string;
  description: string | null;
  inventory_items: InventoryItem[];
}

interface SchoolCardProps {
  school: School;
}

export const SchoolCard = ({ school }: SchoolCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const facilities = school.inventory_items?.filter(item => item.item_type === 'facility') || [];
  const equipment = school.inventory_items?.filter(item => item.item_type === 'equipment') || [];

  const minPrice = school.inventory_items?.length 
    ? Math.min(...school.inventory_items.map(item => Number(item.price_per_hour)))
    : 0;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:gsx-shadow-lg hover:-translate-y-1 hover:border-primary/30">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">{school.name}</CardTitle>
            {(school.city || school.state) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{[school.city, school.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
          {minPrice > 0 && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground animate-pulse-slow">
              From ₹{minPrice}/hr
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {/* Contact Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 transition-colors hover:text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
            <span className="line-clamp-1">{school.address}</span>
          </div>
          <div className="flex items-center gap-2 transition-colors hover:text-foreground">
            <Phone className="h-4 w-4 shrink-0 text-primary/60" />
            <span>{school.contact_phone}</span>
          </div>
          <div className="flex items-center gap-2 transition-colors hover:text-foreground">
            <Mail className="h-4 w-4 shrink-0 text-primary/60" />
            <span className="line-clamp-1">{school.contact_email}</span>
          </div>
        </div>

        {/* Description */}
        {school.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{school.description}</p>
        )}

        {/* Inventory Summary */}
        <div className="flex gap-4 text-sm">
          {facilities.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 transition-colors hover:bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
              <span>{facilities.length} Facilities</span>
            </div>
          )}
          {equipment.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 transition-colors hover:bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
              <span>{equipment.length} Equipment</span>
            </div>
          )}
        </div>

        {/* Expandable Details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-primary/5">
              View Inventory
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-collapsible-down overflow-hidden">
            <div className="space-y-4 pt-4 border-t border-border/50">
              {facilities.length > 0 && (
                <div className="animate-fade-in">
                  <h4 className="mb-2 font-medium text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Facilities
                  </h4>
                  <ul className="space-y-1">
                    {facilities.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <span>{item.name}</span>
                        <span className="text-primary font-medium">₹{item.price_per_hour}/hr</span>
                      </li>
                    ))}
                    {facilities.length > 3 && (
                      <li className="text-sm text-muted-foreground pl-2">
                        +{facilities.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {equipment.length > 0 && (
                <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <h4 className="mb-2 font-medium text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Equipment
                  </h4>
                  <ul className="space-y-1">
                    {equipment.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <span>{item.name} (x{item.quantity_available})</span>
                        <span className="text-primary font-medium">₹{item.price_per_hour}/hr</span>
                      </li>
                    ))}
                    {equipment.length > 3 && (
                      <li className="text-sm text-muted-foreground pl-2">
                        +{equipment.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Button */}
        <Button asChild className="w-full gsx-gradient transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Link to={`/schools/${school.id}`}>View Details & Book</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
