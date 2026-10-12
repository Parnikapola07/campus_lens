import React from 'react';
import { Cpu, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { OllamaStatus } from '../types';

interface OllamaStatusBadgeProps {
  status: OllamaStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenSetup: () => void;
}

export const OllamaStatusBadge: React.FC<OllamaStatusBadgeProps> = ({
  status,
  loading,
  onRefresh,
  onOpenSetup,
}) => {
  const isConnected = status?.connected ?? false;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenSetup}
        title="Click to view Local Ollama configuration and Windows setup guide"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          isConnected
            ? 'bg-teal-950/60 border-teal-500/40 text-teal-300 hover:bg-teal-900/60'
            : 'bg-amber-950/50 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? 'bg-teal-400' : 'bg-amber-400'
            }`}
          ></span>
        </span>

        <Cpu className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">
          {isConnected
            ? `Ollama: ${status?.model || 'gemma4:e2b'}`
            : 'Ollama Disconnected (Local)'}
        </span>

        {isConnected ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 ml-0.5" />
        ) : (
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
        )}
      </button>

      <button
        onClick={onRefresh}
        disabled={loading}
        title="Check Ollama connection status"
        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
      </button>
    </div>
  );
};
