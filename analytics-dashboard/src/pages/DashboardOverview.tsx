import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  GitCommit,
  Rocket,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { analyticsApi } from '../services/api';

export function DashboardOverview() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => analyticsApi.getDashboardOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!overview) {
    return <div>No data available</div>;
  }

  const stats = [
    {
      name: 'Total Ships Today',
      value: overview.todayStats.totalShips,
      change: overview.todayStats.changeFromYesterday,
      icon: Rocket,
      color: 'blue'
    },
    {
      name: 'Avg Ship Time',
      value: `${Math.round(overview.todayStats.avgDuration / 1000)}s`,
      change: overview.todayStats.durationChange,
      icon: Clock,
      color: 'green'
    },
    {
      name: 'Success Rate',
      value: `${Math.round(overview.todayStats.successRate)}%`,
      change: overview.todayStats.successRateChange,
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      name: 'Active Projects',
      value: overview.todayStats.activeProjects,
      change: overview.todayStats.projectsChange,
      icon: Activity,
      color: 'purple'
    }
  ];

  const statusColors = {
    completed: '#10B981',
    failed: '#EF4444',
    partial: '#F59E0B',
    running: '#3B82F6'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipping Analytics</h1>
          <p className="text-gray-600">Real-time insights into your /ship executions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {format(new Date(), 'HH:mm:ss')}
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />
                )}
                <span className={`text-sm ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stat.change)}% from yesterday
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ship Velocity Trend */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ship Velocity Trend</h3>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview.velocityTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                formatter={(value) => [`${value} ships`, 'Ships']}
              />
              <Line 
                type="monotone" 
                dataKey="ships" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ship Duration Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Duration Distribution</h3>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overview.durationDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} ships`, 'Count']} />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ship Status Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ship Status</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={overview.statusDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                nameKey="status"
              >
                {overview.statusDistribution.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={statusColors[entry.status as keyof typeof statusColors]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {overview.statusDistribution.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: statusColors[item.status as keyof typeof statusColors] }}
                  />
                  <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Git Operations */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Git Activity</h3>
            <GitCommit className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-4">
            {overview.gitStats.map((stat: any) => (
              <div key={stat.operation} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{stat.operation}</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{stat.count}</p>
                  <p className="text-xs text-gray-500">
                    {stat.avgDuration}ms avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Ships</h3>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            {overview.recentSessions.map((session: any) => (
              <div key={session.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  session.status === 'completed' ? 'bg-green-500' :
                  session.status === 'failed' ? 'bg-red-500' :
                  session.status === 'partial' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(session.session_start), 'HH:mm')} • 
                    {session.total_duration_ms ? ` ${Math.round(session.total_duration_ms / 1000)}s` : ' In progress'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'failed' ? 'bg-red-100 text-red-800' :
                    session.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Activity className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">View Live Ships</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <Brain className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Generate AI Insights</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <Zap className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Performance Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}