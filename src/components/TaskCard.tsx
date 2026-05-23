/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Clock, AlertTriangle, AlertCircle, CheckCircle, Play, Sparkles, 
  ChevronRight, ArrowRight, CornerDownRight, User, HelpCircle, Send, Plus
} from 'lucide-react';
import { Task, UserRole, PriorityLevel, TaskStatus } from '@/src/types';

interface TaskCardProps {
  key?: any;
  task: any;
  onUpdateStatus: (id: string, updates: any) => any;
  onManualEscalate: (id: string) => any;
  activeRole: any;
  isEscalating: boolean;
}

export default function TaskCard({ task, onUpdateStatus, onManualEscalate, activeRole, isEscalating }: TaskCardProps) {
  const [showBlockerInput, setShowBlockerInput] = useState(false);
  const [blockerText, setBlockerText] = useState(task.blockersReason || '');
  const [showRemediation, setShowRemediation] = useState(true);

  const todayStr = '2026-05-23';
  const isOverdue = task.dueDate < todayStr && task.status !== 'Resolved';
  const hasBlocker = !!task.blockersReason;

  const handleBlockerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(task.id, { blockersReason: blockerText.trim() });
    setShowBlockerInput(false);
  };

  const handleStatusChange = (status: TaskStatus) => {
    onUpdateStatus(task.id, { status });
  };

  const getPriorityStyles = (p: PriorityLevel) => {
    switch (p) {
      case 'High':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Medium':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  const getStatusStyles = (s: TaskStatus) => {
    switch (s) {
      case 'Resolved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Escalated':
        return 'text-rose-850 text-rose-800 bg-rose-50 border-rose-200 font-medium animate-pulse';
      case 'In Progress':
        return 'text-blue-700 bg-blue-50 border-blue-250 border-blue-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className={`relative rounded-xl border transition-all duration-200 overflow-hidden ${
        task.status === 'Escalated'
          ? 'bg-rose-50/10 border-rose-300 hover:border-rose-400 hover:shadow-2xs'
          : isOverdue
          ? 'bg-amber-50/10 border-amber-300 hover:border-amber-400 hover:shadow-2xs'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      
      {/* Visual Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        task.status === 'Escalated' 
          ? 'bg-rose-500 shadow-3xs' 
          : isOverdue 
          ? 'bg-amber-500' 
          : 'bg-slate-300'
      }`} />

      {/* Main Block */}
      <div className="p-5">
        
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getPriorityStyles(task.priority)}`}>
              {task.priority} Impact
            </span>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyles(task.status)}`}>
              {task.status}
            </span>
            {isOverdue && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 border border-rose-200 rounded-full flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Overdue
              </span>
            )}
            {hasBlocker && task.status !== 'Resolved' && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-650" /> Blocked
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5" />
            Due: <strong className={isOverdue ? 'text-rose-600' : 'text-slate-600'}>{task.dueDate}</strong>
          </div>
        </div>

        {/* Task Title & Description */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 leading-normal transition-colors">
          {task.name}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-sans">
            {task.description}
          </p>
        )}

        {/* Stakeholders Block */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-3.5 border-t border-slate-100 text-[11px]">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Assignee</span>
            <span className="text-slate-700 font-semibold block truncate" title={task.assigneeEmail}>
              {task.assigneeName} {task.assigneeEmail === 'geetanjali.gudalkar.powerweave@gmail.com' && ' (You)'}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Manager</span>
            <span className="text-slate-600 font-medium block truncate" title={task.managerEmail}>
              {task.managerName}
            </span>
          </div>
        </div>

        {/* Active Blocker Display */}
        {task.blockersReason && task.status !== 'Resolved' && (
          <div className="mt-4 p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-amber-900 shadow-3xs">
            <strong className="text-amber-800 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1">
              <CornerDownRight className="w-3.5 h-3.5 shrink-0 text-amber-600" /> Reported Blocker Bottleneck:
            </strong>
            <p className="leading-normal font-sans italic text-slate-700">"{task.blockersReason}"</p>
          </div>
        )}

        {/* ========================================= */}
        {/* ESCALATION REPORT BOX (AI Generated Details) */}
        {/* ========================================= */}
        {task.status === 'Escalated' && task.escalationReport && (
          <div className="mt-5 border-t border-rose-100 pt-4 space-y-4">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between bg-rose-50 border border-rose-100 p-3 rounded-xl shadow-3xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-rose-900">Smart Escalation Activated</p>
                  <p className="text-[10px] text-rose-600 font-mono">Route: {task.escalationReport.escalationPath}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-rose-100 border border-rose-200 text-rose-800 rounded">
                Tier: {task.escalationReport.escalationPriority}
              </span>
            </div>

            {/* Root Cause Analysis section */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 shadow-3xs">
              <h5 className="text-[10px] uppercase font-bold tracking-wider text-rose-805 text-rose-700 flex items-center gap-1">
                🔬 AI Root Cause Bottleneck Analyzer:
              </h5>
              <p className="text-xs text-slate-700 leading-normal pr-1 font-sans">
                {task.escalationReport.rootCauseAnalysis}
              </p>
            </div>

            {/* Suggested Remediation Checklist */}
            <div className="space-y-2">
              <button 
                onClick={() => setShowRemediation(!showRemediation)}
                className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-between w-full hover:text-slate-750 cursor-pointer"
              >
                <span>🚀 AI Suggested Remediation Action Plan:</span>
                <span className="text-xs font-mono">{showRemediation ? '[-]' : '[+]'}</span>
              </button>
              
              {showRemediation && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-3xs">
                  <div className="text-xs text-slate-700 space-y-1.5 whitespace-pre-wrap font-sans leading-relaxed">
                    {task.escalationReport.suggestedRemediation}
                  </div>
                </div>
              )}
            </div>

            {/* Drafted Manager Notification Alert Message */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-3xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Drafted Manager Notification Preview</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 rounded font-mono text-slate-600">Sent automatically</span>
              </div>
              <textarea 
                readOnly
                value={task.escalationReport.draftedNotification}
                className="w-full bg-white border-slate-200 border text-[11px] text-slate-600 p-2.5 rounded-lg outline-none font-mono leading-normal resize-none h-18 focus:border-blue-500/50 transition-all font-semibold"
              />
            </div>

          </div>
        )}

        {/* ========================================= */}
        {/* ACTIONS / CONTROLS BY ROLE */}
        {/* ========================================= */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          
          {/* ASSIGNEE CONTROLS */}
          {activeRole === UserRole.ASSIGNEE && (
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {task.status === 'Pending' && (
                  <button
                    onClick={() => handleStatusChange('In Progress')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Task
                  </button>
                )}
                {task.status !== 'Resolved' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('Resolved')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                    {!showBlockerInput && (
                      <button
                        onClick={() => setShowBlockerInput(true)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-350 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        {task.blockersReason ? 'Modify Blocker' : 'Report Blocker'}
                      </button>
                    )}
                  </>
                )}
                {task.status === 'Resolved' && (
                  <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Task Completed successfully.
                  </p>
                )}
              </div>

              {showBlockerInput && (
                <form onSubmit={handleBlockerSubmit} className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-amber-700">Describe Blocker Bottleneck:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={blockerText}
                      onChange={(e) => setBlockerText(e.target.value)}
                      placeholder="e.g. database server connections timeout in VPC subnet..."
                      className="flex-1 bg-white border border-slate-200 focus:border-amber-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs leading-none transition-colors cursor-pointer"
                    >
                      Log
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBlockerInput(false)}
                      className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg text-xs leading-none transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* MANAGER CONTROLS & ESCALATION OVERRIDE */}
          {activeRole === UserRole.MANAGER && (
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {task.status !== 'Resolved' && (
                    <button
                      onClick={() => handleStatusChange('Resolved')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-3 h-3" /> Close Escalation
                    </button>
                  )}
                  {task.status !== 'Escalated' && task.status !== 'Resolved' && (
                    <button
                      onClick={() => onManualEscalate(task.id)}
                      disabled={isEscalating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-250 hover:border-rose-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-rose-500" />
                      {isEscalating ? 'Running AI Engine...' : 'Escalate to VP'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-2xs text-slate-500 font-semibold">
                  <span>Modify Impact:</span>
                  <select
                    value={task.priority}
                    onChange={(e) => onUpdateStatus(task.id, { priority: e.target.value as PriorityLevel })}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 text-2xs font-semibold outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEMIC ADMIN CONTROLS (FULL BYPASS) */}
          {activeRole === UserRole.ADMIN && (
            <div className="flex-1 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                {task.status !== 'Resolved' && (
                  <button
                    onClick={() => handleStatusChange('Resolved')}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 border border-emerald-255 border-emerald-200 text-emerald-700 hover:text-white rounded-lg font-bold transition-all cursor-pointer"
                  >
                    Force Resolve
                  </button>
                )}
                <button
                  onClick={() => onManualEscalate(task.id)}
                  disabled={isEscalating}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 border border-rose-255 border-rose-200 text-rose-700 hover:text-white rounded-lg font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  {isEscalating ? 'AI Escalating...' : 'Force AI Escalation'}
                </button>
              </div>

              <div className="flex items-center gap-2 text-2xs font-semibold">
                <span className="text-slate-500 uppercase tracking-wider">Due Date Override:</span>
                <input
                  type="date"
                  value={task.dueDate}
                  onChange={(e) => onUpdateStatus(task.id, { dueDate: e.target.value })}
                  className="bg-white border border-slate-200 text-slate-700 rounded px-1.5 py-0.5 outline-none font-mono text-[10px] focus:border-blue-500/50 cursor-pointer"
                />
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
