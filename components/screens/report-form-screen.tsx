'use client';

import { useState } from 'react';
import { Camera, Upload, CheckCircle } from 'lucide-react';
import { AnimalType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createReport } from '@/app/actions';

interface ReportFormScreenProps {
  onSubmit: () => void;
}

const animalTypes: { value: AnimalType; label: string; icon: string }[] = [
  { value: 'dog', label: 'Dog', icon: '🐕' },
  { value: 'cat', label: 'Cat', icon: '🐈' },
  { value: 'cow', label: 'Cow', icon: '🐄' },
  { value: 'bird', label: 'Bird', icon: '🐦' },
  { value: 'other', label: 'Other', icon: '🐾' },
];

export function ReportFormScreen({ onSubmit }: ReportFormScreenProps) {
  const [formData, setFormData] = useState({
    animalType: '' as AnimalType | '',
    location: '',
    area: '',
    reporterName: '',
    reporterContact: '',
    notes: '',
  });
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animalType) return;
    
    setIsSubmitting(true);

    const result = await createReport({
      animalType: formData.animalType as AnimalType,
      location: formData.location,
      area: formData.area,
      reporterName: formData.reporterName,
      reporterContact: formData.reporterContact,
      notes: formData.notes || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);

      // Reset and redirect after showing success
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          animalType: '',
          location: '',
          area: '',
          reporterName: '',
          reporterContact: '',
          notes: '',
        });
        setPhotoUploaded(false);
        onSubmit();
      }, 2000);
    } else {
      // In a real app, show error toast
      console.error('Failed to submit report:', result.error);
    }
  };

  const isFormValid =
    formData.animalType &&
    formData.location &&
    formData.area &&
    formData.reporterName &&
    formData.reporterContact;

  if (showSuccess) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="w-24 h-24 rounded-full bg-[oklch(0.6_0.15_145)] flex items-center justify-center mb-6 animate-in zoom-in duration-300">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
          Alert Sent Successfully!
        </h2>
        <p className="text-muted-foreground text-center">
          Nearby volunteers and NGOs have been notified. Thank you for helping! 🙏
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-card px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">🆘</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Report an Animal</h1>
            <p className="text-xs text-muted-foreground">Help us rescue faster</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-5">
          {/* Animal Type */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Animal Type <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {animalTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, animalType: type.value }))
                  }
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all',
                    formData.animalType === type.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/30'
                  )}
                >
                  <span className="text-2xl mb-1">{type.icon}</span>
                  <span className="text-xs font-medium text-foreground">
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Description */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-foreground mb-2"
            >
              Location Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="e.g., Near the big banyan tree, opposite to SBI Bank"
              rows={2}
              className="w-full px-4 py-3 bg-secondary rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Area/Landmark */}
          <div>
            <label
              htmlFor="area"
              className="block text-sm font-semibold text-foreground mb-2"
            >
              Area / Landmark <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="area"
              value={formData.area}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, area: e.target.value }))
              }
              placeholder="e.g., Lajpat Nagar, South Delhi"
              className="w-full px-4 py-3 bg-secondary rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Photo (helps rescue faster)
            </label>
            <button
              type="button"
              onClick={() => setPhotoUploaded(!photoUploaded)}
              className={cn(
                'w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all',
                photoUploaded
                  ? 'border-[oklch(0.6_0.15_145)] bg-[oklch(0.6_0.15_145)]/10'
                  : 'border-border bg-secondary hover:border-primary/50'
              )}
            >
              {photoUploaded ? (
                <>
                  <CheckCircle className="w-8 h-8 text-[oklch(0.6_0.15_145)]" />
                  <span className="text-sm font-medium text-[oklch(0.6_0.15_145)]">
                    Photo uploaded
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Tap to take photo or upload
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <hr className="border-border" />

          {/* Your Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Your Information
            </h3>

            {/* Reporter Name */}
            <div className="mb-4">
              <label
                htmlFor="reporterName"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Your Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="reporterName"
                value={formData.reporterName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reporterName: e.target.value }))
                }
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-secondary rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Reporter Contact */}
            <div>
              <label
                htmlFor="reporterContact"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Contact Number <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                id="reporterContact"
                value={formData.reporterContact}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reporterContact: e.target.value,
                  }))
                }
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-secondary rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-semibold text-foreground mb-2"
            >
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Describe the animal's condition, any injuries, behavior, etc."
              rows={3}
              className="w-full px-4 py-3 bg-secondary rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={cn(
              'w-full h-14 text-lg font-semibold shadow-lg',
              'bg-primary hover:bg-primary/90 text-primary-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Sending Alert...
              </span>
            ) : (
              'Send Rescue Alert 🆘'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
