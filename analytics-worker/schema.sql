-- 🚀 Shipping Analytics Database Schema
-- Optimized for Cloudflare D1 and global edge queries

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    repository_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_ships INTEGER DEFAULT 0,
    last_ship_at DATETIME,
    health_score INTEGER DEFAULT 100
);

-- Shipping sessions (each /ship execution)
CREATE TABLE IF NOT EXISTS shipping_sessions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_end DATETIME,
    description TEXT,
    status TEXT DEFAULT 'running', -- running, completed, failed, partial
    mario_version TEXT,
    total_duration_ms INTEGER,
    git_commit_hash TEXT,
    deployment_url TEXT,
    health_score_change INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Individual events during shipping
CREATE TABLE IF NOT EXISTS shipping_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- file_read, file_write, git_status, git_commit, build_start, build_end, deploy_start, deploy_end, analysis_start, analysis_end
    event_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata TEXT, -- JSON string with event-specific data
    file_path TEXT,
    operation_details TEXT,
    FOREIGN KEY (session_id) REFERENCES shipping_sessions(id)
);

-- Git operations tracking
CREATE TABLE IF NOT EXISTS git_operations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    operation_type TEXT NOT NULL, -- status, add, commit, push, diff
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_ms INTEGER,
    files_changed INTEGER DEFAULT 0,
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    commit_hash TEXT,
    commit_message TEXT,
    branch_name TEXT DEFAULT 'main',
    success BOOLEAN DEFAULT true,
    error_details TEXT,
    FOREIGN KEY (session_id) REFERENCES shipping_sessions(id)
);

-- Build and deployment metrics
CREATE TABLE IF NOT EXISTS deployment_metrics (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    deployment_type TEXT NOT NULL, -- frontend, worker, full
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration_ms INTEGER,
    build_size_kb INTEGER,
    bundle_analysis TEXT, -- JSON with bundle details
    deployment_url TEXT,
    cdn_cache_status TEXT,
    edge_locations_count INTEGER,
    success BOOLEAN DEFAULT true,
    error_log TEXT,
    performance_metrics TEXT, -- JSON with performance data
    FOREIGN KEY (session_id) REFERENCES shipping_sessions(id)
);

-- File operations tracking
CREATE TABLE IF NOT EXISTS file_operations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    operation_type TEXT NOT NULL, -- read, write, create, delete, modify
    file_path TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_size_bytes INTEGER,
    content_hash TEXT,
    change_type TEXT, -- added, modified, deleted, renamed
    lines_changed INTEGER,
    operation_duration_ms INTEGER,
    tool_used TEXT, -- Read, Write, Edit, MultiEdit, etc.
    success BOOLEAN DEFAULT true,
    FOREIGN KEY (session_id) REFERENCES shipping_sessions(id)
);

-- AI analysis and insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    insight_type TEXT NOT NULL, -- pattern_analysis, optimization_suggestion, health_assessment, risk_detection
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ai_model TEXT DEFAULT '@cf/meta/llama-3.1-8b-instruct',
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    analysis_result TEXT, -- JSON with AI insights
    confidence_score REAL, -- 0.0 to 1.0
    actionable_items TEXT, -- JSON array of suggestions
    risk_level TEXT DEFAULT 'low', -- low, medium, high, critical
    priority_score INTEGER DEFAULT 50, -- 0-100
    FOREIGN KEY (session_id) REFERENCES shipping_sessions(id)
);

-- Performance metrics and timing
CREATE TABLE IF NOT EXISTS performance_metrics (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- total_duration, git_duration, build_duration, deploy_duration, analysis_duration
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    value_ms INTEGER NOT NULL,
    baseline_ms INTEGER,
    improvement_percent REAL,
    bottleneck_detected BOOLEAN DEFAULT false,
    optimization_suggestions TEXT, -- JSON array
    FOREIGN KEY (session_id) REFERENCES shipping_sessions(id)
);

-- Real-time shipping status for WebSocket updates
CREATE TABLE IF NOT EXISTS realtime_status (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    current_step TEXT NOT NULL,
    step_progress INTEGER DEFAULT 0, -- 0-100
    total_progress INTEGER DEFAULT 0, -- 0-100
    estimated_completion_ms INTEGER,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_message TEXT,
    is_error BOOLEAN DEFAULT false,
    FOREIGN KEY (session_id) REFERENCES shipping_sessions(id)
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_shipping_sessions_project ON shipping_sessions(project_id, session_start DESC);
CREATE INDEX IF NOT EXISTS idx_shipping_events_session ON shipping_events(session_id, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_git_operations_session ON git_operations(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_deployment_metrics_session ON deployment_metrics(session_id, start_time);
CREATE INDEX IF NOT EXISTS idx_file_operations_session ON file_operations(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_insights_session ON ai_insights(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session ON performance_metrics(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_realtime_status_session ON realtime_status(session_id, last_update DESC);

-- Performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_projects_last_ship ON projects(last_ship_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipping_sessions_status ON shipping_sessions(status, session_start DESC);
CREATE INDEX IF NOT EXISTS idx_shipping_events_type ON shipping_events(event_type, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_git_operations_type ON git_operations(operation_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type, confidence_score DESC);