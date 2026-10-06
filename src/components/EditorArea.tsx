import React, { useEffect, useRef } from 'react';

interface EditorAreaProps {
  initialContent: string;
  remoteContent?: string;
  onChange: (html: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
}

// Helpers to preserve caret position during remote updates
function getCaretCharacterOffsetWithin(element: HTMLElement): number {
  let caretOffset = 0;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }
  return caretOffset;
}

function setCaretPosition(element: HTMLElement, offset: number): void {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(true);

  let currentOffset = 0;
  const stack: Node[] = [element];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.nodeType === Node.TEXT_NODE) {
      const textLen = node.textContent?.length || 0;
      if (currentOffset + textLen >= offset) {
        range.setStart(node, Math.min(offset - currentOffset, textLen));
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      currentOffset += textLen;
    } else {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        stack.push(node.childNodes[i]);
      }
    }
  }
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  initialContent,
  remoteContent,
  onChange,
  editorRef,
}) => {
  const isInitialized = useRef(false);
  const lastEmittedHtml = useRef<string>(initialContent);

  // Set initial content once
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = initialContent;
      lastEmittedHtml.current = initialContent;
      isInitialized.current = true;
    }
  }, [initialContent, editorRef]);

  // 14. Apply remote document changes from other collaborators
  useEffect(() => {
    if (!editorRef.current || !remoteContent || !isInitialized.current) {
      return;
    }

    const currentHtml = editorRef.current.innerHTML;

    // Only update DOM if the remote content actually differs from current HTML
    if (remoteContent !== currentHtml && remoteContent !== lastEmittedHtml.current) {
      const isFocused = document.activeElement === editorRef.current;
      const caretOffset = isFocused ? getCaretCharacterOffsetWithin(editorRef.current) : null;

      // Update innerHTML
      editorRef.current.innerHTML = remoteContent;
      lastEmittedHtml.current = remoteContent;

      // Restore caret if editor was actively focused
      if (isFocused && caretOffset !== null) {
        try {
          setCaretPosition(editorRef.current, caretOffset);
        } catch {
          // Fallback gracefully if DOM structure changed drastically
        }
      }
    }
  }, [remoteContent, editorRef]);

  const handleInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      lastEmittedHtml.current = currentHtml;
      onChange(currentHtml);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Enable Tab key indentation inside code blocks or lists
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      handleInput();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-12 min-h-[750px] focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-all">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="prose-editor focus:outline-none min-h-[600px] text-slate-800 text-base leading-relaxed"
          data-placeholder="Start typing your technical specification..."
        />
      </div>
    </div>
  );
};
