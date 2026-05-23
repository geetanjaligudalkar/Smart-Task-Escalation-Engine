/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { Task, EscalationNotification, EscalationRule, UserRole } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database Store
let tasks: Task[] = [
  {
    id: 'task-1',
    name: 'Database Schema Migration for Client Portal',
    description: 'Deploy the updated PostgreSQL relational schema to standard staging and run standard migration scripts for Powerweave client profiles.',
    assigneeName: 'Geetanjali Gudalkar',
    assigneeEmail: 'geetanjali.gudalkar.powerweave@gmail.com',
    managerName: 'Marcus Vance',
    managerEmail: 'marcus.vance@powerweave.com',
    dueDate: '2026-05-20', // Overdue
    createdDate: '2026-05-10',
    priority: 'High',
    status: 'In Progress',
    blockersReason: 'Staging database connections are timing out, and Cloud SQL network peers have missing routing entries. Blocked from proceeding.'
  },
  {
    id: 'task-2',
    name: 'Security Audit Compliance Mapping',
    description: 'Write detailed SOC 2 compliance checklist and evidence mappings for the Powerweave platform access control security policies.',
    assigneeName: 'Liam Jenkins',
    assigneeEmail: 'liam.j@powerweave.com',
    managerName: 'Marcus Vance',
    managerEmail: 'marcus.vance@powerweave.com',
    dueDate: '2026-05-21', // Overdue
    createdDate: '2026-05-12',
    priority: 'Medium',
    status: 'Pending',
    blockersReason: 'Awaiting vendor audit templates. Critical bottleneck on legal sign-offs.'
  },
  {
    id: 'task-3',
    name: 'Update Pricing API Endpoint',
    description: 'Refactor the stripe billing integration hook to parse standard tiered discount factors.',
    assigneeName: 'Chloe Zhao',
    assigneeEmail: 'chloe.z@powerweave.com',
    managerName: 'Sarah Conners',
    managerEmail: 'sarah.conners@powerweave.com',
    dueDate: '2026-05-26', // Future
    createdDate: '2026-05-15',
    priority: 'Low',
    status: 'In Progress'
  },
  {
    id: 'task-4',
    name: 'Front-end Performance Optimization',
    description: 'Improve Lighthouse performance scores of the Powerweave Admin Panel by implementing lazy-loading, code splits, and WebP compression.',
    assigneeName: 'Geetanjali Gudalkar',
    assigneeEmail: 'geetanjali.gudalkar.powerweave@gmail.com',
    managerName: 'Marcus Vance',
    managerEmail: 'marcus.vance@powerweave.com',
    dueDate: '2026-05-22', // Overdue
    createdDate: '2026-05-14',
    priority: 'High',
    status: 'In Progress',
    blockersReason: 'Asset pipeline configuration rejects modern formats in production bundles.'
  },
  {
    id: 'task-5',
    name: 'Revamp Email Notification Pipeline',
    description: 'Integrate the standard SMTP cluster with retry policies and exponential backoffs for transaction receipts.',
    assigneeName: 'Marcus Vance',
    assigneeEmail: 'marcus.vance@powerweave.com',
    managerName: 'Sarah Conners',
    managerEmail: 'sarah.conners@powerweave.com',
    dueDate: '2026-05-24', // Future but active
    createdDate: '2026-05-18',
    priority: 'Medium',
    status: 'In Progress'
  }
];

let notifications: EscalationNotification[] = [
  {
    id: 'notif-1',
    taskId: 'task-1',
    taskName: 'Database Schema Migration for Client Portal',
    managerEmail: 'marcus.vance@powerweave.com',
    message: 'Task is 3 days overdue with connected blocker related to Cloud SQL cloud routing bottlenecks.',
    timestamp: '2026-05-23T09:00:00Z',
    isRead: false,
    type: 'Escalation'
  }
];

let escalationRules: EscalationRule[] = [
  {
    id: 'rule-1',
    name: 'Standard Overdue Trigger',
    description: 'Escalate any Task automatically after standard deadline expiry if status is Pending or In Progress.',
    hoursOverdueThreshold: 24,
    aiModelToUse: 'gemini-3.5-flash',
    escalationPathDefault: 'L2 Operations Support Manager',
    isEnabled: true
  },
  {
    id: 'rule-2',
    name: 'High/Critical Blocker Escalation',
    description: 'Bypass standard delay and immediately escalate if an assignee reports a High priority blocker.',
    hoursOverdueThreshold: 0,
    aiModelToUse: 'gemini-3.5-flash',
    escalationPathDefault: 'L3 Engineering Vice President',
    isEnabled: true
  }
];

// Lazy-initialize Gemini SDK securely
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY' && key.trim() !== '') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log('Gemini AI Client initialized successfully.');
    } else {
      console.warn('GEMINI_API_KEY environment variable is not defined or is placeholder. Falling back to rule-based escalation generation.');
    }
  }
  return aiClient;
}

