'use client';

import { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, MapPin } from 'lucide-react';
import { AnimalReport, RescueStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HomeScreenProps {
  reports: AnimalReport[];
  onReportClick: () => void;
  onViewReport: (report: AnimalReport) => void;
}

const statusColors: Record<RescueStatus, string> = {
  pending: 'bg-destructive',
  notified: 'bg-primary',
  rescued: 'bg-[oklch(0.6_0.15_145)]',
};

const statusLabels: Record<RescueStatus, string> = {
  pending: 'Rescue Pending',
  notified: 'Volunteer Notified',
  rescued: 'Rescued',
};

export function HomeScreen({ reports, onReportClick, onViewReport }: HomeScreenProps) {
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const notifiedCount = reports.filter(r => r.status === 'notified').length;
  const rescuedCount = reports.filter(r => r.status === 'rescued').length;

  const selectedReport = reports.find(r => r.id === selectedPin);

  return (
    <div className="flex flex-col h-full">
      {/* Header with Stats */}
      <header className="bg-card px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">🐾</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">ClawAlert</h1>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between gap-2 bg-secondary/50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-sm text-foreground">
              <strong>{pendingCount}</strong> pending
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-foreground">
              <strong>{notifiedCount}</strong> notified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.6_0.15_145)]"></div>
            <span className="text-sm text-foreground">
              <strong>{rescuedCount}</strong> rescued
            </span>
          </div>
        </div>
      </header>

      {/* Map Area */}
      <div className="flex-1 relative bg-secondary/30 overflow-hidden">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>

        {/* Map Label */}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground border border-border">
          <MapPin className="w-3 h-3 inline mr-1" />
          Delhi NCR Region
        </div>

        {/* Map Pins */}
        <div className="absolute inset-0 p-8">
          {reports.map((report, index) => {
            // Distribute pins visually across the map
            const positions = [
              { top: '20%', left: '30%' },
              { top: '35%', left: '70%' },
              { top: '55%', left: '20%' },
              { top: '25%', left: '55%' },
              { top: '65%', left: '60%' },
              { top: '45%', left: '45%' },
            ];
            const pos = positions[index % positions.length];

            return (
              <button
                key={report.id}
                onClick={() => setSelectedPin(report.id === selectedPin ? null : report.id)}
                className={cn(
                  'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
                  selectedPin === report.id && 'scale-125 z-10'
                )}
                style={{ top: pos.top, left: pos.left }}
              >
                <div className="relative">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shadow-lg',
                      statusColors[report.status]
                    )}
                  >
                    <span className="text-lg">
                      {report.animalType === 'dog' && '🐕'}
                      {report.animalType === 'cat' && '🐈'}
                      {report.animalType === 'cow' && '🐄'}
                      {report.animalType === 'bird' && '🐦'}
                      {report.animalType === 'other' && '🐾'}
                    </span>
                  </div>
                  {/* Pin tail */}
                  <div
                    className={cn(
                      'absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0',
                      'border-l-[6px] border-l-transparent',
                      'border-r-[6px] border-r-transparent',
                      'border-t-[8px]',
                      report.status === 'pending' && 'border-t-destructive',
                      report.status === 'notified' && 'border-t-primary',
                      report.status === 'rescued' && 'border-t-[oklch(0.6_0.15_145)]'
                    )}
                  ></div>
                  {/* Pulse animation for pending */}
                  {report.status === 'pending' && (
                    <div className="absolute inset-0 rounded-full bg-destructive/30 animate-ping"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Pin Info Card */}
        {selectedReport && (
          <div className="absolute bottom-4 left-4 right-4 bg-card rounded-xl shadow-lg border border-border p-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  statusColors[selectedReport.status]
                )}
              >
                <span className="text-2xl">
                  {selectedReport.animalType === 'dog' && '🐕'}
                  {selectedReport.animalType === 'cat' && '🐈'}
                  {selectedReport.animalType === 'cow' && '🐄'}
                  {selectedReport.animalType === 'bird' && '🐦'}
                  {selectedReport.animalType === 'other' && '🐾'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground capitalize">
                    {selectedReport.animalType}
                  </h3>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium text-white',
                      statusColors[selectedReport.status]
                    )}
                  >
                    {statusLabels[selectedReport.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedReport.area}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimeAgo(selectedReport.reportedAt)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => onViewReport(selectedReport)}
              variant="outline"
              className="w-full mt-3"
              size="sm"
            >
              View Details
            </Button>
          </div>
        )}
      </div>

      {/* Report Button */}
      <div className="p-4 pb-20 bg-card border-t border-border">
        <Button
          onClick={onReportClick}
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
          size="lg"
        >
          Report an Animal 🆘
        </Button>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}
