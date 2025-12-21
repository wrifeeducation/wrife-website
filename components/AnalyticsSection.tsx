'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

interface AnalyticsData {
  activeUsers: {
    today: number;
    week: number;
    month: number;
  };
  eventBreakdown: Record<string, Record<string, number>>;
  dailyActivity: Array<{
    date: string;
    events: number;
    uniqueUsers: number;
  }>;
  recentActivity: Array<{
    id: string;
    userId: string;
    userRole: string;
    eventType: string;
    eventData: Record<string, unknown>;
    createdAt: string;
    email: string;
    displayName: string;
  }>;
  userCounts: Record<string, number>;
}

function formatEventType(eventType: string): string {
  const labels: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    lesson_view: 'Lesson View',
    lesson_download: 'Download',
    pwp_start: 'PWP Started',
    pwp_complete: 'PWP Completed',
    dwp_start: 'DWP Started',
    dwp_complete: 'DWP Completed',
    assignment_create: 'Assignment Created',
    assignment_submit: 'Assignment Submitted',
    class_create: 'Class Created',
    pupil_add: 'Pupil Added',
    page_view: 'Page View',
  };
  return labels[eventType] || eventType;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getEventIcon(eventType: string): string {
  const icons: Record<string, string> = {
    login: '🔑',
    logout: '👋',
    lesson_view: '📖',
    lesson_download: '📥',
    pwp_start: '✏️',
    pwp_complete: '✅',
    dwp_start: '📝',
    dwp_complete: '🏆',
    assignment_create: '📋',
    assignment_submit: '📤',
    class_create: '🏫',
    pupil_add: '👤',
    page_view: '👁️',
  };
  return icons[eventType] || '📊';
}

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    teacher: 'bg-blue-100 text-blue-700',
    pupil: 'bg-green-100 text-green-700',
    school_admin: 'bg-purple-100 text-purple-700',
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
}

export default function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const response = await adminFetch('/api/admin/analytics');
      const json = await response.json();
      
      if (json.error) {
        throw new Error(json.error);
      }
      
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl border border-red-200 p-6 mb-6">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const totalUsers = Object.values(data.userCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[var(--wrife-border)] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--wrife-text-main)]">Platform Analytics</h2>
        <button
          onClick={() => setShowActivityFeed(!showActivityFeed)}
          className="text-sm text-[var(--wrife-blue)] hover:underline"
        >
          {showActivityFeed ? 'Hide Activity' : 'Show Activity Feed'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">{data.activeUsers.today}</div>
          <div className="text-xs text-blue-600/70">Active Today</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{data.activeUsers.week}</div>
          <div className="text-xs text-green-600/70">This Week</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-600">{data.activeUsers.month}</div>
          <div className="text-xs text-purple-600/70">This Month</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-600">{totalUsers}</div>
          <div className="text-xs text-yellow-600/70">Total Users</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(data.userCounts).map(([role, count]) => (
          <div key={role} className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(role)}`}>
              {role}
            </span>
            <span className="text-[var(--wrife-text-muted)]">{count}</span>
          </div>
        ))}
      </div>

      {Object.keys(data.eventBreakdown).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--wrife-text-main)] mb-3">Activity This Week</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(data.eventBreakdown).slice(0, 8).map(([eventType, roles]) => {
              const total = Object.values(roles).reduce((a, b) => a + b, 0);
              return (
                <div key={eventType} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getEventIcon(eventType)}</span>
                    <span className="text-xs font-medium text-[var(--wrife-text-main)]">
                      {formatEventType(eventType)}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[var(--wrife-text-main)]">{total}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showActivityFeed && data.recentActivity.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--wrife-text-main)] mb-3">Recent Activity</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
              >
                <span className="text-lg">{getEventIcon(activity.eventType)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--wrife-text-main)] truncate">
                      {activity.displayName || activity.email || 'Unknown User'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(activity.userRole)}`}>
                      {activity.userRole}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--wrife-text-muted)]">
                    {formatEventType(activity.eventType)}
                  </div>
                </div>
                <div className="text-xs text-[var(--wrife-text-muted)] whitespace-nowrap">
                  {formatTimeAgo(activity.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recentActivity.length === 0 && (
        <div className="text-center py-8 text-[var(--wrife-text-muted)]">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No activity recorded yet</p>
          <p className="text-xs">Activity will appear here as users interact with the platform</p>
        </div>
      )}
    </div>
  );
}
