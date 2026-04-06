'use client';

import { Map, List, Phone, Plus, User } from 'lucide-react';
import { TabType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {/* Home/Map */}
        <button
          onClick={() => onTabChange('home')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors',
            activeTab === 'home'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Map className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* Reports List */}
        <button
          onClick={() => onTabChange('reports')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors',
            activeTab === 'reports'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <List className="w-5 h-5" />
          <span className="text-xs font-medium">Reports</span>
        </button>

        {/* Report Now - Center Big Button */}
        <button
          onClick={() => onTabChange('report')}
          className={cn(
            'flex flex-col items-center justify-center -mt-6 transition-transform active:scale-95',
            activeTab === 'report' && 'scale-105'
          )}
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Plus className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-xs font-semibold text-primary mt-1">Report</span>
        </button>

        {/* User/Helplines */}
        <button
          onClick={() => onTabChange('user')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors',
            activeTab === 'user'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">Account</span>
        </button>
      </div>
    </nav>
  );
}
