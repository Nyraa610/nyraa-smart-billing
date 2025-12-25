import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck, 
  Calculator, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/" },
  { icon: FileText, label: "Factures", path: "/invoices" },
  { icon: FileCheck, label: "Devis", path: "/quotes" },
  { icon: Calculator, label: "Comptabilité", path: "/accounting" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 lg:p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
          <span className="text-primary-foreground font-bold text-lg">N</span>
        </div>
        <div>
          <h1 className="text-sidebar-foreground font-bold text-lg tracking-tight">Nyraa Digital</h1>
          <p className="text-sidebar-foreground/60 text-xs">Gestion & Facturation</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon 
                    size={20} 
                    className={cn(
                      "transition-colors flex-shrink-0",
                      isActive ? "text-primary" : "group-hover:text-primary"
                    )} 
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="p-3 space-y-2">
        {user && (
          <div className="px-4 py-2 text-xs text-sidebar-foreground/60 truncate">
            {user.email}
          </div>
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Déconnexion</span>
        </Button>
      </div>

      {/* Footer */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-sidebar-accent/50">
        <p className="text-sidebar-foreground/80 text-xs">
          © 2024 Nyraa Digital
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar h-16 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-primary-foreground font-bold">N</span>
          </div>
          <span className="text-sidebar-foreground font-bold">Nyraa Digital</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex gradient-sidebar h-screen w-64 flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
