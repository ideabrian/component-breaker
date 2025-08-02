import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Play, 
  Pause, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  GitCommit,
  Package,
  Rocket,
  Brain
} from 'lucide-react';
import { format } from 'date-fns';
import { analyticsApi } from '../services/api';
import { cn } from '../utils/cn';

interface LiveSession {
  id: string;
  projectId: string;
  description: string;
  status: 'running' | 'completed' | 'failed' | 'partial';
  startTime: string;
  currentStep?: string;
  progress?: number;
  estimatedCompletion?: number;
  events: any[];
}

export function LiveShipping() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: liveSessions, refetch } = useQuery({
    queryKey: ['live-sessions'],
    queryFn: () => analyticsApi.getLiveSessions(),
    refetchInterval: autoRefresh ? 2000 : false, // 2 second refresh when enabled
  });

  const { data: sessionDetails } = useQuery({
    queryKey: ['session-details', selectedSession],
    queryFn: () => selectedSession ? analyticsApi.getSessionDetails(selectedSession) : null,
    enabled: !!selectedSession,
    refetchInterval: autoRefresh ? 1000 : false, // 1 second refresh for selected session
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!selectedSession) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${import.meta.env.VITE_API_BASE_URL}/api/ws/${selectedSession}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WebSocket message:', message);
      // Trigger refetch to update UI
      refetch();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [selectedSession, refetch]);

  const getStepIcon = (eventType: string) => {
    switch (eventType) {
      case 'documentation_start':
      case 'documentation_end':
        return Package;
      case 'git_status':
      case 'git_add':
      case 'git_commit':
      case 'git_push':
        return GitCommit;
      case 'build_start':
      case 'build_end':
        return Package;
      case 'deploy_start':
      case 'deploy_end':
        return Rocket;
      case 'analysis_start':
      case 'analysis_end':
        return Brain;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const duration = Math.round((end - start) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Shipping</h1>
          <p className="text-gray-600">Monitor /ship executions in real-time</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
              autoRefresh 
                ? "bg-green-50 border-green-200 text-green-700" 
                : "bg-gray-50 border-gray-200 text-gray-700"
            )}
          >
            {autoRefresh ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Updates</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Resume Updates</span>
              </>
            )}
          </button>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"
            )} />
            <span className="text-sm text-gray-600">
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
              <p className="text-sm text-gray-500">
                {liveSessions?.length || 0} sessions
              </p>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {liveSessions?.map((session: LiveSession) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-gray-50 transition-colors",
                    selectedSession === session.id && "bg-blue-50 border-r-2 border-blue-500"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                      getStatusColor(session.status)
                    )}>
                      {session.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDuration(session.startTime)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {session.projectId}
                  </p>
                  {session.currentStep && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">
                        {session.currentStep.replace(/_/g, ' ')}
                      </div>
                      {session.progress && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${session.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="lg:col-span-2">
          {selectedSession && sessionDetails ? (
            <div className="space-y-6">
              {/* Session Header */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {sessionDetails.session.description}
                    </h2>
                    <p className="text-gray-600">
                      Project: {sessionDetails.session.project_id}
                    </p>
                  </div>
                  <span className={cn(
                    "inline-flex px-3 py-1 text-sm font-medium rounded-full",
                    getStatusColor(sessionDetails.session.status)
                  )}>
                    {sessionDetails.session.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Started</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(sessionDetails.session.session_start), 'HH:mm:ss')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDuration(
                        sessionDetails.session.session_start,
                        sessionDetails.session.session_end
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Events</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {sessionDetails.events.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Shipping Timeline
                </h3>
                <div className="space-y-4">
                  {sessionDetails.events.map((event: any, index: number) => {
                    const Icon = getStepIcon(event.event_type);
                    const isLast = index === sessionDetails.events.length - 1;
                    
                    return (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 relative">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            event.success 
                              ? "bg-green-100 text-green-600" 
                              : "bg-red-100 text-red-600"
                          )}>
                            {event.success ? (
                              <Icon className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                          </div>
                          {!isLast && (
                            <div className="absolute top-8 left-4 w-px h-6 bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {format(new Date(event.event_timestamp), 'HH:mm:ss')}
                            </span>
                          </div>
                          {event.duration_ms && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {event.duration_ms}ms
                            </p>
                          )}
                          {event.file_path && (
                            <p className="text-xs text-gray-600 mt-1 font-mono">
                              {event.file_path}
                            </p>
                          )}
                          {event.error_message && (
                            <p className="text-xs text-red-600 mt-1">
                              Error: {event.error_message}
                            </p>
                          )}
                          {event.metadata && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-600 cursor-pointer">
                                View details
                              </summary>
                              <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(JSON.parse(event.metadata), null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Git Operations */}
              {sessionDetails.gitOperations?.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Git Operations
                  </h3>
                  <div className="space-y-3">
                    {sessionDetails.gitOperations.map((op: any) => (
                      <div key={op.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <GitCommit className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {op.operation_type}
                            </p>
                            {op.commit_message && (
                              <p className="text-xs text-gray-600 truncate max-w-xs">
                                {op.commit_message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            {op.files_changed || 0} files
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(op.timestamp), 'HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Operations */}
              {sessionDetails.fileOperations?.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    File Operations
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sessionDetails.fileOperations.map((op: any) => (
                      <div key={op.id} className="flex items-center justify-between p-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            op.operation_type === 'read' ? 'bg-blue-500' :
                            op.operation_type === 'write' ? 'bg-green-500' :
                            op.operation_type === 'create' ? 'bg-purple-500' :
                            'bg-red-500'
                          )} />
                          <span className="font-mono text-gray-900 truncate max-w-xs">
                            {op.file_path}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600 capitalize">
                            {op.operation_type}
                          </span>
                          <span className="text-gray-500">
                            {format(new Date(op.timestamp), 'HH:mm:ss')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 shadow-sm border text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Session
              </h3>
              <p className="text-gray-600">
                Choose a live shipping session to view real-time details and progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}