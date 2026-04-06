import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">PawAlert Admin</h1>
        
        <nav className="space-y-2 mb-8">
          <a
            href="/admin/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            Dashboard
          </a>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-700">
          <Button
            onClick={onLogout}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
