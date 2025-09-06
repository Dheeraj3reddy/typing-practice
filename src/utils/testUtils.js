// src/utils/testUtils.js
import { generateWeightedWordSequence, getWordDistributionStats } from '../data/weightedWords';

export const calculateWPM = (typedText, timeInSeconds) => {
  // Standard WPM calculation: (characters typed / 5) / minutes
  // This accounts for all characters typed, not just complete words
  const charactersTyped = typedText.length;
  const minutes = timeInSeconds / 60;
  const wordsTyped = charactersTyped / 5; // Standard: 5 characters = 1 word
  return Math.round(wordsTyped / minutes) || 0;
};

export const calculateAccuracy = (errors, totalWords) => {
  const totalWordCount = totalWords.split(' ').length;
  const errorCount = errors.length;
  return Math.round(((totalWordCount - errorCount) / totalWordCount) * 100);
};

// Generate words for weighted classification test
export const generateWeightedTest = (wordCount = 50) => {
  const words = generateWeightedWordSequence(wordCount);
  return words.join(' ');
};

// Get test statistics for weighted words
export const getTestStats = (words) => {
  const wordArray = words.split(' ');
  return getWordDistributionStats(wordArray);
};

// Test type configurations
export const testTypes = {
  weighted: {
    name: 'Weighted Classification',
    description: 'Top 200: 45%, Top 1000: 30%, Top 10000: 15%, Mixed Case: 5%, Special: 5%',
    generator: generateWeightedTest
  }
};
