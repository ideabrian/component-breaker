/**
 * 🔗 Analytics API Service
 * Client for connecting to Cloudflare Workers analytics backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shipping-analytics-api.workers.dev';

class AnalyticsAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // Dashboard overview
  async getDashboardOverview() {
    // Mock data for development - replace with real API calls
    return {
      todayStats: {
        totalShips: 24,
        changeFromYesterday: 12,
        avgDuration: 45000,
        durationChange: -8,
        successRate: 95.8,
        successRateChange: 2.1,
        activeProjects: 8,
        projectsChange: 1
      },
      velocityTrend: [
        { date: '2025-01-28', ships: 18 },
        { date: '2025-01-29', ships: 22 },
        { date: '2025-01-30', ships: 19 },
        { date: '2025-01-31', ships: 25 },
        { date: '2025-02-01', ships: 21 },
        { date: '2025-02-02', ships: 24 },
      ],
      durationDistribution: [
        { range: '0-30s', count: 8 },
        { range: '30-60s', count: 12 },
        { range: '60-120s', count: 6 },
        { range: '120s+', count: 3 },
      ],
      statusDistribution: [
        { status: 'completed', count: 23 },
        { status: 'partial', count: 2 },
        { status: 'failed', count: 1 },
      ],
      gitStats: [
        { operation: 'commit', count: 24, avgDuration: 850 },
        { operation: 'push', count: 22, avgDuration: 1200 },
        { operation: 'add', count: 24, avgDuration: 150 },
      ],
      recentSessions: [
        {
          id: '1',
          description: 'Add shipping analytics platform',
          session_start: new Date(Date.now() - 300000).toISOString(),
          status: 'completed',
          total_duration_ms: 47000
        },
        {
          id: '2',
          description: 'Fix mobile responsiveness',
          session_start: new Date(Date.now() - 600000).toISOString(),
          status: 'completed',
          total_duration_ms: 32000
        },
        {
          id: '3',
          description: 'Update component breakdown logic',
          session_start: new Date(Date.now() - 900000).toISOString(),
          status: 'partial',
          total_duration_ms: 65000
        },
      ]
    };
  }

  // Live sessions
  async getLiveSessions() {
    // Mock data - replace with real API
    return [
      {
        id: 'session-1',
        projectId: 'component-breaker',
        description: 'Deploy analytics platform',
        status: 'running',
        startTime: new Date(Date.now() - 120000).toISOString(),
        currentStep: 'deploy_start',
        progress: 75,
        events: []
      },
      {
        id: 'session-2',
        projectId: 'component-breaker',
        description: 'Fix UI components',
        status: 'completed',
        startTime: new Date(Date.now() - 300000).toISOString(),
        events: []
      }
    ];
  }

  // Session details
  async getSessionDetails(sessionId: string) {
    // Mock data - replace with real API
    return {
      session: {
        id: sessionId,
        project_id: 'component-breaker',
        description: 'Deploy analytics platform',
        status: 'running',
        session_start: new Date(Date.now() - 120000).toISOString(),
        session_end: null,
        total_duration_ms: null
      },
      events: [
        {
          id: 'event-1',
          event_type: 'session_start',
          event_timestamp: new Date(Date.now() - 120000).toISOString(),
          duration_ms: null,
          success: true,
          error_message: null,
          metadata: null,
          file_path: null
        },
        {
          id: 'event-2',
          event_type: 'documentation_start',
          event_timestamp: new Date(Date.now() - 115000).toISOString(),
          duration_ms: 2500,
          success: true,
          error_message: null,
          metadata: '{"files_updated": 1}',
          file_path: null
        },
        {
          id: 'event-3',
          event_type: 'git_status',
          event_timestamp: new Date(Date.now() - 110000).toISOString(),
          duration_ms: 450,
          success: true,
          error_message: null,
          metadata: '{"files_changed": 8}',
          file_path: null
        },
        {
          id: 'event-4',
          event_type: 'git_commit',
          event_timestamp: new Date(Date.now() - 105000).toISOString(),
          duration_ms: 1200,
          success: true,
          error_message: null,
          metadata: '{"commit_hash": "abc123"}',
          file_path: null
        }
      ],
      gitOperations: [
        {
          id: 'git-1',
          operation_type: 'status',
          timestamp: new Date(Date.now() - 110000).toISOString(),
          files_changed: 8,
          lines_added: 245,
          lines_removed: 12,
          commit_hash: null,
          commit_message: null,
          success: true
        },
        {
          id: 'git-2',
          operation_type: 'commit',
          timestamp: new Date(Date.now() - 105000).toISOString(),
          files_changed: 8,
          lines_added: 245,
          lines_removed: 12,
          commit_hash: 'abc123def456',
          commit_message: '🍄 Ship: Deploy analytics platform',
          success: true
        }
      ],
      fileOperations: [
        {
          id: 'file-1',
          operation_type: 'write',
          file_path: '/analytics-worker/src/index.ts',
          timestamp: new Date(Date.now() - 115000).toISOString(),
          file_size_bytes: 15420,
          tool_used: 'Write'
        },
        {
          id: 'file-2',
          operation_type: 'write',
          file_path: '/analytics-dashboard/src/App.tsx',
          timestamp: new Date(Date.now() - 112000).toISOString(),
          file_size_bytes: 3240,
          tool_used: 'Write'
        }
      ]
    };
  }

  // Project analytics
  async getProjectAnalytics(projectId: string) {
    const response = await fetch(`${this.baseUrl}/api/projects/${projectId}/dashboard`);
    return response.json();
  }

  // Start session
  async startSession(data: {
    projectId: string;
    description: string;
    marioVersion: string;
    repositoryUrl?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Record event
  async recordEvent(data: {
    sessionId: string;
    eventType: string;
    timestamp?: string;
    duration?: number;
    success?: boolean;
    metadata?: Record<string, any>;
    filePath?: string;
    errorMessage?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Complete session
  async completeSession(sessionId: string, status: string, metadata?: any) {
    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, metadata })
    });
    return response.json();
  }

  // Generate insights
  async generateInsights(sessionId: string) {
    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  // WebSocket connection
  createWebSocket(sessionId: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${this.baseUrl.replace(/^https?:\/\//, '')}/api/ws/${sessionId}`;
    return new WebSocket(wsUrl);
  }
}

export const analyticsApi = new AnalyticsAPI();