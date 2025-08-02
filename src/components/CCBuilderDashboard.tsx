import { useState } from 'react'

interface Agent {
  id: string
  name: string
  role: string
  status: 'active' | 'idle' | 'working'
  description: string
  lastUsed?: string
}

interface Project {
  name: string
  status: 'active' | 'paused'
  agents: string[]
  hooks: number
  commands: number
}

interface RequestData {
  category: string
  count: number
  color: string
}

interface CCBuilderDashboardProps {
  onBack?: () => void
}

export default function CCBuilderDashboard({ onBack }: CCBuilderDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'projects' | 'analytics' | 'vision' | 'how-to-build'>('overview')

  const agents: Agent[] = [
    { id: 'designer', name: 'UI Designer', role: 'Design', status: 'active', description: 'Reviews UI/UX, suggests improvements, validates accessibility' },
    { id: 'qa', name: 'QA Engineer', role: 'Testing', status: 'idle', description: 'Writes test cases, reviews edge cases, performance testing' },
    { id: 'marketer', name: 'Growth Marketer', role: 'Marketing', status: 'idle', description: 'Copy writing, user research, conversion optimization' },
    { id: 'grant-writer', name: 'Grant Specialist', role: 'Funding', status: 'working', description: 'Government grants, funding research, application writing' },
    { id: 'finance', name: 'Finance Negotiator', role: 'Business', status: 'idle', description: 'Contract negotiations, pricing strategy, financial modeling' },
    { id: 'sales', name: 'Sales Prospector', role: 'Sales', status: 'idle', description: 'Lead generation, cold outreach, pipeline management' }
  ]

  const projects: Project[] = [
    { name: 'ComponentBreaker', status: 'active', agents: ['designer', 'qa'], hooks: 3, commands: 5 },
    { name: 'CC-Builder Dashboard', status: 'active', agents: ['designer'], hooks: 1, commands: 2 },
    { name: 'Client Project Alpha', status: 'paused', agents: [], hooks: 0, commands: 0 }
  ]

  const requestData: RequestData[] = [
    { category: 'UX Enhancement', count: 12, color: 'bg-blue-500' },
    { category: 'PM Tooling', count: 8, color: 'bg-green-500' },
    { category: 'Technical', count: 6, color: 'bg-purple-500' },
    { category: 'Functional', count: 4, color: 'bg-orange-500' }
  ]

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'working': return 'bg-blue-100 text-blue-800'
      case 'idle': return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active': return '🟢'
      case 'working': return '🔵'
      case 'idle': return '⚫'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CC-Builder Dashboard</h1>
            <p className="text-gray-600">Multi-agent development environment for Claude Code</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to ComponentBreaker
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 overflow-x-auto">
        {(['overview', 'agents', 'projects', 'analytics', 'vision', 'how-to-build'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'how-to-build' ? 'How To Build' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{agents.length}</div>
              <div className="text-sm text-gray-600">Available Agents</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{agents.filter(a => a.status === 'working').length}</div>
              <div className="text-sm text-gray-600">Agents Working</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">30</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
          </div>

          {/* Active Agents */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Agent Status</h3>
            <div className="space-y-3">
              {agents.slice(0, 4).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getStatusIcon(agent.status)}</span>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-gray-600">{agent.role}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Request Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Request Categories</h3>
            <div className="space-y-3">
              {requestData.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.category}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{agent.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">{agent.role}</div>
              <p className="text-sm text-gray-700 mb-4">{agent.description}</p>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                  Configure
                </button>
                <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Active Agents</div>
                  <div className="font-medium">{project.agents.length}</div>
                </div>
                <div>
                  <div className="text-gray-600">Hooks</div>
                  <div className="font-medium">{project.hooks}</div>
                </div>
                <div>
                  <div className="text-gray-600">Commands</div>
                  <div className="font-medium">{project.commands}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-6">Request-Vision Alignment Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Category</th>
                  <th className="text-center py-2">Surface</th>
                  <th className="text-center py-2">Functional</th>
                  <th className="text-center py-2">Experience</th>
                  <th className="text-center py-2">Strategic</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {requestData.map((category) => (
                  <tr key={category.category} className="border-b">
                    <td className="py-3">{category.category}</td>
                    <td className="text-center">
                      <div className="w-6 h-6 bg-blue-200 rounded mx-auto flex items-center justify-center text-xs">
                        3
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="w-6 h-6 bg-green-200 rounded mx-auto flex items-center justify-center text-xs">
                        5
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="w-6 h-6 bg-yellow-200 rounded mx-auto flex items-center justify-center text-xs">
                        2
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="w-6 h-6 bg-purple-200 rounded mx-auto flex items-center justify-center text-xs">
                        2
                      </div>
                    </td>
                    <td className="text-right py-3 font-medium">{category.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vision Tab */}
      {activeTab === 'vision' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">The Vision</h2>
              <p className="text-lg text-gray-600">Why CC-Builder Gives You Hope</p>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center">
                  🚀 Multiplied Capability
                </h3>
                <p className="text-gray-700">
                  Instead of "just you coding," you see yourself with a <strong>team of specialists</strong> - 
                  Designer, QA, Marketer, Grant Writer - all working for you, all configurable, all trackable.
                  You're not a solo developer anymore; you're the conductor of an intelligent development orchestra.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center">
                  🧩 Systems Thinking Made Real
                </h3>
                <p className="text-gray-700">
                  You've been thinking about PM tooling patterns across projects, and now you can <strong>see the system</strong> - 
                  requests categorized, progress tracked, agents coordinated. Your meta-thinking has physical form.
                  The abstract becomes concrete.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
                  ⚡ Control Over Complexity
                </h3>
                <p className="text-gray-700">
                  Those 30 requests that used to feel overwhelming? Now they're <strong>organized, visualized, manageable</strong>. 
                  The chaos has structure. You're not drowning in work - you're orchestrating it with precision and clarity.
                </p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-orange-800 mb-3 flex items-center">
                  🎯 Agency and Leverage
                </h3>
                <p className="text-gray-700">
                  This isn't just a tool - it's a <strong>force multiplier</strong>. You see yourself as someone who doesn't 
                  just use Claude Code, but <strong>commands an entire development ecosystem</strong>. That level of leverage is intoxicating.
                </p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                  ✨ Future Self Visualization
                </h3>
                <p className="text-gray-700">
                  You're seeing a version of yourself who has <strong>systematized excellence</strong> - where every project 
                  gets better PM tooling, every workflow is optimized, every request is categorized and learned from.
                  This is who you could become.
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-yellow-800 mb-3 flex items-center">
                  🌟 The Core Promise
                </h3>
                <p className="text-gray-700 text-lg">
                  <strong>You're not just building software anymore.</strong>
                  <br/>
                  You're building <em>systems to build software better</em>.
                  <br/>
                  You're becoming the architect of your own enhanced intelligence.
                </p>
              </div>
            </div>

            <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 italic">
                "It's hope because it shows you who you could become - not just a developer, 
                but the conductor of an intelligent development orchestra. And it feels achievable 
                because you just built the interface for it."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How To Build an Agent Tab */}
      {activeTab === 'how-to-build' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-green-600 mb-4">How To Build an Agent</h2>
              <p className="text-lg text-gray-600">Use Claude Code's built-in capabilities - no expensive external services needed!</p>
            </div>

            <div className="space-y-8">
              
              {/* Cost Reality Check */}
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-red-800 mb-3">💳 The Cost Reality</h3>
                <p className="text-gray-700 mb-3">
                  External agent platforms can run $50-500+/month per agent. Agent.ai's million-dollar domain shows the market, 
                  but you don't need to break the bank to get started.
                </p>
                <p className="text-red-700 font-medium">
                  <strong>Your concern about credit card charges is valid!</strong> Let's build smart, not expensive.
                </p>
              </div>

              {/* Claude Code Native Approach */}
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-800 mb-3">🚀 Claude Code Native Agents</h3>
                <p className="text-gray-700 mb-4">
                  You already have everything you need! Claude Code supports:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Task tool with subagent types</strong> - Specialized agents for different roles</li>
                  <li><strong>Custom prompts</strong> - Define agent behavior and expertise</li>
                  <li><strong>Hooks system</strong> - Trigger agents on specific events</li>
                  <li><strong>Slash commands</strong> - Quick agent invocation</li>
                  <li><strong>Project-specific configs</strong> - Different agents per project</li>
                </ul>
              </div>

              {/* Practical Examples */}
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-3">🛠️ Practical Agent Examples</h3>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border-l-4 border-blue-400">
                    <h4 className="font-semibold text-blue-700">Designer Agent</h4>
                    <code className="text-sm text-gray-600 block mt-1">
                      /design-review → Task tool with "You are a senior UI/UX designer with 10 years experience. Review this interface for accessibility, visual hierarchy, and user experience. Provide specific, actionable feedback."
                    </code>
                  </div>

                  <div className="bg-white p-4 rounded border-l-4 border-green-400">
                    <h4 className="font-semibold text-green-700">QA Agent</h4>
                    <code className="text-sm text-gray-600 block mt-1">
                      /qa-review → Task tool with "You are a senior QA engineer. Examine this code for edge cases, potential bugs, security issues, and testing gaps. Write test cases for critical paths."
                    </code>
                  </div>

                  <div className="bg-white p-4 rounded border-l-4 border-purple-400">
                    <h4 className="font-semibold text-purple-700">Marketer Agent</h4>
                    <code className="text-sm text-gray-600 block mt-1">
                      /marketing-copy → Task tool with "You are a growth marketer specializing in developer tools. Write compelling copy for this feature that highlights benefits, reduces friction, and drives adoption."
                    </code>
                  </div>
                </div>
              </div>

              {/* Implementation Steps */}
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-800 mb-3">📋 Implementation Steps</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li><strong>Define Agent Prompts</strong> - Write detailed system prompts for each specialist</li>
                  <li><strong>Create Slash Commands</strong> - Set up quick access via Claude Code settings</li>
                  <li><strong>Configure Hooks</strong> - Auto-trigger agents on git commits, deployments, etc.</li>
                  <li><strong>Test & Iterate</strong> - Start with one agent, refine the prompt, expand</li>
                  <li><strong>Document Workflows</strong> - Create your agent playbook</li>
                </ol>
              </div>

              {/* Cost Control */}
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-3">💰 Cost Control Strategy</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Smart Usage</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Start with manual agent calls</li>
                      <li>• Monitor your Claude usage</li>
                      <li>• Use hooks sparingly at first</li>
                      <li>• Focus on high-value tasks</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Gradual Scaling</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• One agent at a time</li>
                      <li>• Measure ROI before expanding</li>
                      <li>• Auto-trigger only proven agents</li>
                      <li>• Build monetization first</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-3">🎯 Your Next Steps</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>1. Start Small:</strong> Pick one agent (Designer?) and write a detailed prompt</p>
                  <p><strong>2. Create Slash Command:</strong> Add it to your Claude Code settings</p>
                  <p><strong>3. Test on ComponentBreaker:</strong> Use it 5-10 times to refine the prompt</p>
                  <p><strong>4. Measure Impact:</strong> Does it save time? Improve quality?</p>
                  <p><strong>5. Scale Gradually:</strong> Add more agents only after proving value</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}