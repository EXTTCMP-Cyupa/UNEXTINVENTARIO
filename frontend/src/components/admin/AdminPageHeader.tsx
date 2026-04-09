import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  lastUpdated?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  refreshLabel?: string;
  actions?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  lastUpdated,
  onRefresh,
  refreshing = false,
  refreshLabel = 'Actualizar',
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">{description}</p>
          {lastUpdated ? (
            <p className="mt-2 text-xs text-gray-500" aria-live="polite">
              Ultima actualizacion: {lastUpdated}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {onRefresh ? (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {refreshing ? 'Actualizando...' : refreshLabel}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
