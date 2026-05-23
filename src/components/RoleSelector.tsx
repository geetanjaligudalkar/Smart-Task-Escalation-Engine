/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, User, Briefcase, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const roles = [
    {
      role: UserRole.ASSIGNEE,
      label: 'Assignee (Geetanjali)',
      description: 'Submit progress & flag blockers',
      icon: User,
      color: 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300',
      activeColor: 'border-emerald-500 text-emerald-800 bg-emerald-50/50 shadow-xs'
    },
    {
      role: UserRole.MANAGER,
      label: 'Manager (Marcus)',
      description: 'Review alerts & delegate remediation',
      icon: Briefcase,
      color: 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300',
      activeColor: 'border-blue-500 text-blue-800 bg-blue-50/50 shadow-xs'
    },
    {
      role: UserRole.ADMIN,
      label: 'Systems Administrator',
      description: 'Configure rules & run system scans',
      icon: Shield,
      color: 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300',
      activeColor: 'border-indigo-500 text-indigo-800 bg-indigo-50/50 shadow-xs'
    }
  ];

  return (
    <div id="role-selector-container" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Role-Based Persona Selector</h3>
          <p className="text-xs text-slate-500">Toggle views instantly to test permissions and features</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full animate-pulse">
          <Sparkles className="w-3 h-3" />
          SDLR Compliant
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((item) => {
          const Icon = item.icon;
          const isActive = currentRole === item.role;
          return (
            <button
              key={item.role}
              id={`role-btn-${item.role.toLowerCase()}`}
              onClick={() => onRoleChange(item.role)}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none cursor-pointer ${
                isActive ? item.activeColor : item.color
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-white border border-slate-200/50 shadow-3xs' : 'bg-slate-100'}`}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-800'}`}>{item.label}</p>
                <p className="text-xs text-slate-500 leading-tight mt-1 truncate">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
