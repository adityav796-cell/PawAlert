'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { acceptReport, getReports } from '@/app/actions';
import { AnimalReport } from '@/lib/types';
import { notifyReporterOfAcceptance } from '@/lib/whatsapp';

export default function AcceptReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;
  
  const [report, setReport] = useState<AnimalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadReport() {
      const reports = await getReports();
      const found = reports.find(r => r.id === reportId);
      setReport(found || null);
      setIsLoading(false);
    }
    loadReport();
  }, [reportId]);

  const handleAccept = async () => {
    if (!report) return;
    
    setIsSubmitting(true);
    
    // Mock NGO info - in production, get from request parameters
    const ngoName = 'Blue Cross of India';
    const ngoContact = '+91-9876543210';
    const ngoId = '550e8400-e29b-41d4-a716-446655440000';

    const result = await acceptReport(reportId, ngoId, ngoName, ngoContact);
    
    if (result.success) {
      // Send WhatsApp notification to reporter
      await notifyReporterOfAcceptance(report, ngoName, ngoContact);
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } else {
      console.error('Failed to accept report:', result.error);
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
        <div className="text-center">
          <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-green-900 mb-3">Thank You! 🎉</h1>
          <p className="text-green-800 mb-2">You&apos;ve accepted the rescue case</p>
          <p className="text-green-700 text-sm mb-6">Reporter has been notified via WhatsApp</p>
          <p className="text-gray-600 text-sm">Redirecting home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="hover:opacity-80">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1">Accept Rescue Case</h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Case Summary */}
        <div className="bg-card rounded-lg p-4 space-y-3 border border-border">
          <h2 className="font-bold text-foreground">Rescue Case Details</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Animal Type:</span>
              <span className="font-medium capitalize">{report.animalType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium text-right">{report.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Area:</span>
              <span className="font-medium">{report.area}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reporter:</span>
              <span className="font-medium">{report.reporterName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium">{report.reporterContact}</span>
            </div>
            {report.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="font-medium text-sm mt-1">{report.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 font-semibold"
          >
            {isSubmitting ? 'Accepting...' : '✅ Accept & Take Case'}
          </Button>
          <Button
            onClick={() => router.push(`/ngo/decline/${reportId}`)}
            disabled={isSubmitting}
            variant="outline"
            className="w-full h-12 font-semibold"
          >
            ❌ Can&apos;t Help Right Now
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            By accepting, you agree to contact the reporter and help rescue this animal. The reporter has been notified with your contact information.
          </p>
        </div>
      </div>
    </div>
  );
}
