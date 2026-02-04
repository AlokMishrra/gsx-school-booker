import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface School {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
}

interface SimpleSchoolCardProps {
  school: School;
  isSelected: boolean;
  onSelect: (schoolId: string) => void;
}

export const SimpleSchoolCard = ({ school, isSelected, onSelect }: SimpleSchoolCardProps) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:-translate-y-1",
        isSelected 
          ? "border-primary bg-primary/5 gsx-shadow" 
          : "border-border/50 hover:border-primary/30 hover:gsx-shadow-lg"
      )}
      onClick={() => onSelect(school.id)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <Checkbox 
          checked={isSelected}
          className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={() => onSelect(school.id)}
        />
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold truncate transition-colors",
            isSelected && "text-primary"
          )}>
            {school.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {[school.city, school.state].filter(Boolean).join(', ') || school.address}
            </span>
          </div>
        </div>
        {isSelected && (
          <div className="h-8 w-8 rounded-full gsx-gradient flex items-center justify-center animate-scale-in">
            <span className="text-primary-foreground text-sm">✓</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
