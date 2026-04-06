'use client';

import { useState } from 'react';
import { AnimalReport } from '@/lib/types';
import { Edit, Trash2, Phone, MoreVertical } from 'lucide-react';
import AdminEditModal from './admin-edit-modal';
import AdminDeleteModal from './admin-delete-modal';
import AdminBulkActions from './admin-bulk-actions';

interface AdminReportsTableProps {
  reports: AnimalReport[];
  selectedReports: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
}

export default function AdminReportsTable({
  reports,
  selectedReports,
  onSelectionChange,
}: AdminReportsTableProps) {
  const [editingReport, setEditingReport] = useState<AnimalReport | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [expandedReporterId, setExpandedReporterId] = useState<string | null>(null);

  const toggleSelectReport = (reportId: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    onSelectionChange(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReports.size === reports.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(reports.map(r => r.id)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'notified':
        return 'bg-purple-100 text-purple-800';
      case 'rescued':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {selectedReports.size > 0 && (
        <AdminBulkActions
          selectedCount={selectedReports.size}
          selectedReportIds={Array.from(selectedReports)}
          onActionComplete={() => onSelectionChange(new Set())}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedReports.size === reports.length && reports.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Report ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Animal</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Reporter</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">NGO Assigned</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Time Reported</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  No reports found
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.has(report.id)}
                      onChange={() => toggleSelectReport(report.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{report.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 capitalize">{report.animalType}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{report.location}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setExpandedReporterId(expandedReporterId === report.id ? null : report.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {report.reporterName}
                      {expandedReporterId === report.id && (
                        <div className="absolute bg-white border border-slate-200 rounded-lg p-3 mt-2 shadow-lg z-10">
                          <p className="text-sm text-slate-700">{report.reporterName}</p>
                          <p className="text-sm text-slate-600 mb-3">{report.reporterContact}</p>
                          <a
                            href={`tel:${report.reporterContact}`}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <Phone size={16} />
                            Call
                          </a>
                        </div>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {report.assignedNGOName || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{formatDate(report.reportedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReport(report)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingReportId(report.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingReport && (
        <AdminEditModal
          report={editingReport}
          onClose={() => setEditingReport(null)}
        />
      )}

      {/* Delete Modal */}
      {deletingReportId && (
        <AdminDeleteModal
          reportId={deletingReportId}
          onClose={() => setDeletingReportId(null)}
        />
      )}
    </div>
  );
}
