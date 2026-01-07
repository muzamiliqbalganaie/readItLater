import { describe, expect, it } from 'vitest';
import * as db from './db';
import { cleanText, estimateReadingTime, autoTag } from './parsers';

describe('Document Operations', () => {
  describe('cleanText', () => {
    it('should remove multiple consecutive spaces', () => {
      const input = 'Hello    world    test';
      const output = cleanText(input);
      expect(output).toBe('Hello world test');
    });

    it('should fix multiple line breaks', () => {
      const input = 'Line 1\n\n\n\nLine 2';
      const output = cleanText(input);
      expect(output).toContain('Line 1');
      expect(output).toContain('Line 2');
    });

    it('should remove leading/trailing whitespace from lines', () => {
      const input = '  Line 1  \n  Line 2  ';
      const output = cleanText(input);
      expect(output).toContain('Line 1');
      expect(output).toContain('Line 2');
    });

    it('should handle mixed formatting issues', () => {
      const input = '  Hello    world  \n\n\n  This  is  a   test  ';
      const output = cleanText(input);
      expect(output).toContain('Hello world');
      expect(output).toContain('This is a test');
    });

    it('should trim overall whitespace', () => {
      const input = '  \n  Content here  \n  ';
      const output = cleanText(input);
      expect(output).toBe('Content here');
    });
  });

  describe('estimateReadingTime', () => {
    it('should estimate reading time based on word count', () => {
      const text = 'word '.repeat(225);
      const time = estimateReadingTime(text);
      expect(time).toBe(1);
    });

    it('should return minimum 1 minute', () => {
      const text = 'short';
      const time = estimateReadingTime(text);
      expect(time).toBeGreaterThanOrEqual(1);
    });

    it('should estimate correctly for longer texts', () => {
      const text = 'word '.repeat(1000);
      const time = estimateReadingTime(text);
      expect(time).toBeGreaterThanOrEqual(4);
    });

    it('should handle empty text', () => {
      const time = estimateReadingTime('');
      expect(time).toBe(1);
    });
  });

  describe('autoTag', () => {
    it('should tag technology content', () => {
      const tags = autoTag('AI Article', 'This is about machine learning and algorithms');
      expect(tags).toContain('Technology');
    });

    it('should tag science content', () => {
      const tags = autoTag('Research Paper', 'A study on physics and chemistry experiments');
      expect(tags).toContain('Science');
    });

    it('should tag business content', () => {
      const tags = autoTag('Market Report', 'The startup raised funding for their new venture');
      expect(tags).toContain('Business');
    });

    it('should tag health content', () => {
      const tags = autoTag('Health Tips', 'Medical advice for wellness and fitness');
      expect(tags).toContain('Health');
    });

    it('should tag entertainment content', () => {
      const tags = autoTag('Movie Review', 'A great film with amazing actors');
      expect(tags).toContain('Entertainment');
    });

    it('should return General for unknown content', () => {
      const tags = autoTag('Random Title', 'xyz abc 123');
      expect(tags).toContain('General');
    });

    it('should handle multiple categories', () => {
      const tags = autoTag('Tech Health', 'AI in medical research and healthcare technology');
      expect(tags.length).toBeGreaterThan(1);
    });

    it('should be case insensitive', () => {
      const tags1 = autoTag('TECH', 'SOFTWARE AND AI');
      const tags2 = autoTag('tech', 'software and ai');
      expect(tags1).toEqual(tags2);
    });
  });

  describe('Database Operations', () => {
    it('should have database functions defined', () => {
      expect(typeof db.getUserDocuments).toBe('function');
      expect(typeof db.getDocumentById).toBe('function');
      expect(typeof db.createDocument).toBe('function');
      expect(typeof db.updateDocument).toBe('function');
      expect(typeof db.deleteDocument).toBe('function');
    });

    it('should have highlight functions defined', () => {
      expect(typeof db.getDocumentHighlights).toBe('function');
      expect(typeof db.createHighlight).toBe('function');
      expect(typeof db.deleteHighlight).toBe('function');
    });

    it('should have note functions defined', () => {
      expect(typeof db.getDocumentNotes).toBe('function');
      expect(typeof db.createNote).toBe('function');
      expect(typeof db.updateNote).toBe('function');
      expect(typeof db.deleteNote).toBe('function');
    });

    it('should have tag functions defined', () => {
      expect(typeof db.getUserTags).toBe('function');
      expect(typeof db.createTag).toBe('function');
      expect(typeof db.deleteTag).toBe('function');
    });
  });
});
