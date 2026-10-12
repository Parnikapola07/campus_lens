import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { ExtractedNotice, OllamaStatus } from '../types';
import { SAMPLE_NOTICES } from '../data/demoNotices';

interface NoticeUploaderProps {
  ollamaStatus: OllamaStatus | null;
  onNoticeExtracted: (notice: ExtractedNotice) => void;
  onLoadSample: (sampleNotice: ExtractedNotice) => void;
  onOpenSetupGuide: () => void;
}

export const NoticeUploader: React.FC<NoticeUploaderProps> = ({
  ollamaStatus,
  onNoticeExtracted,
  onLoadSample,
  onOpenSetupGuide,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState<string>('');
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setExtractionError('Please upload an image file (JPG, PNG, or WebP).');
      return;
    }

    setExtractionError(null);
    setSelectedFileName(file.name);
    setFileSizeStr(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const runOllamaExtraction = async () => {
    if (!selectedImage) return;

    setIsExtracting(true);
    setExtractionError(null);
    setExtractionStage('1. Encoding image into Base64 payload...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setExtractionStage('2. Transmitting image to local Ollama adapter (/api/ollama/extract)...');

      await new Promise((resolve) => setTimeout(resolve, 300));
      setExtractionStage(`3. Gemma 4 vision model (gemma4:e2b) analyzing campus notice...`);

      const res = await fetch('/api/ollama/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          modelOverride: ollamaStatus?.model || 'gemma4:e2b',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with HTTP ${res.status}: ${res.statusText}`
        );
      }

      setExtractionStage('4. Parsing structured schedule & validating JSON schema...');
      const responseData = await res.json();

      if (!responseData.success || !responseData.data) {
        throw new Error(responseData.error || 'Failed to extract valid notice data.');
      }

      const extracted = responseData.data;

      const newNotice: ExtractedNotice = {
        id: `notice-${Date.now()}`,
        imageUrl: selectedImage,
        fileName: selectedFileName || 'Uploaded_Notice.png',
        uploadedAt: new Date().toISOString(),
        source: 'local_ollama',
        title: extracted.title || 'Extracted Campus Notice',
        organization: extracted.organization,
        eventName: extracted.eventName || extracted.title || 'Campus Event',
        description: extracted.description,
        date: extracted.date,
        startTime: extracted.startTime,
        endTime: extracted.endTime,
        venue: extracted.venue,
        deadline: extracted.deadline,
        eligibility: extracted.eligibility,
        requiredDocuments: extracted.requiredDocuments || [],
        suggestedActions: extracted.suggestedActions || [],
        supportingText: extracted.supportingText,
        verificationFlags: extracted.verificationFlags || [],
        rawModelNotes: extracted.rawModelNotes || 'Extracted via local gemma4:e2b vision model.',
        userVerified: false,
      };

      onNoticeExtracted(newNotice);
      // Reset form
      setSelectedImage(null);
      setSelectedFileName(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExtractionError(msg);
    } finally {
      setIsExtracting(false);
      setExtractionStage('');
    }
  };

  const isConnected = ollamaStatus?.connected ?? false;

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-teal-400" />
            Notice Ingestion &amp; Gemma Vision Extractor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Drop any campus circular, workshop flyer, or exam poster to extract actionable events and deadlines.
          </p>
        </div>

        {/* Model info pill */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-400">Target Model:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-teal-300">
            {ollamaStatus?.model || 'gemma4:e2b'}
          </span>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-teal-400 bg-teal-950/20'
            : 'border-slate-700 hover:border-teal-500/50 bg-[#0b132b]/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedImage ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-left">
            <div className="relative w-28 h-36 rounded-lg overflow-hidden border border-slate-700 bg-black/40 shrink-0 shadow-md">
              <img
                src={selectedImage}
                alt="Selected notice preview"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-white">{selectedFileName}</span>
              </div>
              <p className="text-xs text-slate-400">File size: {fileSizeStr}</p>
              <p className="text-xs text-teal-300">Image loaded ready for local Gemma inference.</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                  setSelectedFileName(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline pt-1 inline-block"
              >
                Change image
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-slate-200">
              Drag &amp; drop notice image here, or <span className="text-teal-400 underline">browse</span>
            </div>
            <p className="text-xs text-slate-500">Supports JPG, PNG, and WebP posters up to 25MB</p>
          </div>
        )}
      </div>

      {/* Progress or Actions */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex-1">
          {isExtracting ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-teal-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>{extractionStage}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-400 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          ) : extractionError ? (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Extraction Notice:</span>
                {extractionError}
                {!isConnected && (
                  <div className="mt-1 text-slate-300">
                    Your local Ollama at <code className="font-mono text-teal-300">http://localhost:11434</code> is currently disconnected.{' '}
                    <button
                      onClick={onOpenSetupGuide}
                      className="underline text-teal-300 hover:text-teal-200 ml-1"
                    >
                      View Windows setup instructions
                    </button>{' '}
                    or load a pre-extracted sample below.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Extracts dates, timings, venues, registration deadlines, and generates actionable checklist items.
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {selectedImage && !isExtracting && (
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={runOllamaExtraction}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 shadow-lg shadow-teal-950 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze with {ollamaStatus?.model || 'gemma4:e2b'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Sample Notice Selector (Mandatory Demo Requirement) */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Or try with sample campus notice posters:
          </span>
          <span className="text-[11px] text-slate-500">Includes intentional schedule overlap</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLE_NOTICES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onLoadSample(sample)}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition-colors line-clamp-1">
                  {sample.eventName}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {sample.date} · {sample.startTime} - {sample.endTime}
                </div>
              </div>
              <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="line-clamp-1">{sample.venue}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
