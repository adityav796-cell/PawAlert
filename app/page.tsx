'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { BottomNavigation } from '@/components/bottom-navigation';
import { HomeScreen } from '@/components/screens/home-screen';
import { ReportsScreen } from '@/components/screens/reports-screen';
import { ReportFormScreen } from '@/components/screens/report-form-screen';
import { HelplinesScreen } from '@/components/screens/helplines-screen';
import { UserLoginScreen } from '@/components/screens/user-login-screen';
import { UserProfileScreen } from '@/components/screens/user-profile-screen';
import { ReportDetailModal } from '@/components/report-detail-modal';
import { TabType, AnimalReport, NGO } from '@/lib/types';
import { getReports, getNGOs } from './actions';
import { isUserLoggedIn } from '@/lib/user-auth';

// SWR fetchers using server actions
const fetchReports = async (): Promise<AnimalReport[]> => {
  return getReports();
};

const fetchNGOs = async (): Promise<NGO[]> => {
  return getNGOs();
};

export default function PawAlertApp() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedReport, setSelectedReport] = useState<AnimalReport | null>(null);
  const [isUserLoggedInState, setIsUserLoggedInState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    setIsUserLoggedInState(isUserLoggedIn());
    setIsHydrated(true);
  }, []);

  // Fetch data with SWR
  const { data: reports = [], mutate: mutateReports, isLoading: reportsLoading } = useSWR(
    'reports',
    fetchReports,
    { revalidateOnFocus: true, refreshInterval: 30000 }
  );

  const { data: ngos = [], isLoading: ngosLoading } = useSWR(
    'ngos',
    fetchNGOs
  );

  const handleViewReport = (report: AnimalReport) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  const handleReportSubmit = useCallback(() => {
    mutateReports();
    setActiveTab('home');
  }, [mutateReports]);

  const handleUserLogin = () => {
    setIsUserLoggedInState(true);
    setActiveTab('home');
  };

  const handleUserLogout = () => {
    setIsUserLoggedInState(false);
    setActiveTab('home');
  };

  const handleTabChange = (tab: TabType) => {
    // If user tab is selected and user is not logged in, show login
    if (tab === 'user' && !isUserLoggedInState) {
      setActiveTab('user');
    } else {
      setActiveTab(tab);
    }
  };

  const isLoading = reportsLoading || ngosLoading;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🐾</span>
          </div>
          <p className="text-muted-foreground">Loading PawAlert...</p>
        </div>
      </div>
    );
  }

  // Show user login if not logged in and user tab is selected
  if (activeTab === 'user' && !isUserLoggedInState) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto relative">
        <UserLoginScreen onLoginSuccess={handleUserLogin} />
      </div>
    );
  }

  if (isLoading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🐾</span>
          </div>
          <p className="text-muted-foreground">Loading PawAlert...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Mobile App Container */}
      <div className="h-[100dvh] flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'home' && (
            <HomeScreen
              reports={reports}
              onReportClick={() => setActiveTab('report')}
              onViewReport={handleViewReport}
            />
          )}
          {activeTab === 'reports' && (
            <ReportsScreen
              reports={reports}
              onSelectReport={handleViewReport}
            />
          )}
          {activeTab === 'report' && (
            <ReportFormScreen onSubmit={handleReportSubmit} />
          )}
          {activeTab === 'helplines' && (
            <HelplinesScreen ngos={ngos} />
          )}
          {activeTab === 'user' && isUserLoggedInState && (
            <UserProfileScreen onLogout={handleUserLogout} />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={handleCloseModal} />
      )}
    </div>
  );
}
