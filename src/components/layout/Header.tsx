import { Scissors } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";

interface HeaderProps {
  barbershopName?: string;
  showAuth?: boolean;
  onAuthClick?: () => void;
}

export const Header = ({ barbershopName, showAuth = false, onAuthClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-premium">
            <Scissors className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-premium">
              {barbershopName || "BarberHub"}
            </h1>
            {barbershopName && (
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            )}
          </div>
        </div>

        {showAuth && (
          <PremiumButton 
            variant="premium" 
            size="sm"
            onClick={onAuthClick}
          >
            Entrar
          </PremiumButton>
        )}
      </div>
    </header>
  );
};