/**
 * Input Sanitization Utilities
 * Provides safe input cleaning for user-generated content
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes user input by removing all HTML tags and attributes
 * Used for dashboard names, widget titles, and other text inputs
 */
export const sanitizeUserInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove all HTML tags and attributes, keeping only plain text
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  }).trim();
};

/**
 * Sanitizes text content that may contain basic formatting
 * Allows limited HTML tags for widget descriptions
 */
export const sanitizeTextContent = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Allow only safe formatting tags
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  }).trim();
};

/**
 * Validates and sanitizes dashboard/widget names
 * Ensures names are safe and within length limits
 */
export const sanitizeName = (name: string, maxLength: number = 100): string => {
  const sanitized = sanitizeUserInput(name);
  
  // Ensure name is not empty after sanitization
  if (!sanitized) {
    throw new Error('Name cannot be empty');
  }

  // Check length limit
  if (sanitized.length > maxLength) {
    throw new Error(`Name cannot exceed ${maxLength} characters`);
  }

  return sanitized;
};

/**
 * Sanitizes URL-safe strings (for slugs, IDs, etc.)
 * Removes special characters that could cause routing issues
 */
export const sanitizeUrlSafe = (input: string): string => {
  return sanitizeUserInput(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Only allow letters, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};