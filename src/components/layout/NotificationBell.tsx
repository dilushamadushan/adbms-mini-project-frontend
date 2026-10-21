'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  UserPlus,
  Calendar,
  BedDouble,
  TestTube,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { NotificationItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return dateStr;
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function getNotificationIcon(type: string) {
  const upper = type.toUpperCase();
  if (upper.includes('STAFF')) {
    return <UserPlus className="w-4 h-4 text-emerald-600" />;
  }
  if (upper.includes('APPT') || upper.includes('APPOINTMENT')) {
    return <Calendar className="w-4 h-4 text-indigo-600" />;
  }
  if (upper.includes('BED') || upper.includes('ADMIT') || upper.includes('DISCHARGE')) {
    return <BedDouble className="w-4 h-4 text-amber-600" />;
  }
  if (upper.includes('LAB')) {
    return <TestTube className="w-4 h-4 text-cyan-600" />;
  }
  if (upper.includes('ALERT') || upper.includes('CRITICAL')) {
    return <AlertTriangle className="w-4 h-4 text-rose-600" />;
  }
  return <Info className="w-4 h-4 text-[#0E4749]" />;
}

export function NotificationBell() {
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount(role || undefined);
      setUnreadCount(count);
    } catch {
    }
  }, [role]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({
        limit: 20,
        role: role || undefined,
        is_read: filter === 'UNREAD' ? false : undefined,
      });
      setNotifications(res.items || []);
      setUnreadCount(res.unread_count ?? 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [role, filter]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(role || undefined);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      const deletedItem = notifications.find((n) => n.notification_id === id);
      setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
      if (deletedItem && !deletedItem.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const filteredNotifications =
    filter === 'UNREAD' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-[#5B6472] hover:text-[#0E4749] hover:bg-gray-100 transition-colors focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 bg-[#E07856] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#DCE3E0] z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 border-b border-[#DCE3E0] bg-gray-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#0E4749] text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#E07856]/15 text-[#E07856] font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchNotifications()}
                disabled={loading}
                title="Refresh"
                className="text-gray-400 hover:text-[#0E4749] p-1 rounded hover:bg-gray-200/50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-[#0E4749] hover:underline font-semibold flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-[#DCE3E0] bg-white text-xs font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${filter === 'ALL'
                  ? 'border-[#0E4749] text-[#0E4749]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${filter === 'UNREAD'
                  ? 'border-[#0E4749] text-[#0E4749]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-[#DCE3E0]/60">
            {loading && notifications.length === 0 ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-gray-600">All caught up!</p>
                <p className="mt-0.5">No notifications to display.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isExpanded = expandedId === n.notification_id;
                const hasDetails = n.details && Object.keys(n.details).length > 0;

                return (
                  <div
                    key={n.notification_id}
                    onClick={() => {
                      if (!n.is_read) handleMarkAsRead(n.notification_id);
                      if (hasDetails) {
                        setExpandedId(isExpanded ? null : n.notification_id);
                      }
                    }}
                    className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer group flex items-start gap-3 ${!n.is_read ? 'bg-teal-50/40' : ''
                      }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#DCE3E0] shadow-2xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {formatTimeAgo(n.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      {hasDetails && isExpanded && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-[11px] font-mono text-gray-700 border border-gray-200 space-y-1">
                          {Object.entries(n.details || {}).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-400">{key}:</span>
                              <span className="font-semibold">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1.5 pt-1">
                        {hasDetails ? (
                          <span className="text-[10px] text-[#0E4749] font-medium flex items-center gap-0.5">
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isExpanded ? 'Less' : 'Details'}
                          </span>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(n.notification_id, e)}
                              className="text-[10px] text-[#0E4749] hover:underline font-semibold"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(n.notification_id, e)}
                            className="text-gray-400 hover:text-red-600 p-0.5"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#E07856] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
