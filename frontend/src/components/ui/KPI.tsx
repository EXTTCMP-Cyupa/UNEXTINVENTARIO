import React from 'react';

interface KPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    label: string;
  };
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
};

export const KPI: React.FC<KPIProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue',
  trend 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`mt-2 flex items-center text-xs ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-semibold">
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1 text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
