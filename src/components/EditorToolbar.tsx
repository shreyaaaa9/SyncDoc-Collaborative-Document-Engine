import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code2,
  Terminal,
  Link2,
  Quote,
  Table,
} from 'lucide-react';

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
}

interface ToolbarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  command: string;
  value?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onFormat }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleAction = (item: ToolbarItem) => {
    if (item.command === 'createLink') {
      const url = window.prompt('Enter target URL:', 'https://');
      if (url) {
        onFormat(item.command, url);
      }
    } else {
      onFormat(item.command, item.value);
    }
  };

  const renderButton = (item: ToolbarItem) => (
    <div key={item.id} className="relative flex items-center">
      <button
        type="button"
        onClick={() => handleAction(item)}
        onMouseEnter={() => setActiveTooltip(item.id)}
        onMouseLeave={() => setActiveTooltip(null)}
        onFocus={() => setActiveTooltip(item.id)}
        onBlur={() => setActiveTooltip(null)}
        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
        aria-label={item.label}
      >
        {item.icon}
      </button>

      {/* Tooltip */}
      {activeTooltip === item.id && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[11px] rounded shadow-lg whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5">
          <span>{item.label}</span>
          {item.shortcut && (
            <kbd className="px-1 py-0.2 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">
              {item.shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="sticky top-16 z-20 w-full bg-white border-b border-slate-200/90 px-3 py-1.5 flex items-center gap-1 overflow-x-auto shadow-xs no-scrollbar">
      {/* History */}
      <div className="flex items-center gap-0.5">
        {renderButton({
          id: 'undo',
          icon: <Undo2 className="w-4 h-4" />,
          label: 'Undo',
          shortcut: 'Ctrl+Z',
          command: 'undo',
        })}
        {renderButton({
          id: 'redo',
          icon: <Redo2 className="w-4 h-4" />,
          label: 'Redo',
          shortcut: 'Ctrl+Y',
          command: 'redo',
        })}
      </div>

      <div className="h-4 w-px bg-slate-200 mx-1 flex-shrink-0" />

      {/* Text Style */}
      <div className="flex items-center gap-0.5">
        {renderButton({
          id: 'bold',
          icon: <Bold className="w-4 h-4 stroke-[2.2]" />,
          label: 'Bold',
          shortcut: 'Ctrl+B',
          command: 'bold',
        })}
        {renderButton({
          id: 'italic',
          icon: <Italic className="w-4 h-4" />,
          label: 'Italic',
          shortcut: 'Ctrl+I',
          command: 'italic',
        })}
        {renderButton({
          id: 'underline',
          icon: <Underline className="w-4 h-4" />,
          label: 'Underline',
          shortcut: 'Ctrl+U',
          command: 'underline',
        })}
        {renderButton({
          id: 'inline-code',
          icon: <Code2 className="w-4 h-4" />,
          label: 'Inline Code',
          shortcut: '`code`',
          command: 'inlineCode',
        })}
      </div>

      <div className="h-4 w-px bg-slate-200 mx-1 flex-shrink-0" />

      {/* Headings */}
      <div className="flex items-center gap-0.5">
        {renderButton({
          id: 'h1',
          icon: <Heading1 className="w-4 h-4" />,
          label: 'Heading 1',
          command: 'formatBlock',
          value: 'H1',
        })}
        {renderButton({
          id: 'h2',
          icon: <Heading2 className="w-4 h-4" />,
          label: 'Heading 2',
          command: 'formatBlock',
          value: 'H2',
        })}
        {renderButton({
          id: 'h3',
          icon: <Heading3 className="w-4 h-4" />,
          label: 'Heading 3',
          command: 'formatBlock',
          value: 'H3',
        })}
      </div>

      <div className="h-4 w-px bg-slate-200 mx-1 flex-shrink-0" />

      {/* Lists */}
      <div className="flex items-center gap-0.5">
        {renderButton({
          id: 'bullet-list',
          icon: <List className="w-4 h-4" />,
          label: 'Bullet List',
          command: 'insertUnorderedList',
        })}
        {renderButton({
          id: 'ordered-list',
          icon: <ListOrdered className="w-4 h-4" />,
          label: 'Numbered List',
          command: 'insertOrderedList',
        })}
      </div>

      <div className="h-4 w-px bg-slate-200 mx-1 flex-shrink-0" />

      {/* Blocks & Links */}
      <div className="flex items-center gap-0.5">
        {renderButton({
          id: 'code-block',
          icon: <Terminal className="w-4 h-4" />,
          label: 'Code Block',
          command: 'codeBlock',
        })}
        {renderButton({
          id: 'blockquote',
          icon: <Quote className="w-4 h-4" />,
          label: 'Quote',
          command: 'formatBlock',
          value: 'BLOCKQUOTE',
        })}
        {renderButton({
          id: 'link',
          icon: <Link2 className="w-4 h-4" />,
          label: 'Insert Link',
          command: 'createLink',
        })}
        {renderButton({
          id: 'table',
          icon: <Table className="w-4 h-4" />,
          label: 'Insert Table',
          command: 'insertTable',
        })}
      </div>
    </div>
  );
};
