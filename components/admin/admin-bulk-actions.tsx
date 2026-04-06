'use client';

import { useState } from 'react';
import { bulkDeleteReports, bulkMarkAsRescued, bulkReassignNGO } from '@/app/admin/actions';
import { getNGOs } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle } from 'lucide-react';

interface AdminBulkActionsProps {
  selectedCount: number;
  selectedReportIds: string[];
  onActionComplete: () => void;
}

export default function AdminBulkActions({
  selectedCount,
  selectedReportIds,
  onActionComplete,
}: AdminBulkActionsProps) {
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState('');
  const [ngos, setNGOs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCount} reports? This cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await bulkDeleteReports(selectedReportIds);
    if (result.success) {
      onActionComplete();
    } else {
      setError(result.error || 'Failed to delete reports');
      setIsLoading(false);
    }
  };

  const handleBulkRescued = async () => {
    setIsLoading(true);
    setError('');

    const result = await bulkMarkAsRescued(selectedReportIds);
    if (result.success) {
      onActionComplete();
    } else {
      setError(result.error || 'Failed to update reports');
      setIsLoading(false);
    }
  };

  const handleReassignClick = async () => {
    const ngosList = await getNGOs();
    setNGOs(ngosList);
    setShowReassignModal(true);
  };

  const handleReassign = async () => {
    if (!selectedNGO) {
      setError('Please select an NGO');
      return;
    }

    const ngo = ngos.find(n => n.id === selectedNGO);
    if (!ngo) return;

    setIsLoading(true);
    setError('');

    const result = await bulkReassignNGO(
      selectedReportIds,
      ngo.id,
      ngo.name,
      ngo.phone
    );

    if (result.success) {
      setShowReassignModal(false);
      onActionComplete();
    } else {
      setError(result.error || 'Failed to reassign reports');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <p className="text-sm font-medium text-blue-900">
        {selectedCount} report{selectedCount !== 1 ? 's' : ''} selected
      </p>

      <div className="flex gap-2">
        <Button
          onClick={handleBulkRescued}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <CheckCircle size={16} />
          Mark as Rescued
        </Button>

        <Button
          onClick={handleReassignClick}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Reassign NGO
        </Button>

        <Button
          onClick={handleBulkDelete}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          <Trash2 size={16} />
          Bulk Delete
        </Button>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Reassign to NGO</h2>

            <select
              value={selectedNGO}
              onChange={(e) => setSelectedNGO(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 mb-4"
            >
              <option value="">Select an NGO...</option>
              {ngos.map((ngo) => (
                <option key={ngo.id} value={ngo.id}>
                  {ngo.name}
                </option>
              ))}
            </select>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setShowReassignModal(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReassign}
                disabled={isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? 'Reassigning...' : 'Reassign'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
