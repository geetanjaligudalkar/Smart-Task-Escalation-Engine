/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle, Trash2, Mail, ExternalLink } from 'lucide-react';
import { EscalationNotification } from '../types';

interface AlertInboxProps {
  notifications: EscalationNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  activeRole: string;
}

export default function AlertInbox({ notifications, onMarkAsRead, onClearAll, activeRole }: AlertInboxProps) {
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const displayedNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div id="alert-inbox-container" className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col h-[480px] shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shadow-3xs">
            <Bell className="w-5 h-5 animate-pulse" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-3xs">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Alert Notification Center</h3>
            <p className="text-xs text-slate-500 font-semibold">Live escalation telemetry for Managers & Admin</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterUnreadOnly
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'text-slate-600 bg-slate-50 border border-slate-200 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Unread Only
          </button>
          
          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
            title="Clear all alerts"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {displayedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
            <CheckCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-700 font-semibold">No notification alerts</p>
            <p className="text-xs text-slate-505 text-slate-500 mt-1">Check status scan to process overdue tasks</p>
          </div>
        ) : (
          displayedNotifications.map((notif) => {
            const isEscalation = notif.type === 'Escalation';
            const isResolution = notif.type === 'Resolution';

            return (
              <div
                key={notif.id}
                id={`notification-card-${notif.id}`}
                className={`p-3.5 rounded-xl border transition-all ${
                  notif.isRead
                    ? 'bg-slate-50/65 border-slate-200 opacity-70 shadow-3xs'
                    : isEscalation
                    ? 'bg-rose-50/15 border-rose-200 hover:border-rose-300 shadow-3xs'
                    : isResolution
                    ? 'bg-emerald-50/15 border-emerald-200 hover:border-emerald-300 shadow-3xs'
                    : 'bg-blue-50/15 border-blue-200 shadow-3xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${
                    isEscalation 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                      : isResolution 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {isEscalation ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {notif.taskName}
                      </p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 font-medium">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-605 text-slate-600 mt-1 whitespace-pre-wrap leading-normal break-words">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-500 flex items-center gap-1 font-semibold">
                        <Mail className="w-2.5 h-2.5 text-slate-400" />
                        To: {notif.managerEmail}
                      </span>
                      
                      {!notif.isRead && (
                        <button
                          onClick={() => onMarkAsRead(notif.id)}
                          className="text-rose-600 hover:text-emerald-700 font-bold transition-colors cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          Last Engine sync: Auto
        </span>
        <span className="uppercase tracking-wide text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-605 text-slate-600">
          User Context: {activeRole}
        </span>
      </div>
    </div>
  );
}
