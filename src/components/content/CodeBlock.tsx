'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  highlight?: number[];
}

export function CodeBlock({
  children,
  language = 'bash',
  filename,
  highlight,
}: CodeBlockProps) {
  void highlight;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg bg-gray-950 p-4 overflow-x-auto">
      {filename && (
        <div className="text-xs text-gray-400 mb-2 font-mono">{filename}</div>
      )}
      <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words">
        <code className={`language-${language}`}>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-300" />
        )}
      </button>
    </div>
  );
}
