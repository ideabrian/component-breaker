/**
 * 🚀 Shipping Analytics Dashboard
 * Real-time analytics for /ship command execution
 * 
 * Features:
 * - Live shipping session monitoring
 * - Historical analytics and trends
 * - AI-powered insights and recommendations
 * - Performance metrics and optimization suggestions
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigation } from './components/Navigation';
import { DashboardOverview } from './pages/DashboardOverview';
import { LiveShipping } from './pages/LiveShipping';
import { SessionDetails } from './pages/SessionDetails';
import { ProjectAnalytics } from './pages/ProjectAnalytics';
import { AIInsights } from './pages/AIInsights';
import { GlobalPerformance } from './pages/GlobalPerformance';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchInterval: 30000, // Auto-refetch every 30 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/live" element={<LiveShipping />} />
              <Route path="/sessions/:sessionId" element={<SessionDetails />} />
              <Route path="/projects/:projectId" element={<ProjectAnalytics />} />
              <Route path="/insights" element={<AIInsights />} />
              <Route path="/performance" element={<GlobalPerformance />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;