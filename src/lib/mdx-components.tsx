import React from 'react';
import { CodeBlock } from '@/components/content/CodeBlock';
import { Table } from '@/components/content/Table';
import { slugify } from '@/lib/slugify';

interface MDXElementProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

/** Flatten a fenced code block's children down to the raw source string. */
function toText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(toText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return toText(node.props.children);
  }
  return '';
}

export const mdxComponents = {
  h1: ({ children, ...props }: MDXElementProps) => (
    <h1
      className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6"
      {...props}
    >
      {children}
    </h1>
  ),
  // id is derived the same way the search index derives its anchors, so search
  // results can deep-link straight to a section.
  h2: ({ children, ...props }: MDXElementProps) => (
    <h2
      id={slugify(toText(children))}
      className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4 mt-8 scroll-mt-24"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: MDXElementProps) => (
    <h3
      id={slugify(toText(children))}
      className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3 mt-6 scroll-mt-24"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: MDXElementProps) => (
    <h4
      className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2 mt-4"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: MDXElementProps) => (
    <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: MDXElementProps) => (
    <ul
      className="mb-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: MDXElementProps) => (
    <ol
      className="mb-4 list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: MDXElementProps) => (
    <li className="ml-2" {...props}>
      {children}
    </li>
  ),
  code: ({ children, ...props }: MDXElementProps) => (
    <code
      className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      {...props}
    >
      {children}
    </code>
  ),
  // Fenced code blocks. Route through CodeBlock so whitespace is preserved
  // and the copy button is available.
  pre: ({ children }: MDXElementProps) => {
    const child = React.Children.toArray(children)[0];

    if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
      const language = /language-([\w-]+)/.exec(child.props.className ?? '')?.[1];
      return (
        <CodeBlock language={language ?? 'text'}>
          {toText(child.props.children).replace(/\n$/, '')}
        </CodeBlock>
      );
    }

    return (
      <CodeBlock language="text">{toText(children).replace(/\n$/, '')}</CodeBlock>
    );
  },
  table: ({ children }: MDXElementProps) => <Table>{children}</Table>,
  hr: () => (
    <hr className="my-8 border-t border-gray-200 dark:border-gray-800" />
  ),
  a: ({ children, ...props }: MDXElementProps) => (
    <a
      className="text-blue-600 hover:underline dark:text-blue-400"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }: MDXElementProps) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-700 dark:text-gray-400 my-4"
      {...props}
    >
      {children}
    </blockquote>
  ),
  thead: ({ children, ...props }: MDXElementProps) => (
    <thead className="bg-gray-100 dark:bg-gray-900" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: MDXElementProps) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-800" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: MDXElementProps) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: MDXElementProps) => (
    <th
      className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-50"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: MDXElementProps) => (
    <td
      className="px-4 py-2 text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </td>
  ),
};
