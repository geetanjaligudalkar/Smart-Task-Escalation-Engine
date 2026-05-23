/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Task, TaskStatus } from '../types';
import { Activity, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface AnalyticsSectionProps {
  tasks: Task[];
}

export default function AnalyticsSection({ tasks }: AnalyticsSectionProps) {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'Pending').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const escalated = tasks.filter((t) => t.status === 'Escalated').length;
  const resolved = tasks.filter((t) => t.status === 'Resolved').length;

  const todayStr = '2026-05-23';
  const overdueUnresolved = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'Resolved').length;

  // Compute stats ratios
  const resolvedPercent = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const escalatedPercent = total > 0 ? Math.round((escalated / total) * 100) : 0;
  const activeBlockedPercent = total > 0 ? Math.round((tasks.filter(t => t.blockersReason && t.status !== 'Resolved').length / total) * 100) : 0;

  // Escataltion paths count
  const l2Count = tasks.filter(t => t.escalationReport?.escalationPath.includes('L2')).length;
  const l3Count = tasks.filter(t => t.escalationReport?.escalationPath.includes('L3')).length;
  const l4Count = tasks.filter(t => t.escalationReport?.escalationPath.includes('L4')).length;

  // Priority count ratios for vector graph
  const highPriority = tasks.filter((t) => t.priority === 'High').length;
  const medPriority = tasks.filter((t) => t.priority === 'Medium').length;
  const lowPriority = tasks.filter((t) => t.priority === 'Low').length;

  const maxPriorityCount = Math.max(1, highPriority, medPriority, lowPriority);
  const highHeight = (highPriority / maxPriorityCount) * 100;
  const medHeight = (medPriority / maxPriorityCount) * 100;
  const lowHeight = (lowPriority / maxPriorityCount) * 100;

  return (
    <div id="analytics-section-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Tactical Backlog Stats Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
        <div>
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" /> Backlog Queue Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 shadow-3xs">
              <span className="block text-2xs font-bold text-slate-500">Backlog Items</span>
              <span className="text-2xl font-bold font-mono text-slate-900">{total}</span>
            </div>
            
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100/80 shadow-3xs">
              <span className="block text-2xs font-bold text-rose-700">Active Escalated</span>
              <span className="text-2xl font-bold font-mono text-rose-600">{escalated}</span>
            </div>

            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100/85 shadow-3xs">
              <span className="block text-2xs font-bold text-indigo-700">In Progress</span>
              <span className="text-2xl font-bold font-mono text-indigo-600">{inProgress}</span>
            </div>

            <div className="p-3 bg-emerald-50/75 rounded-xl border border-emerald-100/85 border-dashed shadow-3xs">
              <span className="block text-2xs font-bold text-emerald-700">Sprints Closed</span>
              <span className="text-2xl font-bold font-mono text-emerald-600">{resolved}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-2xs">
            <span className="text-slate-500 font-semibold">Sprint Health (Resolution %)</span>
            <span className="text-slate-800 font-bold">{resolvedPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${resolvedPercent}%` }} 
              id="progress-resolved-bar"
            />
          </div>
        </div>
      </div>

      {/* 2. Overdue Threat Analyzer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
        <div>
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" /> Overdue SLA Breach Risk
          </h3>

          <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl shadow-3xs">
            <div className="p-2.5 bg-white border border-amber-200 rounded-lg text-amber-600 shadow-3xs">
              <Clock className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <span className="text-2xs font-bold text-amber-600 uppercase tracking-widest block">Overdue Unresolved</span>
              <span className="text-2xl font-bold font-mono text-slate-900">{overdueUnresolved}</span>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Tasks breaching standard Powerweave SLAs</p>
            </div>
          </div>
          
          <div className="space-y-3.5 mt-5">
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span className="font-semibold">Task Blockers Blockage</span>
                <span className="text-amber-600 font-mono font-bold">{activeBlockedPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${activeBlockedPercent}%` }} 
                  id="progress-blocked-bar"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span className="font-semibold">Escalated Task Ratio</span>
                <span className="text-rose-600 font-mono font-bold">{escalatedPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full" 
                  style={{ width: `${escalatedPercent}%` }} 
                  id="progress-escalated-bar"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Priority Weighting (Responsive Vector Graph) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
        <div>
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-600" /> Vector Priority Volume
          </h3>
          
          {/* SVG Customized Horizontal/Vertical Bars */}
          <div className="h-28 flex items-end justify-around gap-2 px-2 pb-1 border-b border-slate-150 border-b-slate-200">
            {/* Low */}
            <div className="flex flex-col items-center w-12 group">
              <div 
                className="w-full rounded-t-md bg-emerald-100/80 border border-emerald-350 hover:bg-emerald-200 transition-all duration-500 flex items-end justify-center shadow-3xs cursor-pointer"
                style={{ height: `${Math.max(12, lowHeight)}%` }}
                id="bar-low-priority"
              >
                <span className="text-[10px] font-mono font-bold text-emerald-800 mb-1">{lowPriority}</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-mono">Low</span>
            </div>

            {/* Med */}
            <div className="flex flex-col items-center w-12 group">
              <div 
                className="w-full rounded-t-md bg-amber-100/80 border border-amber-300 hover:bg-amber-200 transition-all duration-500 flex items-end justify-center shadow-3xs cursor-pointer"
                style={{ height: `${Math.max(12, medHeight)}%` }}
                id="bar-med-priority"
              >
                <span className="text-[10px] font-mono font-bold text-amber-800 mb-1">{medPriority}</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-mono">Medium</span>
            </div>

            {/* High */}
            <div className="flex flex-col items-center w-12 group">
              <div 
                className="w-full rounded-t-md bg-rose-100/85 border border-rose-300 hover:bg-rose-200 transition-all duration-500 flex items-end justify-center shadow-3xs cursor-pointer"
                style={{ height: `${Math.max(12, highHeight)}%` }}
                id="bar-high-priority"
              >
                <span className="text-[10px] font-mono font-bold text-rose-800 mb-1">{highPriority}</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 font-mono">High</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-[11px] text-slate-500 font-mono">
          <span>Escalations Routing:</span>
          <span>L2: <strong className="text-blue-600 font-bold">{l2Count}</strong> / L4 Group: <strong className="text-indigo-600 font-bold">{l4Count}</strong></span>
        </div>
      </div>

    </div>
  );
}
