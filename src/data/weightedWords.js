// Weighted word selection system for typing tests
import { top200words } from './top200words';
import { top1000words } from './top1000words';
import { top10000words } from './top10000words';
import { mixedCaseWords } from './mixedCase';
import { numbersAndSymbols } from './numbersAndSymbols';

// Test classification with weighted probabilities
export const testClassification = {
  top200: { weight: 45, words: top200words },
  top1000: { weight: 30, words: top1000words },
  top10000: { weight: 15, words: top10000words },
  mixedCase: { weight: 5, words: mixedCaseWords },
  special: { weight: 5, words: numbersAndSymbols }
};

// Generate weighted word list based on classification
export const generateWeightedWords = (totalWords = 100) => {
  const weightedWords = [];
  
  // Calculate number of words for each category
  const categories = Object.entries(testClassification);
  
  categories.forEach(([category, config]) => {
    const wordCount = Math.round((config.weight / 100) * totalWords);
    
    // Add words from this category
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * config.words.length);
      weightedWords.push(config.words[randomIndex]);
    }
  });
  
  // Shuffle the final array to mix categories
  return shuffleArray(weightedWords);
};

// Get a single random word based on weighted probabilities
export const getWeightedRandomWord = () => {
  const random = Math.random() * 100;
  let cumulativeWeight = 0;
  
  const categories = Object.entries(testClassification);
  
  for (const [category, config] of categories) {
    cumulativeWeight += config.weight;
    if (random <= cumulativeWeight) {
      const randomIndex = Math.floor(Math.random() * config.words.length);
      return config.words[randomIndex];
    }
  }
  
  // Fallback to top200 if something goes wrong
  const randomIndex = Math.floor(Math.random() * top200words.length);
  return top200words[randomIndex];
};

// Generate a sequence of weighted words for typing test
export const generateWeightedWordSequence = (wordCount = 50) => {
  const words = [];
  
  for (let i = 0; i < wordCount; i++) {
    words.push(getWeightedRandomWord());
  }
  
  return words;
};

// Utility function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get statistics about word distribution
export const getWordDistributionStats = (words) => {
  const stats = {
    top200: 0,
    top1000: 0,
    top10000: 0,
    mixedCase: 0,
    special: 0,
    unknown: 0
  };
  
  words.forEach(word => {
    if (top200words.includes(word)) {
      stats.top200++;
    } else if (top1000words.includes(word)) {
      stats.top1000++;
    } else if (top10000words.includes(word)) {
      stats.top10000++;
    } else if (mixedCaseWords.includes(word)) {
      stats.mixedCase++;
    } else if (numbersAndSymbols.includes(word)) {
      stats.special++;
    } else {
      stats.unknown++;
    }
  });
  
  return stats;
};

// Export default configuration
export default {
  testClassification,
  generateWeightedWords,
  getWeightedRandomWord,
  generateWeightedWordSequence,
  getWordDistributionStats
};
