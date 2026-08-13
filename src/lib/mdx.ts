import React from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';
import { CodeBlock } from '@/components/content/CodeBlock';
import { VideoEmbed } from '@/components/content/VideoEmbed';
import { Callout } from '@/components/content/Callout';
import { Table } from '@/components/content/Table';
import { mdxComponents } from '@/lib/mdx-components';
import remarkGfm from 'remark-gfm';
import fs from 'fs/promises';
import path from 'path';

export interface DocMetadata {
  title?: string;
  description?: string;
}

interface GetDocResult {
  content: React.ReactElement;
  metadata?: DocMetadata;
}

const componentsMap = {
  ...mdxComponents,
  CodeBlock,
  VideoEmbed,
  Callout,
  Table,
};

export async function getDocBySlug(slug: string[]): Promise<GetDocResult> {
  const contentPath = path.join(process.cwd(), 'src', 'content');
  const filePath = path.join(contentPath, ...slug) + '.md';

  try {
    const source = await fs.readFile(filePath, 'utf-8');

    const { content, frontmatter } = await compileMDX({
      source,
      components: componentsMap,
      options: {
        parseFrontmatter: true,
        // GFM is what gives us pipe tables, strikethrough and autolinks.
        // Without it every table in the manual renders as raw pipe text.
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      },
    });

    return {
      content,
      metadata: frontmatter as DocMetadata,
    };
  } catch (error) {
    throw new Error(`Failed to load document: ${slug.join('/')}`);
  }
}

export async function getAllDocSlugs(): Promise<string[][]> {
  const contentPath = path.join(process.cwd(), 'src', 'content');
  const slugs: string[][] = [];

  async function walkDir(dir: string, prefix: string[] = []): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const slugPart = entry.name.replace(/\.md$/, '');

      if (entry.isDirectory()) {
        await walkDir(fullPath, [...prefix, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        slugs.push([...prefix, slugPart]);
      }
    }
  }

  await walkDir(contentPath);
  return slugs;
}
