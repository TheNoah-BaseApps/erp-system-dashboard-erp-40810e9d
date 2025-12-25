'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const variants = {
  error: {
    icon: AlertCircle,
    className: 'border-destructive/50 text-destructive',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-500/50 text-yellow-700',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-green-500/50 text-green-700',
  },
  info: {
    icon: Info,
    className: 'border-blue-500/50 text-blue-700',
  },
};

export default function AlertBanner({ type = 'info', title, message }) {
  const { icon: Icon, className } = variants[type];

  return (
    <Alert className={className}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}