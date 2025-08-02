import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Activity, 
  Brain, 
  Zap, 
  Globe, 
  Rocket 
} from 'lucide-react';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Overview', href: '/', icon: BarChart3 },
  { name: 'Live Shipping', href: '/live', icon: Activity },
  { name: 'AI Insights', href: '/insights', icon: Brain },
  { name: 'Performance', href: '/performance', icon: Zap },
  { name: 'Global Stats', href: '/global', icon: Globe },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Rocket className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Shipping Analytics</h1>
              <p className="text-sm text-gray-500">Real-time /ship monitoring</p>
            </div>
          </div>
          
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}