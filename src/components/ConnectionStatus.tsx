import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import type { ConnectionStatus as StatusType } from '../collaboration/types';
import { webSocketService } from '../collaboration/websocketService';

interface ConnectionStatusProps {
  status: StatusType;
  onReconnect?: () => void;
  showSimulateToggle?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  onReconnect,
  showSimulateToggle = true,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Connected',
          dotClass: 'bg-emerald-500 animate-pulse',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'connecting':
        return {
          label: 'Connecting...',
          dotClass: 'bg-amber-400 animate-ping',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
        };
      case 'reconnecting':
        return {
          label: 'Reconnecting...',
          dotClass: 'bg-amber-500 animate-bounce',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
        };
      case 'disconnected':
      default:
        return {
          label: 'Disconnected',
          dotClass: 'bg-rose-500',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/70',
          icon: <WifiOff className="w-3.5 h-3.5 text-rose-600" />,
        };
    }
  };

  const config = getStatusConfig();
  const wsUrl = webSocketService.getUrl();

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${config.badgeClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
        title={`WebSocket Status: ${config.label}. Click for details.`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass.replace('animate-pulse', '').replace('animate-bounce', '')}`} />
        </span>
        <span className="hidden sm:inline font-mono text-[11px] tracking-tight">{config.label}</span>
      </button>

      {/* Popover Card on Click */}
      {showDetails && (
        <div
          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-50 text-left text-xs text-slate-700 animate-in fade-in slide-in-from-top-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              {config.icon}
              Real-Time Sync Engine
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
              {status}
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span className="text-slate-400">WebSocket URL:</span>
              <span className="font-mono text-slate-800 truncate max-w-[150px]">{wsUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Protocol:</span>
              <span className="font-mono text-slate-800">Yjs + JSON WS / P2P</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            {onReconnect && (
              <button
                onClick={() => {
                  onReconnect();
                  setShowDetails(false);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Reconnect Now
              </button>
            )}

            {showSimulateToggle && (
              <button
                onClick={() => {
                  webSocketService.simulateConnectionToggle(status === 'disconnected');
                }}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  status === 'disconnected'
                    ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                }`}
                title="Simulate network disconnect/reconnect for testing"
              >
                {status === 'disconnected' ? 'Restore Connection' : 'Simulate Offline'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
