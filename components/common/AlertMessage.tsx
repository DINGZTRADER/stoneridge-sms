import React from 'react';

interface AlertMessageProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message?: string; // Make message optional as children can now be used
  className?: string;
  children?: React.ReactNode; // New: allow children for richer content
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, className, children }) => {
  const baseStyles = 'p-3 rounded-md text-sm flex items-center';
  const typeStyles = {
    success: 'bg-green-100 border border-green-400 text-green-700',
    error: 'bg-red-100 border border-red-400 text-red-700',
    info: 'bg-blue-100 border border-blue-400 text-blue-700',
    warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
  };

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${className || ''}`} role="alert">
      <span className="mr-2">{icon[type]}</span>
      <div className="flex-grow"> {/* Added div to wrap content */}
        {children || message} {/* Render children if present, else message */}
      </div>
    </div>
  );
};

export default AlertMessage;