import { Router, Request, Response } from 'express';
import { parseUrl, parsePdf, cleanText, estimateReadingTime, autoTag } from './parsers';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * Parse URL and extract article content
 */
router.post('/parse-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    const { title, content, estimatedReadingTime } = await parseUrl(url);
    const tags = autoTag(title, content);

    res.json({
      title,
      content,
      readingTime: estimatedReadingTime,
      tags,
    });
  } catch (error) {
    console.error('URL parsing error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to parse URL',
    });
  }
});

/**
 * Parse pasted text
 */
router.post('/parse-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanedText = cleanText(text);
    const readingTime = estimateReadingTime(cleanedText);

    // Extract first line as title or use a default
    const lines = cleanedText.split('\n');
    const title = lines[0]?.substring(0, 100) || 'Untitled Document';

    const tags = autoTag(title, cleanedText);

    res.json({
      title,
      content: cleanedText,
      readingTime,
      tags,
    });
  } catch (error) {
    console.error('Text parsing error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process text',
    });
  }
});

/**
 * Parse PDF file
 */
router.post('/parse-pdf', upload.single('file'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const { text, estimatedReadingTime } = await parsePdf(req.file.buffer);

    // Extract title from filename
    const title = req.file.originalname.replace('.pdf', '');

    const tags = autoTag(title, text);

    res.json({
      title,
      content: text,
      readingTime: estimatedReadingTime,
      tags,
    });
  } catch (error) {
    console.error('PDF parsing error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to parse PDF',
    });
  }
});

export default router;
