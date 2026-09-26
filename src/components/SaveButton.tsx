import React, { useState } from 'react';
import { Check, Save, Loader2 } from 'lucide-react';

interface SaveButtonProps {
  onSave: () => Promise<void> | void;
  lastSavedText?: string;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  lastSavedText = 'Saved just now',
  className = '',
}) => {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleClick = async () => {
    if (status === 'saving') return;
    setStatus('saving');
    try {
      await onSave();
      setStatus('saved');
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {status === 'saved' && (
        <span className="text-xs text-slate-500 font-medium hidden sm:inline animate-in fade-in">
          {lastSavedText}
        </span>
      )}

      <button
        onClick={handleClick}
        disabled={status === 'saving'}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
          status === 'saved'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
            : status === 'saving'
            ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-wait'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
        }`}
        title={status === 'saved' ? 'All changes saved locally' : 'Save document (Ctrl+S)'}
      >
        {status === 'saving' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : status === 'saved' ? (
          <>
            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span className="font-semibold">✓ Saved</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save</span>
          </>
        )}
      </button>
    </div>
  );
};
