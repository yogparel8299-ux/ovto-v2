export interface AIWorker {
  id: string;
  name: string;
  role: 'Finance' | 'Operations' | 'Support' | 'Research' | 'Marketing' | 'Legal';
  status: 'idle' | 'running' | 'completed' | 'paused';
  avatarColor: string;
  connectedApps: string[];
  tasksCount: number;
}

export interface TaskLog {
  timestamp: string;
  workerName: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'system';
}

export interface MockFile {
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

export interface IntegrationApp {
  id: string;
  name: string;
  connected: boolean;
  category: string;
}
