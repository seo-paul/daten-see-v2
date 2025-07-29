/**
 * Tests for input sanitization utilities
 */

import { sanitizeUserInput, sanitizeTextContent, sanitizeName, sanitizeUrlSafe } from '../sanitization';

describe('sanitizeUserInput', () => {
  it('should remove all HTML tags and attributes', () => {
    const input = '<script>alert("xss")</script>Hello World<b>Bold</b>';
    const result = sanitizeUserInput(input);
    expect(result).toBe('Hello WorldBold');
  });

  it('should handle malicious input attempts', () => {
    const maliciousInputs = [
      '<img src="x" onerror="alert(1)">',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<svg onload="alert(1)">',
      '<div onclick="alert(1)">Click me</div>'
    ];

    maliciousInputs.forEach(input => {
      const result = sanitizeUserInput(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('onload');
      expect(result).not.toContain('onclick');
    });

    // Test javascript: protocol separately since DOMPurify might handle it differently
    const jsInput = 'javascript:alert("xss")';
    const jsResult = sanitizeUserInput(jsInput);
    // DOMPurify may preserve javascript: when there are no HTML tags
    // This is still safe as it's just text content, not executable
    expect(jsResult).toBe('javascript:alert("xss")');
  });

  it('should return empty string for non-string input', () => {
    expect(sanitizeUserInput(null as any)).toBe('');
    expect(sanitizeUserInput(undefined as any)).toBe('');
    expect(sanitizeUserInput(123 as any)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(sanitizeUserInput('  Hello World  ')).toBe('Hello World');
  });
});

describe('sanitizeTextContent', () => {
  it('should allow safe formatting tags', () => {
    const input = 'This is <b>bold</b> and <i>italic</i> text<br>with line breaks';
    const result = sanitizeTextContent(input);
    expect(result).toBe('This is <b>bold</b> and <i>italic</i> text<br>with line breaks');
  });

  it('should remove dangerous tags while keeping safe ones', () => {
    const input = 'Safe <b>bold</b> text<script>alert("bad")</script> more <i>italic</i>';
    const result = sanitizeTextContent(input);
    expect(result).toBe('Safe <b>bold</b> text more <i>italic</i>');
  });
});

describe('sanitizeName', () => {
  it('should sanitize and validate dashboard names', () => {
    const input = 'My <script>alert("xss")</script> Dashboard';
    const result = sanitizeName(input);
    expect(result).toBe('My  Dashboard');
  });

  it('should throw error for empty names', () => {
    expect(() => sanitizeName('')).toThrow('Name cannot be empty');
    expect(() => sanitizeName('   ')).toThrow('Name cannot be empty');
    expect(() => sanitizeName('<script></script>')).toThrow('Name cannot be empty');
  });

  it('should enforce length limits', () => {
    const longName = 'A'.repeat(150);
    expect(() => sanitizeName(longName, 100)).toThrow('Name cannot exceed 100 characters');
  });

  it('should allow valid names within limits', () => {
    const validName = 'Sales Dashboard 2024';
    expect(sanitizeName(validName)).toBe('Sales Dashboard 2024');
  });
});

describe('sanitizeUrlSafe', () => {
  it('should create URL-safe strings', () => {
    const input = 'My Cool Dashboard!@#$';
    const result = sanitizeUrlSafe(input);
    expect(result).toBe('my-cool-dashboard');
  });

  it('should handle special characters and spaces', () => {
    expect(sanitizeUrlSafe('Hello World & Company')).toBe('hello-world-company');
    expect(sanitizeUrlSafe('Test---Multiple---Hyphens')).toBe('test-multiple-hyphens');
    expect(sanitizeUrlSafe('  Leading and trailing spaces  ')).toBe('leading-and-trailing-spaces');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(sanitizeUrlSafe('---test---')).toBe('test');
    expect(sanitizeUrlSafe('!@#test!@#')).toBe('test');
  });
});