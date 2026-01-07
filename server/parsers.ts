import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { PDFParse } from 'pdf-parse';

/**
 * Parse URL and extract article content using Readability
 */
export async function parseUrl(url: string): Promise<{
  title: string;
  content: string;
  estimatedReadingTime: number;
}> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Could not parse article');
    }

    const readingTime = estimateReadingTime(article.textContent ?? '');

    return {
      title: article.title ?? 'Untitled',
      content: article.content ?? '',
      estimatedReadingTime: readingTime,
    };
  } catch (error) {
    throw new Error(`Failed to parse URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse PDF and extract text
 */
export async function parsePdf(buffer: Buffer): Promise<{
  text: string;
  estimatedReadingTime: number;
}> {
  try {
    const pdfParser = new PDFParse({ data: buffer });
    const result = await pdfParser.getText();
    const text = result.text ?? '';
    const readingTime = estimateReadingTime(text);

    return {
      text,
      estimatedReadingTime: readingTime,
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Clean up pasted text - remove extra spaces, fix line breaks
 */
export function cleanText(text: string): string {
  return text
    // Remove multiple consecutive spaces
    .replace(/  +/g, ' ')
    // Fix multiple line breaks (keep max 2)
    .replace(/\n\n\n+/g, '\n\n')
    // Remove leading/trailing whitespace from each line
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)
    .join('\n')
    // Trim overall
    .trim();
}

/**
 * Estimate reading time based on word count
 * Average reading speed is ~200-250 words per minute
 */
export function estimateReadingTime(text: string): number {
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const readingSpeed = 225; // words per minute
  const minutes = Math.ceil(wordCount / readingSpeed);
  return Math.max(1, minutes);
}

/**
 * Auto-tag content based on keywords
 */
export function autoTag(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const tags: Set<string> = new Set();

  const categoryKeywords: Record<string, string[]> = {
    'Technology': ['tech', 'software', 'ai', 'machine learning', 'code', 'programming', 'app', 'digital', 'cyber', 'algorithm'],
    'Science': ['science', 'research', 'study', 'experiment', 'physics', 'chemistry', 'biology', 'discovery', 'scientist'],
    'Business': ['business', 'company', 'market', 'economy', 'finance', 'startup', 'investment', 'corporate', 'enterprise'],
    'Health': ['health', 'medical', 'doctor', 'disease', 'treatment', 'wellness', 'fitness', 'nutrition', 'mental health'],
    'Politics': ['politics', 'government', 'election', 'congress', 'senate', 'president', 'law', 'policy', 'political'],
    'Entertainment': ['movie', 'music', 'entertainment', 'film', 'actor', 'celebrity', 'show', 'series', 'game'],
    'Sports': ['sports', 'game', 'team', 'player', 'championship', 'league', 'athletic', 'competition'],
    'Travel': ['travel', 'destination', 'journey', 'trip', 'tourism', 'explore', 'adventure', 'vacation'],
  };

  for (const [tag, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword: string) => text.includes(keyword))) {
      tags.add(tag);
    }
  }

  return tags.size > 0 ? Array.from(tags) : ['General'];
}

/**
 * Extract headings from HTML content to generate table of contents
 */
export function extractHeadings(htmlContent: string): Array<{ level: number; text: string; id: string }> {
  const dom = new JSDOM(htmlContent);
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let headingCount = 0;

  dom.window.document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading: Element) => {
    const level = parseInt(heading.tagName[1]);
    const text = heading.textContent ?? '';
    const id = heading.id || `heading-${headingCount++}`;

    headings.push({ level, text, id });
  });

  return headings;
}
