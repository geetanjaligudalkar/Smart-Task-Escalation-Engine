/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, X, Calendar, AlertTriangle, User, Mail, ShieldAlert } from 'lucide-react';
import { PriorityLevel } from '../types';

interface TaskFormProps {
  onSubmit: (task: {
    name: string;
    description: string;
    assigneeName: string;
    assigneeEmail: string;
    managerName: string;
    managerEmail: string;
    dueDate: string;
    priority: PriorityLevel;
  }) => void;
  onClose: () => void;
}

export default function TaskForm({ onSubmit, onClose }: TaskFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeName, setAssigneeName] = useState('Geetanjali Gudalkar');
  const [assigneeEmail, setAssigneeEmail] = useState('geetanjali.gudalkar.powerweave@gmail.com');
  const [managerName, setManagerName] = useState('Marcus Vance');
  const [managerEmail, setManagerEmail] = useState('marcus.vance@powerweave.com');
  
  // Default to yesterday to make it overdue by default so they can test auto-escalations easily!
  const [dueDate, setDueDate] = useState('2026-05-20');
  const [priority, setPriority] = useState<PriorityLevel>('High');

  const todayStr = '2026-05-23';
  const isOverdueSelected = dueDate < todayStr;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assigneeEmail.trim() || !dueDate) return;
    
    onSubmit({
      name,
      description,
      assigneeName,
      assigneeEmail,
      managerName,
      managerEmail,
      dueDate,
      priority
    });
    
    // reset form fields
    setName('');
    setDescription('');
  };

  return (
    <div id="task-form-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-lg shadow-3xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Submit New Operations Task</h3>
              <p className="text-xs text-slate-500 font-semibold">Add operational task parameters to Powerweave backlog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Task Name */}
          <div>
            <label className="block text-2xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">Task Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deploy Database Relational Schema Migration"
              className="w-full bg-white border border-slate-200 focus:border-blue-500/50 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 font-sans font-semibold shadow-3xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-2xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">Task Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what services are involved and any required configurations..."
              rows={3}
              className="w-full bg-white border border-slate-200 focus:border-blue-500/50 rounded-xl px-3.5 py-2 text-sm text-slate-850 text-slate-800 outline-none transition-all placeholder:text-slate-400 font-sans resize-none font-semibold shadow-3xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee Selection */}
            <div>
              <label className="block text-2xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">Assignee Details</label>
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    placeholder="Name"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500/50 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-800 outline-none transition-all font-semibold shadow-3xs"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={assigneeEmail}
                    onChange={(e) => setAssigneeEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500/50 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none transition-all font-mono font-semibold shadow-3xs"
                  />
                </div>
              </div>
            </div>

            {/* Manager Designation */}
            <div>
              <label className="block text-2xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">Manager Designation</label>
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Name"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500/50 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-800 outline-none transition-all font-semibold shadow-3xs"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-white border border-slate-200 focus:border-blue-500/50 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none transition-all font-mono font-semibold shadow-3xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Due Date Calendar Picker */}
            <div>
              <label className="block text-2xs uppercase tracking-wider font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500/50 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none transition-all font-mono font-semibold cursor-pointer shadow-3xs"
              />
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-2xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">Priority / Severity Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500/50 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none transition-all font-sans font-semibold cursor-pointer shadow-3xs"
              >
                <option value="Low">🟢 Low Impact</option>
                <option value="Medium">🟡 Medium Impact</option>
                <option value="High">🔴 High Impact / Urgent</option>
              </select>
            </div>
          </div>

          {/* Test Help Helper notification */}
          {isOverdueSelected && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-medium leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <p>
                <strong>Testing Helper:</strong> The deadline is set before today ({todayStr}). This task counts as <strong>overdue</strong> and will automatically trigger the <strong>Smart Escalation Engine</strong> upon running the system scan!
              </p>
            </div>
          )}

          {/* Form Actions footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-650 text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-3xs hover:shadow-2xs cursor-pointer"
            >
              Submit Backlog Task
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
