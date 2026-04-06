'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markAsRescued, getReports } from '@/app/actions';
import { AnimalReport } from '@/lib/types';

export default function RescuedPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;
  
  const [report, setReport] = useState<AnimalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    async function loadReport() {
      const reports = await getReports();
      const found = reports.find(r => r.id === reportId);
      setReport(found || null);
      setIsLoading(false);
    }
    loadReport();
  }, [reportId]);

  const handleRescuePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUploaded(true);
      // In a real app, upload to storage here
      console.log('[v0] Photo uploaded:', file.name);
    }
  };

  const handleMarkRescued = async () => {
    if (!report) return;
    
    setIsSubmitting(true);
    
    const result = await markAsRescued(
      reportId,
      photoUploaded ? 'rescue_photo_url' : undefined
    );
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } else {
      console.error('Failed to mark as rescued:', result.error);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-4">Report Not Found</h1>
          <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="text-center space-y-6">
          <CheckCircle className="w-32 h-32 text-green-600 mx-auto" />
          <div>
            <h1 className="text-4xl font-bold text-green-900 mb-2">Mission Complete! 🎉</h1>
            <p className="text-green-800 text-lg mb-1">Another life saved!</p>
            <p className="text-green-700 text-sm">Thank you for your compassion and quick action</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">
              📊 Impact: {report.animalType.charAt(0).toUpperCase() + report.animalType.slice(1)} rescued successfully
            </p>
            <p className="text-xs text-gray-600">This will be added to your organization&apos;s statistics</p>
          </div>
          <p className="text-gray-600 text-sm">Redirecting home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="hover:opacity-80">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1">Mark as Rescued</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-900">
            🎉 Congratulations on helping this animal! Please complete the details below.
          </p>
        </div>

        {/* Case Summary */}
        <div className="bg-card rounded-lg p-4 space-y-3 border border-border">
          <h2 className="font-bold text-foreground">Rescue Case Summary</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Animal:</span>
              <span className="font-medium capitalize">{report.animalType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium text-right">{report.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reporter:</span>
              <span className="font-medium">{report.reporterName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Reported:</span>
              <span className="font-medium text-sm">
                {report.reportedAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            📸 Rescue Completion Photo (Optional)
          </label>
          <label className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
            photoUploaded
              ? 'border-green-300 bg-green-50'
              : 'border-border hover:border-primary'
          }`}>
            <Upload className={`w-6 h-6 ${photoUploaded ? 'text-green-600' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium text-center">
              {photoUploaded ? '✅ Photo Added' : 'Click to upload or drag & drop'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleRescuePhotoUpload}
              disabled={isSubmitting}
              className="hidden"
            />
          </label>
        </div>

        {/* Additional Notes */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            📝 Additional Notes (Optional)
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            disabled={isSubmitting}
            placeholder="What was the animal's condition? How did the rescue go? Any health notes?"
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground resize-none h-24"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleMarkRescued}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 font-semibold"
          >
            {isSubmitting ? 'Submitting...' : '✅ Confirm Rescue Complete'}
          </Button>
          <Button
            onClick={() => router.back()}
            disabled={isSubmitting}
            variant="outline"
            className="w-full h-12 font-semibold"
          >
            Back
          </Button>
        </div>

        {/* Impact Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-blue-900">💡 Your Impact</p>
          <p className="text-xs text-blue-800">
            This rescue will be recorded in your organization&apos;s impact statistics and help us identify areas with high animal rescue needs.
          </p>
        </div>
      </div>
    </div>
  );
}
