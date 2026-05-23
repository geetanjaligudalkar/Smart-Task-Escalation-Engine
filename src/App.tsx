/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Sparkles, Send, RefreshCw, Layers, Bell, Settings, Plus,
  Search, Filter, Activity, CheckCircle, Clock, Check, ChevronRight, HelpCircle, AlertCircle
} from 'lucide-react';
import { Task, UserRole, EscalationNotification, EscalationRule, PriorityLevel } from '@/src/types';

// Import Custom components
import RoleSelector from './components/RoleSelector.tsx';
import AlertInbox from './components/AlertInbox.tsx';
import TaskCard from './components/TaskCard.tsx';
import TaskForm from './components/TaskForm.tsx';
import EscalationRules from './components/EscalationRules.tsx';
import AnalyticsSection from './components/AnalyticsSection.tsx';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<EscalationNotification[]>([]);
  const [rules, setRules] = useState<EscalationRule[]>([]);
  
  // App States
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.ASSIGNEE);
  const [activeTab, setActiveTab] = useState<'backlog' | 'alerts' | 'rules'>('backlog');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Loaders
  const [isLoading, setIsLoading] = useState(true);
  const [isEscalatingId, setIsEscalatingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Fetch initial backlog from server on mount
  useEffect(() => {
    fetchBacklogData();
  }, []);

  const fetchBacklogData = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, notificationsRes, rulesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/notifications'),
        fetch('/api/rules')
      ]);

      if (tasksRes.ok && notificationsRes.ok && rulesRes.ok) {
        const tasksData = await tasksRes.json();
        const notificationsData = await notificationsRes.json();
        const rulesData = await rulesRes.json();
        
        setTasks(tasksData);
        setNotifications(notificationsData);
        setRules(rulesData);
      }
    } catch (err) {
      console.error('Failed to load server mock database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Update Task status / blockers (For Assignees and Managers)
  const handleUpdateTaskStatus = async (id: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
        
        // If status resolved, refresh notifications (as server adds new resolution alert)
        if (updates.status === 'Resolved') {
          const notifRes = await fetch('/api/notifications');
          if (notifRes.ok) {
            setNotifications(await notifRes.ok ? await notifRes.json() : []);
          }
        }
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // 2. Submit New Backlog Task (For Assignees and Admins)
  const handleCreateTask = async (taskPayload: {
    name: string;
    description: string;
    assigneeName: string;
    assigneeEmail: string;
    managerName: string;
    managerEmail: string;
    dueDate: string;
    priority: PriorityLevel;
  }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload)
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, newTask]);
        setShowTaskModal(false);
      }
    } catch (err) {
      console.error('Failed to create operations task:', err);
    }
  };

  // 3. Trigger manual individual task escalation (For Manager and Admin override)
  const handleManualEscalate = async (id: string) => {
    try {
      setIsEscalatingId(id);
      const res = await fetch(`/api/tasks/${id}/escalate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Update local tasks
        setTasks(prev => prev.map(t => t.id === id ? data.task : t));
        // Prepend new notification
        setNotifications(prev => [data.notification, ...prev]);
      }
    } catch (err) {
      console.error('Failed to manually escalate target:', err);
    } finally {
      setIsEscalatingId(null);
    }
  };

  // 4. Force global background scanning engine (Checks and Auto-Escalates)
  const handleTriggerGlobalScan = async () => {
    try {
      setIsScanning(true);
      setScanMessage(null);
      const res = await fetch('/api/escalate-scan', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setScanMessage(data.message);
        
        // Refresh everything since multiple items could be modified
        await fetchBacklogData();
      }
    } catch (err) {
      console.error('Failed to run global scheduler scan:', err);
      setScanMessage('Failed to connect to corporate scheduler systems.');
    } finally {
      setIsScanning(false);
    }
  };

  // 5. Notification utilities
  const handleMarkNotifRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Failed to read notification:', err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/clear', { method: 'POST' });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to flush notification alerts:', err);
    }
  };

  // 6. Rule config modifications
  const handleToggleRule = async (id: string, isEnabled: boolean) => {
    try {
      const res = await fetch(`/api/rules/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled })
      });
      if (res.ok) {
        const updatedRule = await res.json();
        setRules(prev => prev.map(r => r.id === id ? updatedRule : r));
      }
    } catch (err) {
      console.error('Failed to toggle rule state:', err);
    }
  };

  const handleUpdateRuleConfig = async (id: string, hoursOverdueThreshold: number, escalationPathDefault: string) => {
    try {
      const res = await fetch(`/api/rules/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursOverdueThreshold, escalationPathDefault })
      });
      if (res.ok) {
        const updatedRule = await res.json();
        setRules(prev => prev.map(r => r.id === id ? updatedRule : r));
      }
    } catch (err) {
      console.error('Failed to save rule configs:', err);
    }
  };

  // Filter Backlog items
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Overdue') {
      const isOverdue = t.dueDate < '2026-05-23' && t.status !== 'Resolved';
      return matchesSearch && isOverdue;
    }
    if (statusFilter === 'Blocked') return matchesSearch && !!t.blockersReason && t.status !== 'Resolved';
    return matchesSearch && t.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500/10">
      
      {/* Dynamic Scan Trigger Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
          <div className="p-8 max-w-sm w-full bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-xl">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900">Executing Escalation Audit Scan</h4>
              <p className="text-xs text-slate-500">Scanning metadata, mapping SLAs, and executing GenAI decisions...</p>
            </div>
            <div className="text-[10px] bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-500 font-mono">
              {"GET /api/tasks -> Evaluating thresholds"}
            </div>
          </div>
        </div>
      )}

      {/* Corporate Header Section */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl shadow-xs">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-wide text-slate-900 uppercase font-sans leading-none">Powerweave</h1>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 font-bold tracking-widest rounded-full uppercase leading-none font-mono">Core OPS</span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">Smart SLA Escalation Panel</p>
            </div>
          </div>

          {/* Action Tools Bar */}
          <div className="flex items-center gap-3.5">
            {/* Global Audit Trigger (Admins only!) */}
            <button
              onClick={handleTriggerGlobalScan}
              disabled={isScanning || activeRole !== UserRole.ADMIN}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                activeRole === UserRole.ADMIN
                  ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 cursor-pointer shadow-xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={activeRole === UserRole.ADMIN ? 'Audit backend sprint overdue states' : 'Only systems managers/admin can trigger system level scanning audits'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              Run Escalation Scan
            </button>

            {/* Backlog Creator */}
            <button
              onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-style cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
          </div>

        </div>
      </header>

      {/* Main Corporate Interface Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Interactive SDLR Role Selection Block */}
        <RoleSelector currentRole={activeRole} onRoleChange={setActiveRole} />

        {/* Global audit feedback alerts trigger notifications */}
        {scanMessage && (
          <div className="p-4 bg-emerald-550/10 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 animate-fade-in animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <p><strong>Database Audit Run Finished:</strong> {scanMessage}</p>
            </div>
            <button
              onClick={() => setScanMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-mono font-bold cursor-pointer"
            >
              [CLOSE]
            </button>
          </div>
        )}

        {/* Real-time SVG Metric Analytics Grid */}
        <AnalyticsSection tasks={tasks} />

        {/* Content Tabs & Center Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDEBARS (Alerts Center & Rule configurations toggles depending on active tab view) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Internal Tab Navigator Column */}
            <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-col gap-1.5 shadow-sm">
              <button
                onClick={() => setActiveTab('backlog')}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'backlog'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-3xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" /> Operational Task Backlog
                </span>
                <span className="text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full font-mono text-slate-600">{tasks.length}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'alerts'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-3xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-500" /> Alerts Notification Center
                </span>
                <span className="text-[10px] bg-red-105 text-red-650 bg-red-100 text-red-650 text-red-600 px-2.5 py-0.5 rounded-full font-mono font-bold border border-red-200">{notifications.filter(n=>!n.isRead).length}</span>
              </button>

              <button
                onClick={() => setActiveTab('rules')}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'rules'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-3xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-500" /> Rule Engine Variables
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  {activeRole === UserRole.ADMIN ? 'Admin' : 'ReadOnly'}
                </span>
              </button>
            </div>

            {/* Notifications Alert Center Quick Widget (Only if backlog tab serves main, else renders alerts) */}
            {activeTab !== 'alerts' && (
              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold tracking-wider uppercase text-[10px]">Active Warnings Log</span>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                </div>
                {notifications.slice(0, 2).map(n => (
                  <div key={n.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] leading-normal space-y-1 text-slate-700">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <span>{n.taskName}</span>
                      <span className="text-slate-500">Log Entry</span>
                    </div>
                    <p className="line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Informational SDLR Card */}
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/20 border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" /> Executive SLA Operations
              </h4>
              <p className="text-[11px] text-slate-600 leading-normal">
                Powerweave incorporates structured enterprise delivery lifecycles. Our auto-scheduler computes hours overdue in relation to sprint target deadlines and triggers a <strong>Gemini-integrated review</strong> to dynamically route issues.
              </p>
              <div className="text-[10px] flex items-center gap-2 text-slate-500">
                <span className="px-2 py-1 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">Assignee</span>
                <ChevronRight className="w-3 h-3 text-blue-500" />
                <span className="px-2 py-1 rounded bg-white text-slate-600 border border-slate-250 border-slate-200 shadow-2xs">AI Analyzer</span>
                <ChevronRight className="w-3 h-3 text-blue-500" />
                <span className="px-2 py-1 rounded bg-white text-slate-650 text-slate-600 border border-slate-200 shadow-2xs">VP alert</span>
              </div>
            </div>

          </div>

          {/* CENTRAL INTERACTIVE PANEL DISPLAY FOR SELECTED TAB */}
          <div className="lg:col-span-2">
            
            {/* TAB 1: RUN BACKLOG MANAGER */}
            {activeTab === 'backlog' && (
              <div className="space-y-6">
                
                {/* Search, Grouping, and Backlog Filters */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                  
                  {/* Search input bar */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search backlog workflows, blockages, or assignees..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500/50 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Filter grouping buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                    <button
                      onClick={() => setStatusFilter('All')}
                      className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        statusFilter === 'All'
                          ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-3xs'
                          : 'text-slate-600 hover:text-slate-800 bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      All Backlog
                    </button>
                    
                    <button
                      onClick={() => setStatusFilter('Overdue')}
                      className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        statusFilter === 'Overdue'
                          ? 'bg-amber-50 border-amber-200 text-amber-850 shadow-3xs'
                          : 'text-slate-600 hover:text-slate-800 bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> SLA Breach (Overdue)
                    </button>

                    <button
                      onClick={() => setStatusFilter('Blocked')}
                      className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        statusFilter === 'Blocked'
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-850 shadow-3xs'
                          : 'text-slate-600 hover:text-slate-800 bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-indigo-505 text-indigo-500" /> Active Blockers
                    </button>

                    <button
                      onClick={() => setStatusFilter('Escalated')}
                      className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                        statusFilter === 'Escalated'
                          ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-3xs'
                          : 'text-slate-600 hover:text-slate-800 bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Auto-Escalated
                    </button>

                    <button
                      onClick={() => setStatusFilter('Resolved')}
                      className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        statusFilter === 'Resolved'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-805 text-emerald-800 shadow-3xs'
                          : 'text-slate-600 hover:text-slate-800 bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>

                </div>

                {/* Loading indicator bar */}
                {isLoading ? (
                  <div className="text-center py-20 text-slate-500">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-600 mb-3" />
                    <p className="text-sm font-sans">Connecting with SDLR corporate database repositories...</p>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="bg-slate-900/20 border border-slate-850 rounded-2xl text-center py-16 text-slate-500">
                    <Layers className="w-10 h-10 text-slate-750 mx-auto mb-2" />
                    <p className="text-sm">No backlog items match the current search filters</p>
                    <p className="text-xs text-slate-600/90 mt-1">Submit a new task or adjust the criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onManualEscalate={handleManualEscalate}
                        activeRole={activeRole}
                        isEscalating={isEscalatingId === task.id}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: alerts center inbox logs */}
            {activeTab === 'alerts' && (
              <AlertInbox
                notifications={notifications}
                onMarkAsRead={handleMarkNotifRead}
                onClearAll={handleClearAllNotifications}
                activeRole={activeRole}
              />
            )}

            {/* TAB 3: corporate global policy configurations */}
            {activeTab === 'rules' && (
              <div className="space-y-5">
                {activeRole !== UserRole.ADMIN ? (
                  <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl text-center space-y-4">
                    <HelpCircle className="w-12 h-12 text-slate-650 mx-auto" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300">Administrative Permissions Blocked</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mt-1">
                        Your active role is currently set to <strong>{activeRole}</strong>. Adjusting global SLA escalation policy triggers requires full <strong>Systems Administrator</strong> clearance.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveRole(UserRole.ADMIN)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Override and Switch to Admin Role
                    </button>
                  </div>
                ) : (
                  <EscalationRules
                    rules={rules}
                    onToggleRule={handleToggleRule}
                    onUpdateRuleConfig={handleUpdateRuleConfig}
                  />
                )}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Task Creation Form Overlay ModalPopup */}
      {showTaskModal && (
        <TaskForm
          onSubmit={handleCreateTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {/* Footer system markers */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-12 py-6 text-[11px] text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row items-center justify-between gap-4 font-mono">
          <span>© 2026 Powerweave Security Systems. All operations compiled.</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Node server active: Port 3000
          </span>
        </div>
      </footer>

    </div>
  );
}
