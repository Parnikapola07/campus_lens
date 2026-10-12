import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, ShieldCheck, Laptop, AlertTriangle } from 'lucide-react';
import { OllamaStatus } from '../types';

interface WindowsSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: OllamaStatus | null;
  onUpdateConfig: (baseUrl: string, model: string) => Promise<void>;
  onRefreshStatus: () => void;
}

export const WindowsSetupModal: React.FC<WindowsSetupModalProps> = ({
  isOpen,
  onClose,
  status,
  onUpdateConfig,
  onRefreshStatus,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customUrl, setCustomUrl] = useState(status?.baseUrl || 'http://127.0.0.1:11434');
  const [customModel, setCustomModel] = useState(status?.model || 'gemma4:e2b');
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setSaveSuccess(false);
    try {
      await onUpdateConfig(customUrl, customModel);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSavingConfig(false);
    }
  };

  const commands = [
    {
      title: '1. Verify Ollama & Model on Windows',
      desc: 'Confirm your local Ollama instance is serving the gemma4:e2b model on 127.0.0.1:',
      cmd: 'ollama run gemma4:e2b',
    },
    {
      title: '2. Verify Ollama Tags Endpoint',
      desc: 'Test that Ollama is responding on IPv4 127.0.0.1:11434 in PowerShell:',
      cmd: 'curl http://127.0.0.1:11434/api/tags',
    },
    {
      title: '3. Install Dependencies in CampusLens',
      desc: 'Install required Node.js packages on your Windows laptop:',
      cmd: 'npm install',
    },
    {
      title: '4. Launch CampusLens Locally',
      desc: 'Starts the Express backend adapter and Vite frontend on port 3000:',
      cmd: 'npm run dev',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Local Ollama &amp; Windows Setup Guide</h2>
              <p className="text-xs text-slate-400">
                Running CampusLens with your local <code className="text-teal-300 font-mono">gemma4:e2b</code> model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why Disconnected in Cloud Preview Banner */}
        <div className="mt-4 p-4 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300 block mb-1">
              Why does Ollama show disconnected in the cloud preview?
            </span>
            This AI Studio web preview runs in an isolated Google Cloud container. When the cloud backend tries to query{' '}
            <code className="text-amber-300 font-mono px-1 py-0.5 bg-black/40 rounded">http://127.0.0.1:11434</code>,
            &quot;127.0.0.1&quot; refers to the cloud container, not your physical Windows laptop!
            <br className="my-1" />
            <strong className="text-white">To use your local Ollama model:</strong> Run CampusLens directly on your Windows laptop using the 4 steps below.
          </div>
        </div>

        {/* Current Connection Status Box */}
        <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-slate-300">Backend Health &amp; Model Status</div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  status?.connected ? (status?.modelReady ? 'bg-teal-400' : 'bg-amber-400') : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-medium text-slate-300">
                {!status?.connected
                  ? 'Disconnected'
                  : status?.modelReady
                  ? 'Connected & Model Verified'
                  : 'Connected (Model Missing)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>
              <span className="text-slate-500">Configured Endpoint: </span>
              <code className="text-slate-300 font-mono">{status?.baseUrl || 'http://127.0.0.1:11434'}</code>
            </div>
            <div>
              <span className="text-slate-500">Target Model: </span>
              <code className="text-slate-300 font-mono">{status?.model || 'gemma4:e2b'}</code>
            </div>
            <div>
              <span className="text-slate-500">HTTP Response: </span>
              <span className="font-mono text-slate-300">
                {status?.httpStatus ? `HTTP ${status.httpStatus} ${status.statusText || ''}` : 'No response / Network error'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Roundtrip Latency: </span>
              <span className="font-mono text-teal-300">
                {status?.latencyMs !== undefined ? `${status.latencyMs} ms` : 'N/A'}
              </span>
            </div>
          </div>

          {status?.error && (
            <div className="mt-2.5 text-xs text-rose-300 font-mono bg-rose-950/40 p-2.5 rounded border border-rose-900/50 break-words">
              <strong>Error Details:</strong> {status.error}
            </div>
          )}

          {status?.connected && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Model Verification:</span>
                <span className={status.modelReady ? 'text-teal-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {status.modelReady ? `✓ Model '${status.model}' found` : `✗ Model '${status.model}' not found`}
                </span>
              </div>
              <div className="mt-1 text-slate-400 text-[11px]">
                Installed Ollama Models:{' '}
                <span className="font-mono text-slate-200">
                  {status.availableModels && status.availableModels.length > 0
                    ? status.availableModels.join(', ')
                    : 'None detected'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Steps to run on Windows */}
        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Steps to run locally on your Windows laptop</h3>
          {commands.map((c, i) => (
            <div key={i} className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-teal-300">{c.title}</span>
                <button
                  onClick={() => handleCopy(c.cmd, i)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-3 h-3 text-teal-400" />
                      <span className="text-teal-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-2">{c.desc}</p>
              <div className="flex items-center gap-2 p-2 bg-[#080d1a] border border-slate-800 rounded font-mono text-xs text-teal-200 overflow-x-auto">
                <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <pre className="text-xs whitespace-pre-wrap">{c.cmd}</pre>
              </div>
            </div>
          ))}
        </div>

        {/* In-app Config Updater */}
        <form onSubmit={handleSaveConfig} className="mt-5 p-4 bg-slate-900/90 border border-slate-800 rounded-lg">
          <h4 className="text-xs font-semibold text-slate-300 mb-2">
            Advanced: Configure Ollama Endpoint &amp; Model
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <label className="block text-slate-400 mb-1">Ollama Base URL (Use 127.0.0.1)</label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="http://127.0.0.1:11434"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Model Name</label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="gemma4:e2b"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {saveSuccess && <span className="text-teal-400">Config updated successfully! Rechecking...</span>}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefreshStatus}
                className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                Test Health Endpoint (/api/ollama/health)
              </button>
              <button
                type="submit"
                disabled={savingConfig}
                className="px-3 py-1.5 text-xs text-white bg-teal-600 hover:bg-teal-500 rounded font-medium transition-colors"
              >
                {savingConfig ? 'Updating...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Private local inference on your Windows hardware</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
