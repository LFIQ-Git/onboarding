import { Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  children: React.ReactNode;
}

const calloutStyles = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400',
  },
};

export function Callout({
  type = 'info',
  title,
  children,
}: CalloutProps) {
  const style = calloutStyles[type];
  const Icon = style.icon;

  return (
    <div
      className={`my-4 flex gap-3 rounded-lg border-l-4 p-4 ${style.bg} ${style.border}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1">
        {title && (
          <p className="font-bold text-gray-900 dark:text-gray-50 mb-1">
            {title}
          </p>
        )}
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}
