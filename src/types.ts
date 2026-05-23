/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  ASSIGNEE = 'Assignee'
}

export type PriorityLevel = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'Pending' | 'In Progress' | 'Escalated' | 'Resolved';

export interface EscalationReport {
  escalatedAt: string;
  escalationPriority: 'High' | 'Critical' | 'Blocker';
  escalationPath: string; // e.g., L1 Operational Lead, L2 Functional Manager, L3 Executive Sponsor
  rootCauseAnalysis: string;
  draftedNotification: string;
  suggestedRemediation: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  assigneeName: string;
  assigneeEmail: string;
  managerName: string;
  managerEmail: string;
  dueDate: string; // YYYY-MM-DD
  createdDate: string; // YYYY-MM-DD
  priority: PriorityLevel;
  status: TaskStatus;
  blockersReason?: string;
  escalationReport?: EscalationReport;
}

export interface EscalationNotification {
  id: string;
  taskId: string;
  taskName: string;
  managerEmail: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'Alert' | 'Escalation' | 'Resolution';
}

export interface EscalationRule {
  id: string;
  name: string;
  description: string;
  hoursOverdueThreshold: number; // e.g., 24, 48
  aiModelToUse: string;
  escalationPathDefault: string;
  isEnabled: boolean;
}
