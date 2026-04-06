'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { declineReport, getReports } from '@/app/actions';
import { AnimalReport } from '@/lib/types';
import { notifyEscalation } from '@/lib/whatsapp';

export default function DeclineReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;
  
  const [report, setReport] = useState<AnimalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    async function loadReport() {
      const reports = await getReports();
      const found = reports.find(r => r.id === reportId);
      setReport(found || null);
      setIsLoading(false);
    }
    loadReport();
  }, [reportId]);

  const handleDecline = async () => {
    if (!report) return;
    
    setIsSubmitting(true);
    
    const result = await declineReport(reportId);
    
    if (result.success) {
      // If this is the first decline, trigger escalation
      if ((report.declinedCount || 0) === 0) {
        const nextNGO = {
          name: 'Animal Aid Unlimited',
          phone: '+91-8765432100',
        };
        await notifyEscalation(report, nextNGO);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } else {
      console.error('Failed to decline report:', result.error);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="text-center">
          <CheckCircle className="w-24 h-24 text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-blue-900 mb-3">Noted!</h1>
          <p className="text-blue-800 mb-6">We&apos;ve escalated this case to another NGO</p>
          <p className="text-gray-600 text-sm">Redirecting home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="hover:opacity-80">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1">Unable to Help?</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-900">
            We understand. We&apos;ll find another organization to help this animal right away.
          </p>
        </div>

        {/* Case Details */}
        <div className="bg-card rounded-lg p-4 space-y-3 border border-border">
          <h2 className="font-bold text-foreground">Case Being Escalated</h2>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Animal:</span>
              <p className="font-medium capitalize">{report.animalType} - {report.location}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-medium">Sending to next available NGO</p>
            </div>
            {report.notes && (
              <div>
                <span className="text-muted-foreground">Details:</span>
                <p className="font-medium text-sm">{report.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reason Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Why can&apos;t you help? (Optional)
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
          >
            <option value="">Select a reason</option>
            <option value="too_far">Too far from our location</option>
            <option value="no_resources">Don&apos;t have resources right now</option>
            <option value="not_expertise">Outside our expertise</option>
            <option value="already_busy">Already handling other cases</option>
            <option value="other">Other reason</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleDecline}
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 font-semibold"
          >
            {isSubmitting ? 'Declining...' : '❌ I Can&apos;t Help'}
          </Button>
          <Button
            onClick={() => router.back()}
            disabled={isSubmitting}
            variant="outline"
            className="w-full h-12 font-semibold"
          >
            Back to Case
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-900">
            Don&apos;t worry - declining won&apos;t affect your rating. We just want to get help to the animals as quickly as possible.
          </p>
        </div>
      </div>
    </div>
  );
}
