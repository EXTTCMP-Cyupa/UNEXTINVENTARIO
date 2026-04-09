import React from 'react';

type BannerVariant = 'info' | 'success' | 'warning' | 'error';

interface AdminStatusBannerProps {
  variant?: BannerVariant;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const variantStyles: Record<BannerVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export default function AdminStatusBanner({
  variant = 'info',
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}: AdminStatusBannerProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${variantStyles[variant]} ${className}`} role={variant === 'error' ? 'alert' : 'status'}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          <p className="text-sm">{message}</p>
        </div>

        {actionLabel && onAction ? (
          <button
            onClick={onAction}
            className="rounded-md bg-white/70 px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-white"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
