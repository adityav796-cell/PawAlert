'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { AnimalReport, RescueStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ReportsScreenProps {
  reports: AnimalReport[];
  onSelectReport: (report: AnimalReport) => void;
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

const animalIcons: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  cow: '🐄',
  bird: '🐦',
  other: '🐾',
};

export function ReportsScreen({ reports, onSelectReport }: ReportsScreenProps) {
  // Sort by newest first
  const sortedReports = [...reports].sort(
    (a, b) => b.reportedAt.getTime() - a.reportedAt.getTime()
  );

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-card px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">🐾</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">Recent Reports</h1>
        </div>
        {pendingCount > 0 && (
          <p className="text-sm text-destructive font-medium">
            ⚠️ {pendingCount} rescue{pendingCount !== 1 ? 's' : ''} pending today
          </p>
        )}
      </header>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-3">
          {sortedReports.map((report) => (
            <button
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="w-full bg-card rounded-xl border border-border p-4 text-left transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                {/* Animal Icon */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                    report.status === 'pending' && 'bg-destructive/10',
                    report.status === 'notified' && 'bg-primary/10',
                    report.status === 'rescued' && 'bg-[oklch(0.6_0.15_145)]/10'
                  )}
                >
                  <span className="text-3xl">{animalIcons[report.animalType]}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground capitalize">
                      {report.animalType} in distress
                    </h3>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {report.area}
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Status Badge */}
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-semibold text-white',
                        statusColors[report.status]
                      )}
                    >
                      {statusLabels[report.status]}
                    </span>

                    {/* Time */}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <TimeAgoDisplay date={report.reportedAt} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes preview if exists */}
              {report.notes && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border line-clamp-2 italic">
                  &ldquo;{report.notes}&rdquo;
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimeAgoDisplay({ date }: { date: Date }) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 60) {
        setTimeAgo(`${diffMins}m ago`);
      } else {
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) {
          setTimeAgo(`${diffHours}h ago`);
        } else {
          const diffDays = Math.floor(diffHours / 24);
          setTimeAgo(`${diffDays}d ago`);
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return <>{timeAgo || 'now'}</>;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