// REST API Endpoints

// 1. Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// 2. Create a new task
app.post('/api/tasks', (req, res) => {
  const { name, description, assigneeName, assigneeEmail, managerName, managerEmail, dueDate, priority } = req.body;
  if (!name || !assigneeEmail || !dueDate) {
    return res.status(400).json({ error: 'Missing required parameters: name, assigneeEmail, and dueDate are required.' });
  }

  const newTask: Task = {
    id: `task-${Date.now()}`,
    name,
    description: description || '',
    assigneeName: assigneeName || assigneeEmail.split('@')[0],
    assigneeEmail,
    managerName: managerName || 'Sarah Conners',
    managerEmail: managerEmail || 'sarah.conners@powerweave.com',
    dueDate,
    createdDate: new Date().toISOString().split('T')[0],
    priority: priority || 'Medium',
    status: 'Pending'
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 3. Update task status, progress updates, or blockers
app.post('/api/tasks/:id/update', (req, res) => {
  const { id } = req.params;
  const { status, blockersReason, description, priority, dueDate } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = tasks[taskIndex];
  if (status) task.status = status;
  if (blockersReason !== undefined) task.blockersReason = blockersReason;
  if (description) task.description = description;
  if (priority) task.priority = priority;
  if (dueDate) task.dueDate = dueDate;

  // If status is resolved, remove escalation report if it existed
  if (status === 'Resolved') {
    // Add notification that task is resolved
    const resolutionNotification: EscalationNotification = {
      id: `notif-${Date.now()}`,
      taskId: task.id,
      taskName: task.name,
      managerEmail: task.managerEmail,
      message: `Task has been marked as RESOLVED by ${task.assigneeName}.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'Resolution'
    };
    notifications.unshift(resolutionNotification);
  }

  res.json(task);
});

// 4. Manual trigger simple task escalation
app.post('/api/tasks/:id/escalate', async (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = tasks[taskIndex];
  try {
    const report = await runAiEscalation(task);
    task.status = 'Escalated';
    task.escalationReport = report;

    // Create manager notification
    const newNotif: EscalationNotification = {
      id: `notif-${Date.now()}`,
      taskId: task.id,
      taskName: task.name,
      managerEmail: task.managerEmail,
      message: report.draftedNotification,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'Escalation'
    };

    notifications.unshift(newNotif);
    res.json({ task, notification: newNotif });
  } catch (err: any) {
    console.error('Error escalating task:', err);
    res.status(500).json({ error: 'Failed to run escalation engine', details: err.message });
  }
});

// 5. Run Global Scanning Engine (checks overdue and escalates)
app.post('/api/escalate-scan', async (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0]; // "yyyy-mm-dd"
  
  // Find standard overdue rules threshold (hours converted to days roughly)
  // To evaluate overdue status we check if item is overdue by comparing due date to today
  const overdueTasks = tasks.filter(t => {
    return t.dueDate < todayStr && t.status !== 'Resolved' && t.status !== 'Escalated';
  });

  if (overdueTasks.length === 0) {
    return res.json({ message: 'Global scan executed: No new overdue tasks detected.', escalatedCount: 0 });
  }

  const results: any[] = [];
  for (const task of overdueTasks) {
    try {
      const report = await runAiEscalation(task);
      task.status = 'Escalated';
      task.escalationReport = report;

      const newNotif: EscalationNotification = {
        id: `notif-${Date.now()}-${task.id}`,
        taskId: task.id,
        taskName: task.name,
        managerEmail: task.managerEmail,
        message: report.draftedNotification,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'Escalation'
      };

      notifications.unshift(newNotif);
      results.push({ id: task.id, name: task.name, priority: report.escalationPriority });
    } catch (err) {
      console.error(`Failed to scan-escalate task ${task.id}:`, err);
    }
  }

  res.json({
    message: `Scan complete: Evaluated and successfully escalated ${results.length} task(s).`,
    escalatedCount: results.length,
    escalatedTasks: results
  });
});

// 6. Get all manager notifications
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// 7. Read standard notification
app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    return res.json(notif);
  }
  res.status(404).json({ error: 'Notification not found' });
});

// 8. Delete / Clear notifications
app.post('/api/notifications/clear', (req, res) => {
  notifications = [];
  res.json({ success: true, notifications });
});

// 9. Get rules list
app.get('/api/rules', (req, res) => {
  res.json(escalationRules);
});

// 10. Update rule toggle configuration
app.post('/api/rules/:id', (req, res) => {
  const { id } = req.params;
  const { isEnabled, hoursOverdueThreshold, escalationPathDefault } = req.body;
  const rule = escalationRules.find(r => r.id === id);
  if (rule) {
    if (isEnabled !== undefined) rule.isEnabled = isEnabled;
    if (hoursOverdueThreshold !== undefined) rule.hoursOverdueThreshold = hoursOverdueThreshold;
    if (escalationPathDefault !== undefined) rule.escalationPathDefault = escalationPathDefault;
    return res.json(rule);
  }
  res.status(404).json({ error: 'Rule config not found' });
});

// Helper function to interact with Gemini or use highly refined default fallbacks
async function runAiEscalation(task: Task) {
  const ai = getAi();
  const escalationPath = task.priority === 'High' ? 'L3 Engineering Vice President' : 'L2 Functional Manager Support';
  
  if (ai) {
    try {
      const prompt = `
        You are Powerweave's Enterprise Task Escalation Intelligence.
        Analyze this overdue task and generate a structured JSON escalation report:
        
        Task Name: "${task.name}"
        Task Description: "${task.description}"
        Assignee: "${task.assigneeName}" (${task.assigneeEmail})
        Manager Assigned: "${task.managerName}" (${task.managerEmail})
        Task Deadline: "${task.dueDate}" (Current Date is 2026-05-23 - Task is overdue)
        Normal Priority: "${task.priority}"
        Current Progress Status: "${task.status}"
        Reported Blockers: "${task.blockersReason || 'No blockers reported explicitly. Task might be neglected.'}"

        Provide custom smart routing suggestions.
        Generate standard formal escalation priorities ('High', 'Critical', 'Blocker') based on task constraints.
        Draft an active notification alert that will be delivered directly to the manager.
        Suggest realistic remediation checklists to help them unblock this specific item.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              escalationPriority: {
                type: Type.STRING,
                description: "The escalation tier: must be 'High', 'Critical' or 'Blocker'."
              },
              escalationPath: {
                type: Type.STRING,
                description: "Name of group to escalate to: e.g. 'L2 Functional Operations Manager', 'L3 VP of Engineering', or 'L4 Executive Sponsor'."
              },
              rootCauseAnalysis: {
                type: Type.STRING,
                description: "A compact detailed statement describing why the task is blocked or overdue."
              },
              draftedNotification: {
                type: Type.STRING,
                description: "An email/Slack notification copy drafted to the manager warning them of the impact and stating immediate routing context."
              },
              suggestedRemediation: {
                type: Type.STRING,
                description: "A bulleted breakdown checklist of technical troubleshooting or resource-allocation steps to solve this roadblock."
              }
            },
            required: ['escalationPriority', 'escalationPath', 'rootCauseAnalysis', 'draftedNotification', 'suggestedRemediation']
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          escalatedAt: new Date().toISOString(),
          escalationPriority: parsed.escalationPriority || 'Critical',
          escalationPath: parsed.escalationPath || escalationPath,
          rootCauseAnalysis: parsed.rootCauseAnalysis || 'Delayed pipeline completion matching standard deadline criteria.',
          draftedNotification: parsed.draftedNotification || `Alert: Task "${task.name}" has escalated. Immediate attention required.`,
          suggestedRemediation: parsed.suggestedRemediation || '- Assign backup engineer\n- Overhaul connection configurations\n- Push next deadline extension'
        };
      }
    } catch (err) {
      console.error('Gemini call failed, defaulting to intelligent rule fallback', err);
    }
  }

  // Smart fallback when Gemini is unavailable or fails
  const daysOverdue = Math.max(1, Math.floor((new Date('2026-05-23').getTime() - new Date(task.dueDate).getTime()) / (1000 * 3600 * 24)));
  const computedPriority = task.priority === 'High' ? 'Critical' : 'High';
  
  return {
    escalatedAt: new Date().toISOString(),
    escalationPriority: computedPriority as 'High' | 'Critical' | 'Blocker',
    escalationPath: escalationPath,
    rootCauseAnalysis: task.blockersReason 
      ? `System identified blocker: "${task.blockersReason}". Resolved staging connection states required.`
      : `Task is ${daysOverdue} day(s) overdue from standard milestone target are overdue. No blocker provided, suspect workload allocation issues.`,
    draftedNotification: `[Escalation Alert] Attention ${task.managerName},\n\nThe task "${task.name}" assigned to ${task.assigneeName} is ${daysOverdue} days overdue and has been escalated automatically to ${escalationPath}.\n\nImpact level: High. Please configure remediation action steps.`,
    suggestedRemediation: task.blockersReason 
      ? `- Schedule quick stand-up with ${task.assigneeName}.\n- Provision backup test environment and debug Cloud SQL routing tables.\n- Review connection pools inside backend staging containers.`
      : `- Conduct immediate check-in regarding capacity limits with ${task.assigneeName}.\n- Re-assign non-critical sprint tickets to clear bandwidth.\n- Set updated incremental milestone timeline targets.`
  };
}

// Vite integration middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Escalation Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
