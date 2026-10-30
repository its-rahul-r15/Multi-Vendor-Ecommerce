import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  
  if (['confirmed', 'paid', 'approved', 'active', 'delivered'].includes(normalized)) {
    return <Badge variant="success" className="capitalize">{normalized.replace('_', ' ')}</Badge>;
  }
  if (['packed', 'shipped', 'in_progress', 'processing'].includes(normalized)) {
    return <Badge variant="info" className="capitalize">{normalized.replace('_', ' ')}</Badge>;
  }
  if (['awaiting_payment', 'pending', 'pending_review', 'requested'].includes(normalized)) {
    return <Badge variant="warning" className="capitalize">{normalized.replace('_', ' ')}</Badge>;
  }
  if (['cancelled', 'rejected', 'failed', 'refunded', 'banned'].includes(normalized)) {
    return <Badge variant="danger" className="capitalize">{normalized.replace('_', ' ')}</Badge>;
  }
  
  return <Badge variant="default" className="capitalize">{normalized.replace('_', ' ')}</Badge>;
};

export default StatusBadge;
