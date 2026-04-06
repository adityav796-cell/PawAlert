'use client';

import { Phone, Building, MapPin } from 'lucide-react';
import { NGO } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HelplinesScreenProps {
  ngos: NGO[];
}

export function HelplinesScreen({ ngos }: HelplinesScreenProps) {
  const helplines = ngos.filter((n) => n.type === 'helpline');
  const organizations = ngos.filter((n) => n.type === 'ngo');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-card px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">📞</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Helplines & NGOs</h1>
            <p className="text-xs text-muted-foreground">
              Tap to call for immediate help
            </p>
          </div>
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Emergency Helplines */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
            Emergency Helplines
          </h2>
          <div className="space-y-3">
            {helplines.map((helpline) => (
              <div
                key={helpline.id}
                className="bg-destructive/5 border border-destructive/20 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {helpline.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      {helpline.areas.join(', ')}
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {helpline.phone}
                    </p>
                  </div>
                  <a
                    href={`tel:${helpline.phone.replace(/\s/g, '')}`}
                    className={cn(
                      'flex items-center justify-center gap-2',
                      'px-5 py-3 rounded-xl font-semibold',
                      'bg-destructive text-white',
                      'hover:bg-destructive/90 transition-colors',
                      'active:scale-95'
                    )}
                  >
                    <Phone className="w-5 h-5" />
                    Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NGOs */}
        <div className="p-4 pt-0">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Animal Rescue NGOs
          </h2>
          <div className="space-y-3">
            {organizations.map((ngo) => (
              <div
                key={ngo.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{ngo.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      {ngo.areas.join(', ')}
                    </div>
                    <p className="text-sm font-medium text-foreground">{ngo.phone}</p>
                  </div>
                  <a
                    href={`tel:${ngo.phone.replace(/\s/g, '')}`}
                    className={cn(
                      'flex items-center justify-center gap-2',
                      'px-4 py-2.5 rounded-xl font-medium text-sm',
                      'bg-primary text-primary-foreground',
                      'hover:bg-primary/90 transition-colors',
                      'active:scale-95'
                    )}
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 pt-0">
          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🐾 Every call can save a life. Thank you for caring!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
