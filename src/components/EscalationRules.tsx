/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, ShieldAlert, Sparkles, Check, ChevronRight, Save, Clock, HelpCircle } from 'lucide-react';
import { EscalationRule } from '../types';

interface EscalationRulesProps {
  rules: EscalationRule[];
  onToggleRule: (id: string, isEnabled: boolean) => void;
  onUpdateRuleConfig: (id: string, hoursOverdueThreshold: number, escalationPathDefault: string) => void;
}

export default function EscalationRules({ rules, onToggleRule, onUpdateRuleConfig }: EscalationRulesProps) {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState<number>(24);
  const [editPath, setEditPath] = useState<string>('');

  const handleEditClick = (rule: EscalationRule) => {
    setEditingRuleId(rule.id);
    setEditHours(rule.hoursOverdueThreshold);
    setEditPath(rule.escalationPathDefault);
  };

  const handleSave = (id: string) => {
    onUpdateRuleConfig(id, editHours, editPath);
    setEditingRuleId(null);
  };

  return (
    <div id="escalation-rules-container" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      
      {/* Title block */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl shadow-3xs">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Systemic Escalation Rule Engine</h3>
            <p className="text-xs text-slate-500 font-semibold">Tune auto-escalation thresholds and AI routing parameters</p>
          </div>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-4">
        {rules.map((rule) => {
          const isEditing = editingRuleId === rule.id;

          return (
            <div
              key={rule.id}
              id={`rule-block-${rule.id}`}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                rule.isEnabled
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-3xs'
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex shrink-0 h-2 w-2 rounded-full ${rule.isEnabled ? 'bg-purple-600 animate-pulse' : 'bg-slate-400'}`} />
                    <h4 className="text-xs font-bold text-slate-900 truncate">{rule.name}</h4>
                    <span className="text-[10px] bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                      <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                      {rule.aiModelToUse}
                    </span>
                  </div>
                  <p className="text-xs text-slate-550 text-slate-500 mt-1 leading-normal pr-4 font-sans">
                    {rule.description}
                  </p>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Overdue Threshold (Hours)
                        </label>
                        <input
                          type="number"
                          value={editHours}
                          onChange={(e) => setEditHours(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-purple-250 focus:border-purple-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none font-semibold transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1">
                          Default Alert Routing Target
                        </label>
                        <input
                          type="text"
                          value={editPath}
                          onChange={(e) => setEditPath(e.target.value)}
                          className="w-full bg-white border border-purple-250 focus:border-purple-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-800 outline-none font-semibold transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[10px] text-slate-500 font-semibold font-mono">
                      <span className="bg-white px-2.5 py-1 border border-slate-200 rounded text-slate-600">
                        ⌛ Escalates after {rule.hoursOverdueThreshold} hr(s) overdue
                      </span>
                      <span className="bg-white px-2.5 py-1 border border-slate-200 rounded flex items-center gap-1.5 leading-none text-slate-600">
                        <ChevronRight className="w-3 h-3 text-purple-650 text-purple-600" />
                        Default Routing: <strong className="text-slate-900 font-bold">{rule.escalationPathDefault}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2.5 shrink-0">
                  {/* Status Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-550 text-slate-500 uppercase tracking-wider">
                      {rule.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => onToggleRule(rule.id, !rule.isEnabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.isEnabled ? 'bg-purple-600' : 'bg-slate-250 bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          rule.isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Actions buttons */}
                  {isEditing ? (
                    <button
                      onClick={() => handleSave(rule.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-605 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Save className="w-3 h-3" /> Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditClick(rule)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-605 text-slate-600 border border-slate-200 hover:border-slate-350 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Edit Config
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-[11px] text-slate-600 leading-normal font-sans font-medium">
        <HelpCircle className="w-4 h-4 text-slate-405 text-slate-500 shrink-0" />
        <span>
          <strong>Powerweave SDLR Operations guidelines:</strong> Global policies are processed immediately during escalation scans. Adjust rule parameters with caution to prevent accidental over-routing or high notification volumes.
        </span>
      </div>

    </div>
  );
}
