interface MDXElementProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

export const mdxComponents = {
  h2: ({ children, ...props }: MDXElementProps) => (
    <h2
      className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4 mt-8"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: MDXElementProps) => (
    <h3
      className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3 mt-6"
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
  pre: ({ children, ...props }: MDXElementProps) => (
    <div {...props}>{children}</div>
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
