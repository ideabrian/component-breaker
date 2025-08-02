/**
 * 🚀 Shipping Analytics API
 * Ultra-fast Cloudflare Workers API with Hono.js for capturing and analyzing /ship executions
 * 
 * Features:
 * - Real-time event streaming via WebSockets
 * - AI-powered shipping pattern analysis
 * - Global edge deployment for sub-100ms response times
 * - Comprehensive analytics for every aspect of shipping
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Types for Cloudflare Workers environment
export interface Env {
  DB: D1Database;
  ANALYTICS_KV: KVNamespace;
  AI: any;
  ANALYTICS_WEBSOCKET: DurableObjectNamespace;
  ENVIRONMENT: string;
  ALLOWED_ORIGINS: string;
}

// Validation schemas
const ShippingSessionSchema = z.object({
  projectId: z.string(),
  description: z.string(),
  marioVersion: z.string(),
  repositoryUrl: z.string().optional(),
});

const ShippingEventSchema = z.object({
  sessionId: z.string(),
  eventType: z.enum([
    'session_start', 'session_end', 'documentation_start', 'documentation_end',
    'git_status', 'git_add', 'git_commit', 'git_push', 'git_diff',
    'build_start', 'build_end', 'deploy_start', 'deploy_end',
    'analysis_start', 'analysis_end', 'file_read', 'file_write',
    'ai_analysis', 'health_check', 'error_occurred'
  ]),
  timestamp: z.string().optional(),
  duration: z.number().optional(),
  success: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
  filePath: z.string().optional(),
  errorMessage: z.string().optional(),
});

const FileOperationSchema = z.object({
  sessionId: z.string(),
  operationType: z.enum(['read', 'write', 'create', 'delete', 'modify']),
  filePath: z.string(),
  fileSize: z.number().optional(),
  contentHash: z.string().optional(),
  changeType: z.enum(['added', 'modified', 'deleted', 'renamed']).optional(),
  linesChanged: z.number().optional(),
  toolUsed: z.string().optional(),
});

const GitOperationSchema = z.object({
  sessionId: z.string(),
  operationType: z.enum(['status', 'add', 'commit', 'push', 'diff']),
  filesChanged: z.number().optional(),
  linesAdded: z.number().optional(),
  linesRemoved: z.number().optional(),
  commitHash: z.string().optional(),
  commitMessage: z.string().optional(),
  branchName: z.string().default('main'),
  success: z.boolean().default(true),
  errorDetails: z.string().optional(),
});

// Analytics service class
class ShippingAnalyticsService {
  constructor(private env: Env) {}

  // Generate unique IDs
  private generateId(): string {
    return crypto.randomUUID();
  }

  // Get current timestamp
  private now(): string {
    return new Date().toISOString();
  }

  // Create or get project
  async ensureProject(projectId: string, name: string, repositoryUrl?: string) {
    const existing = await this.env.DB.prepare(
      'SELECT * FROM projects WHERE id = ?'
    ).bind(projectId).first();

    if (!existing) {
      await this.env.DB.prepare(`
        INSERT INTO projects (id, name, repository_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(projectId, name, repositoryUrl || null, this.now(), this.now()).run();
    }

    return projectId;
  }

  // Start a new shipping session
  async startShippingSession(data: z.infer<typeof ShippingSessionSchema>) {
    const sessionId = this.generateId();
    const timestamp = this.now();

    // Ensure project exists
    await this.ensureProject(data.projectId, data.projectId, data.repositoryUrl);

    // Create shipping session
    await this.env.DB.prepare(`
      INSERT INTO shipping_sessions (
        id, project_id, session_start, description, status, mario_version
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      data.projectId,
      timestamp,
      data.description,
      'running',
      data.marioVersion
    ).run();

    // Store in KV for real-time access
    await this.env.ANALYTICS_KV.put(
      `session:${sessionId}`,
      JSON.stringify({
        id: sessionId,
        projectId: data.projectId,
        status: 'running',
        startTime: timestamp,
        description: data.description,
      }),
      { expirationTtl: 3600 } // 1 hour TTL
    );

    // Broadcast to WebSocket subscribers
    await this.broadcastSessionUpdate(sessionId, {
      type: 'session_started',
      sessionId,
      projectId: data.projectId,
      description: data.description,
      timestamp,
    });

    return { sessionId };
  }

  // Record shipping event
  async recordEvent(data: z.infer<typeof ShippingEventSchema>) {
    const eventId = this.generateId();
    const timestamp = data.timestamp || this.now();

    await this.env.DB.prepare(`
      INSERT INTO shipping_events (
        id, session_id, event_type, event_timestamp, duration_ms,
        success, error_message, metadata, file_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      eventId,
      data.sessionId,
      data.eventType,
      timestamp,
      data.duration || null,
      data.success,
      data.errorMessage || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      data.filePath || null
    ).run();

    // Update real-time status
    await this.updateRealtimeStatus(data.sessionId, {
      currentStep: data.eventType,
      stepProgress: data.eventType.endsWith('_end') ? 100 : 50,
      statusMessage: this.getEventDescription(data.eventType),
      isError: !data.success,
    });

    return { eventId };
  }

  // Record file operation
  async recordFileOperation(data: z.infer<typeof FileOperationSchema>) {
    const opId = this.generateId();
    const timestamp = this.now();

    await this.env.DB.prepare(`
      INSERT INTO file_operations (
        id, session_id, operation_type, file_path, timestamp,
        file_size_bytes, content_hash, change_type, lines_changed, tool_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      opId,
      data.sessionId,
      data.operationType,
      data.filePath,
      timestamp,
      data.fileSize || null,
      data.contentHash || null,
      data.changeType || null,
      data.linesChanged || null,
      data.toolUsed || null
    ).run();

    return { operationId: opId };
  }

  // Record git operation
  async recordGitOperation(data: z.infer<typeof GitOperationSchema>) {
    const opId = this.generateId();
    const timestamp = this.now();

    await this.env.DB.prepare(`
      INSERT INTO git_operations (
        id, session_id, operation_type, timestamp, files_changed,
        lines_added, lines_removed, commit_hash, commit_message,
        branch_name, success, error_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      opId,
      data.sessionId,
      data.operationType,
      timestamp,
      data.filesChanged || null,
      data.linesAdded || null,
      data.linesRemoved || null,
      data.commitHash || null,
      data.commitMessage || null,
      data.branchName,
      data.success,
      data.errorDetails || null
    ).run();

    return { operationId: opId };
  }

  // Complete shipping session
  async completeSession(sessionId: string, status: 'completed' | 'failed' | 'partial', metadata?: any) {
    const timestamp = this.now();

    // Get session start time to calculate duration
    const session = await this.env.DB.prepare(
      'SELECT session_start FROM shipping_sessions WHERE id = ?'
    ).bind(sessionId).first();

    let duration = null;
    if (session) {
      const startTime = new Date(session.session_start as string).getTime();
      const endTime = new Date(timestamp).getTime();
      duration = endTime - startTime;
    }

    // Update session
    await this.env.DB.prepare(`
      UPDATE shipping_sessions 
      SET session_end = ?, status = ?, total_duration_ms = ?
      WHERE id = ?
    `).bind(timestamp, status, duration, sessionId).run();

    // Remove from KV (session complete)
    await this.env.ANALYTICS_KV.delete(`session:${sessionId}`);

    // Final WebSocket broadcast
    await this.broadcastSessionUpdate(sessionId, {
      type: 'session_completed',
      sessionId,
      status,
      duration,
      timestamp,
    });

    return { duration, status };
  }

  // Get session analytics
  async getSessionAnalytics(sessionId: string) {
    const [session, events, gitOps, fileOps] = await Promise.all([
      this.env.DB.prepare('SELECT * FROM shipping_sessions WHERE id = ?').bind(sessionId).first(),
      this.env.DB.prepare('SELECT * FROM shipping_events WHERE session_id = ? ORDER BY event_timestamp').bind(sessionId).all(),
      this.env.DB.prepare('SELECT * FROM git_operations WHERE session_id = ? ORDER BY timestamp').bind(sessionId).all(),
      this.env.DB.prepare('SELECT * FROM file_operations WHERE session_id = ? ORDER BY timestamp').bind(sessionId).all(),
    ]);

    return {
      session,
      events: events.results,
      gitOperations: gitOps.results,
      fileOperations: fileOps.results,
    };
  }

  // Get project dashboard data
  async getProjectDashboard(projectId: string, limit = 20) {
    const [project, recentSessions, metrics] = await Promise.all([
      this.env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first(),
      this.env.DB.prepare(`
        SELECT * FROM shipping_sessions 
        WHERE project_id = ? 
        ORDER BY session_start DESC 
        LIMIT ?
      `).bind(projectId, limit).all(),
      this.getProjectMetrics(projectId),
    ]);

    return {
      project,
      recentSessions: recentSessions.results,
      metrics,
    };
  }

  // Get aggregated project metrics
  async getProjectMetrics(projectId: string) {
    const [totalShips, avgDuration, successRate, recentTrends] = await Promise.all([
      this.env.DB.prepare(`
        SELECT COUNT(*) as total_ships,
               AVG(total_duration_ms) as avg_duration,
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_ships
        FROM shipping_sessions 
        WHERE project_id = ?
      `).bind(projectId).first(),
      
      this.env.DB.prepare(`
        SELECT AVG(total_duration_ms) as avg_duration
        FROM shipping_sessions 
        WHERE project_id = ? AND total_duration_ms IS NOT NULL
      `).bind(projectId).first(),
      
      this.env.DB.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful
        FROM shipping_sessions 
        WHERE project_id = ? AND session_start > datetime('now', '-7 days')
      `).bind(projectId).first(),
      
      this.env.DB.prepare(`
        SELECT date(session_start) as ship_date, COUNT(*) as ships_count
        FROM shipping_sessions 
        WHERE project_id = ? AND session_start > datetime('now', '-30 days')
        GROUP BY date(session_start)
        ORDER BY ship_date DESC
      `).bind(projectId).all(),
    ]);

    return {
      totalShips: totalShips?.total_ships || 0,
      avgDuration: avgDuration?.avg_duration || 0,
      successRate: totalShips ? (totalShips.successful_ships / totalShips.total_ships) * 100 : 100,
      recentTrends: recentTrends.results,
    };
  }

  // AI-powered insights
  async generateInsights(sessionId: string) {
    const analytics = await this.getSessionAnalytics(sessionId);
    
    const prompt = `Analyze this shipping session and provide insights:
    
Session: ${JSON.stringify(analytics.session)}
Events: ${JSON.stringify(analytics.events)}
Git Operations: ${JSON.stringify(analytics.gitOperations)}
File Operations: ${JSON.stringify(analytics.fileOperations)}

Provide insights on:
1. Performance bottlenecks
2. Optimization opportunities  
3. Risk factors
4. Shipping velocity trends
5. Actionable recommendations

Return JSON with: insights, recommendations, riskLevel, confidenceScore`;

    try {
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: prompt }],
      });

      const insightId = this.generateId();
      await this.env.DB.prepare(`
        INSERT INTO ai_insights (
          id, session_id, insight_type, timestamp, ai_model,
          analysis_result, confidence_score, priority_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        insightId,
        sessionId,
        'session_analysis',
        this.now(),
        '@cf/meta/llama-3.1-8b-instruct',
        JSON.stringify(response),
        0.85,
        75
      ).run();

      return response;
    } catch (error) {
      console.error('AI analysis failed:', error);
      return { error: 'AI analysis unavailable' };
    }
  }

  // Helper methods
  private getEventDescription(eventType: string): string {
    const descriptions: Record<string, string> = {
      'session_start': 'Starting shipping session',
      'documentation_start': 'Documenting completed work',
      'documentation_end': 'Documentation complete',
      'git_status': 'Checking git status',
      'git_add': 'Staging changes',
      'git_commit': 'Committing changes',
      'git_push': 'Pushing to remote',
      'build_start': 'Building project',
      'build_end': 'Build complete',
      'deploy_start': 'Deploying to production',
      'deploy_end': 'Deployment complete',
      'analysis_start': 'Analyzing project state',
      'analysis_end': 'Analysis complete',
      'session_end': 'Shipping complete',
    };
    return descriptions[eventType] || eventType;
  }

  private async updateRealtimeStatus(sessionId: string, update: any) {
    const statusId = this.generateId();
    await this.env.DB.prepare(`
      INSERT OR REPLACE INTO realtime_status (
        id, session_id, current_step, step_progress, status_message, is_error, last_update
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      statusId,
      sessionId,
      update.currentStep,
      update.stepProgress || 0,
      update.statusMessage || '',
      update.isError || false,
      this.now()
    ).run();

    // Also store in KV for faster access
    await this.env.ANALYTICS_KV.put(
      `status:${sessionId}`,
      JSON.stringify(update),
      { expirationTtl: 3600 }
    );
  }

  private async broadcastSessionUpdate(sessionId: string, message: any) {
    // Get WebSocket Durable Object and broadcast
    const id = this.env.ANALYTICS_WEBSOCKET.idFromName(sessionId);
    const wsObject = this.env.ANALYTICS_WEBSOCKET.get(id);
    
    try {
      await wsObject.fetch(new Request('https://internal/broadcast', {
        method: 'POST',
        body: JSON.stringify(message),
      }));
    } catch (error) {
      console.error('WebSocket broadcast failed:', error);
    }
  }
}

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = c.env.ALLOWED_ORIGINS.split(',');
    return allowedOrigins.includes(origin) || origin === undefined;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT 
  });
});

// Start shipping session
app.post('/api/sessions', zValidator('json', ShippingSessionSchema), async (c) => {
  const data = c.req.valid('json');
  const analytics = new ShippingAnalyticsService(c.env);
  
  try {
    const result = await analytics.startShippingSession(data);
    return c.json(result, 201);
  } catch (error) {
    console.error('Failed to start session:', error);
    return c.json({ error: 'Failed to start session' }, 500);
  }
});

// Record shipping event
app.post('/api/events', zValidator('json', ShippingEventSchema), async (c) => {
  const data = c.req.valid('json');
  const analytics = new ShippingAnalyticsService(c.env);
  
  try {
    const result = await analytics.recordEvent(data);
    return c.json(result, 201);
  } catch (error) {
    console.error('Failed to record event:', error);
    return c.json({ error: 'Failed to record event' }, 500);
  }
});

// Record file operation
app.post('/api/file-operations', zValidator('json', FileOperationSchema), async (c) => {
  const data = c.req.valid('json');
  const analytics = new ShippingAnalyticsService(c.env);
  
  try {
    const result = await analytics.recordFileOperation(data);
    return c.json(result, 201);
  } catch (error) {
    console.error('Failed to record file operation:', error);
    return c.json({ error: 'Failed to record file operation' }, 500);
  }
});

// Record git operation
app.post('/api/git-operations', zValidator('json', GitOperationSchema), async (c) => {
  const data = c.req.valid('json');
  const analytics = new ShippingAnalyticsService(c.env);
  
  try {
    const result = await analytics.recordGitOperation(data);
    return c.json(result, 201);
  } catch (error) {
    console.error('Failed to record git operation:', error);
    return c.json({ error: 'Failed to record git operation' }, 500);
  }
});

// Complete session
app.put('/api/sessions/:sessionId/complete', async (c) => {
  const sessionId = c.req.param('sessionId');
  const { status, metadata } = await c.req.json();
  const analytics = new ShippingAnalyticsService(c.env);
  
  try {
    const result = await analytics.completeSession(sessionId, status, metadata);
    return c.json(result);
  } catch (error) {
    console.error('Failed to complete session:', error);
    return c.json({ error: 'Failed to complete session' }, 500);
  }
});

// Get session analytics
app.get('/api/sessions/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  const analytics = new ShippingAnalyticsService(c.env);
  
  try {
    const result = await analytics.getSessionAnalytics(sessionId);
    return c.json(result);
  } catch (error) {
    console.error('Failed to get session analytics:', error);
    return c.json({ error: 'Failed to get session analytics' }, 500);
  }
});

// Get project dashboard
app.get('/api/projects/:projectId/dashboard', async (c) => {
  const projectId = c.req.param('projectId');
  const limit = parseInt(c.req.query('limit') || '20');
  const analytics = new ShippingAnalyticsService(c.env);
  
  try {
    const result = await analytics.getProjectDashboard(projectId, limit);
    return c.json(result);
  } catch (error) {
    console.error('Failed to get project dashboard:', error);
    return c.json({ error: 'Failed to get project dashboard' }, 500);
  }
});

// Generate AI insights
app.post('/api/sessions/:sessionId/insights', async (c) => {
  const sessionId = c.req.param('sessionId');
  const analytics = new ShippingAnalyticsService(c.env);
  
  try {
    const insights = await analytics.generateInsights(sessionId);
    return c.json(insights);
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return c.json({ error: 'Failed to generate insights' }, 500);
  }
});

// WebSocket endpoint
app.get('/api/ws/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  const upgradeHeader = c.req.header('Upgrade');
  
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }

  const id = c.env.ANALYTICS_WEBSOCKET.idFromName(sessionId);
  const wsObject = c.env.ANALYTICS_WEBSOCKET.get(id);
  
  return wsObject.fetch(c.req.raw);
});

export default app;

// WebSocket Durable Object for real-time updates
export class AnalyticsWebSocketDurableObject {
  private sessions: Set<WebSocket> = new Set();
  
  constructor(private state: DurableObjectState, private env: Env) {}
  
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const message = await request.json();
      this.broadcast(message);
      return new Response('OK');
    }
    
    // WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }
    
    const [client, server] = Object.values(new WebSocketPair());
    
    server.accept();
    this.sessions.add(server);
    
    server.addEventListener('close', () => {
      this.sessions.delete(server);
    });
    
    server.addEventListener('error', () => {
      this.sessions.delete(server);
    });
    
    return new Response(null, { status: 101, webSocket: client });
  }
  
  private broadcast(message: any) {
    const data = JSON.stringify(message);
    for (const session of this.sessions) {
      try {
        session.send(data);
      } catch (error) {
        this.sessions.delete(session);
      }
    }
  }
}