'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn, getAdminSession, clearAdminSession } from '@/lib/admin-auth';
import { getAllReports, getTodayStats } from '@/app/admin/actions';
import { AnimalReport } from '@/lib/types';
import AdminLayout from '@/components/admin/admin-layout';
import AdminStats from '@/components/admin/admin-stats';
import AdminReportsTable from '@/components/admin/admin-reports-table';

interface DashboardStats {
  totalToday: number;
  pending: number;
  notified: number;
  rescued: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalToday: 0,
    pending: 0,
    notified: 0,
    rescued: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'status' | 'time'>('time');
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check if admin is logged in
    if (!isAdminLoggedIn()) {
      router.push('/admin/login');
      return;
    }

    // Fetch reports and stats
    const fetchData = async () => {
      try {
        const [reportsData, statsData] = await Promise.all([
          getAllReports(),
          getTodayStats(),
        ]);
        setReports(reportsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      report.reporterName.toLowerCase().includes(search) ||
      report.animalType.toLowerCase().includes(search) ||
      report.area.toLowerCase().includes(search)
    );
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <AdminLayout onLogout={handleLogout}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-slate-600">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Stats Cards */}
        <AdminStats stats={stats} />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by city, animal type, or reporter name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'status' | 'time')}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="time">Time Reported</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <AdminReportsTable
          reports={sortedReports}
          selectedReports={selectedReports}
          onSelectionChange={setSelectedReports}
        />
      </div>
    </AdminLayout>
  );
}
