'use client';

import { useState, useEffect } from 'react';
import { X, Phone, MessageCircle, MapPin, Clock, User, Building } from 'lucide-react';
import { AnimalReport, RescueStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReportDetailModalProps {
  report: AnimalReport;
  onClose: () => void;
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

export function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  const whatsappMessage = encodeURIComponent(
    `🆘 PawAlert: ${report.animalType.toUpperCase()} needs help!\n\n` +
    `📍 Location: ${report.location}\n` +
    `🏘️ Area: ${report.area}\n` +
    `📝 Notes: ${report.notes || 'None'}\n\n` +
    `Please help if you can! 🙏`
  );

  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 px-4 pt-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  statusColors[report.status]
                )}
              >
                <span className="text-2xl">{animalIcons[report.animalType]}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground capitalize">
                  {report.animalType} Rescue
                </h2>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold text-white',
                    statusColors[report.status]
                  )}
                >
                  {statusLabels[report.status]}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Photo Placeholder */}
        <div className="aspect-video bg-secondary flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl block mb-2">{animalIcons[report.animalType]}</span>
            <p className="text-sm text-muted-foreground">Photo unavailable</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-4">
          {/* Location */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">{report.location}</p>
                <p className="text-sm text-muted-foreground">{report.area}</p>
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 px-4">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Reported <TimeAgoDisplay date={report.reportedAt} />
            </p>
          </div>

          {/* Notes */}
          {report.notes && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm font-medium text-foreground mb-1">Description:</p>
              <p className="text-sm text-muted-foreground">{report.notes}</p>
            </div>
          )}

          {/* Divider */}
          <hr className="border-border" />

          {/* Reporter Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Reporter Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <p className="text-foreground">{report.reporterName}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <p className="text-foreground">{report.reporterContact}</p>
                </div>
                <a
                  href={`tel:${report.reporterContact.replace(/\s/g, '')}`}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Call
                </a>
              </div>
            </div>
          </div>

          {/* Assigned NGO/Volunteer */}
          {(report.assignedNGO || report.assignedVolunteer) && (
            <>
              <hr className="border-border" />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Assigned Rescuer
                </h3>
                <div className="space-y-3">
                  {report.assignedNGO && (
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-muted-foreground" />
                      <p className="text-foreground">{report.assignedNGO}</p>
                    </div>
                  )}
                  {report.assignedVolunteer && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <p className="text-foreground">{report.assignedVolunteer}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-xl font-semibold transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Share on WhatsApp
            </a>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-12"
            >
              Close
            </Button>
          </div>
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
        setTimeAgo(`${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`);
      } else {
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) {
          setTimeAgo(`${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`);
        } else {
          const diffDays = Math.floor(diffHours / 24);
          setTimeAgo(`${diffDays} day${diffDays !== 1 ? 's' : ''} ago`);
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return <>{timeAgo || 'just now'}</>;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}
