import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { LayoutDashboard, ShoppingCart, Package, LogOut, Shield, Users } from 'lucide-react';
import api from '@/lib/api';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post('/auth/logout');
    logout();
    navigate('/login');
  };

  const navItems = [];

  if (user?.role === 'SUPER_ADMIN') {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: Shield });
  } else {
    navItems.push(
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/pos', label: 'Billing', icon: ShoppingCart },
      { to: '/inventory', label: 'Inventory', icon: Package }
    );
    if (user?.role === 'OWNER') {
      navItems.push({ to: '/staff', label: 'Staff', icon: Users });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary tracking-tight">Ladies Suit POS</h1>
          <p className="text-xs text-muted-foreground mt-1">{user?.name ?? 'Staff'}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h1 className="text-lg font-bold text-primary">Ladies Suit POS</h1>
          <nav className="flex gap-2">
            {navItems.map(({ to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
              </NavLink>
            ))}
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
