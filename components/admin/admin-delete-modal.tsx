'use client';

import { useState } from 'react';
import { deleteReport } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface AdminDeleteModalProps {
  reportId: string;
  onClose: () => void;
}

export default function AdminDeleteModal({ reportId, onClose }: AdminDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');

    const result = await deleteReport(reportId);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to delete report');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle size={48} className="text-red-600" />
          </div>
          
          <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Report</h2>
          <p className="text-slate-600 mb-6">
            Are you sure you want to delete this report? This cannot be undone.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
