'use client';

import { useState, useEffect } from 'react';
import { LogOut, Edit2, Save, MessageSquare, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getUserSession, clearUserSession } from '@/lib/user-auth';
import { getUserReports, updateUserProfile } from '@/lib/user-actions';
import { AnimalReport } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UserProfileScreenProps {
  onLogout: () => void;
  onBack?: () => void;
}

export function UserProfileScreen({ onLogout, onBack }: UserProfileScreenProps) {
  const session = getUserSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.name || '');
  const [email, setEmail] = useState('');
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'reports'>('profile');

  useEffect(() => {
    if (session?.userId) {
      loadUserReports();
    }
  }, [session?.userId]);

  const loadUserReports = async () => {
    if (!session?.userId) return;
    setLoading(true);
    const result = await getUserReports(session.userId);
    setLoading(false);
    if (result.success && result.reports) {
      setReports(
        result.reports.map((r: any) => ({
          id: r.id,
          animalType: r.animal_type,
          location: r.location,
          area: r.area,
          reportedAt: new Date(r.reported_at),
          status: r.status,
          photo: r.photo,
          reporterName: r.reporter_name,
          reporterContact: r.reporter_contact,
          assignedNGO: r.assigned_ngo,
          assignedNGOName: r.assigned_ngo_name,
          notes: r.notes,
          coordinates: {
            lat: r.lat,
            lng: r.lng,
          },
        }))
      );
    }
  };

  const handleSaveProfile = async () => {
    if (!session?.userId) return;
    setSaveLoading(true);
    const result = await updateUserProfile(session.userId, { name, email });
    setSaveLoading(false);

    if (result.success) {
      setIsEditing(false);
      // Update session with new name
      const updatedSession = { ...session, name };
      clearUserSession();
      // In a real app, we'd update the session properly
    }
  };

  const handleLogout = () => {
    clearUserSession();
    onLogout();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'notified':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'rescued':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'Pending',
      notified: 'Notified NGO',
      rescued: 'Rescued',
    };
    return badges[status] || status;
  };

  const animalEmojis: Record<string, string> = {
    dog: '🐕',
    cat: '🐈',
    cow: '🐄',
    bird: '🐦',
    other: '🦴',
  };

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-orange-100 text-sm">+91 {session.phoneNumber.slice(-10)}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'profile'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            'flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'reports'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          My Reports ({reports.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-4 max-w-md mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-600">{email || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <p className="text-gray-900 font-medium">+91 {session.phoneNumber.slice(-10)}</p>
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>

              <div className="flex gap-2 pt-4">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saveLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setName(session.name);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading your reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200 m-4">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No reports yet</p>
                <p className="text-sm text-gray-500">Start by reporting an injured animal</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">
                        {animalEmojis[report.animalType] || '🦴'}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 capitalize">
                          {report.animalType}
                        </h3>
                        <p className="text-sm text-gray-600">{report.location}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-1 rounded-full border',
                        getStatusColor(report.status)
                      )}
                    >
                      {getStatusBadge(report.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.area}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {report.reportedAt.toLocaleDateString()}
                    </div>
                  </div>

                  {report.assignedNGOName && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                      <p className="font-medium text-blue-900">{report.assignedNGOName}</p>
                      {report.assignedNGOContact && (
                        <p className="text-blue-700">{report.assignedNGOContact}</p>
                      )}
                    </div>
                  )}

                  {report.notes && (
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-700">
                      {report.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
