import React, { useState, useEffect, useRef, useCallback } from 'react';
import { top200words } from '../data/top200words';
import { top1000words } from '../data/top1000words';
import { top10000words } from '../data/top10000words';
import { mixedCaseWords } from '../data/mixedCase';
import { numbersAndSymbols } from '../data/numbersAndSymbols';
import { allCharacters } from '../data/allCharacters';
import { paragraphs } from '../data/paragraphs';
import { codeSnippets } from '../data/codeSnippets';
import { saveTestResults } from '../utils/localStorage';
import { calculateWPM, calculateAccuracy, generateWeightedTest } from '../utils/testUtils';
import '../styles/TypingTest.css';

const TypingTest = () => {
  // Test configuration
  const [testMode, setTestMode] = useState('time'); // 'time', 'words', 'quote'
  const [timeLimit, setTimeLimit] = useState(60);
  const [wordCount, setWordCount] = useState(50);
  const [dataset, setDataset] = useState('top200');
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);

  // Test state
  const [testText, setTestText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  
  // Statistics
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [allErrors, setAllErrors] = useState([]);

  // Refs
  const inputRef = useRef(null);
  const textDisplayRef = useRef(null);
  const caretRef = useRef(null);

  // Dataset options
  const datasets = {
    'top200': { data: top200words, name: 'Top 200 Words' },
    'top1000': { data: top1000words, name: 'Top 1000 Words' },
    'top10000': { data: top10000words, name: 'Top 10000 Words' },
    'mixed': { data: mixedCaseWords, name: 'Mixed Case' },
    'numbers': { data: numbersAndSymbols, name: 'Numbers & Symbols' },
    'all': { data: allCharacters, name: 'All Characters' },
    'paragraphs': { data: paragraphs, name: 'Paragraphs' },
    'code': { data: codeSnippets, name: 'Code Snippets' },
    'weighted': { data: 'weighted', name: 'Weighted Classification' }
  };

  // Generate test text
  const generateTestText = useCallback(() => {
    // Handle weighted classification
    if (dataset === 'weighted') {
      const wordsNeeded = Math.max(100, (timeLimit / 60) * 80);
      const weightedWords = generateWeightedTest(wordsNeeded);
      return weightedWords;
    }
    
    const currentDataset = datasets[dataset]?.data || datasets.top200.data;
    let text = '';
    
    // Handle paragraphs and code snippets differently
    if (currentDataset === paragraphs || currentDataset === codeSnippets) {
      // For paragraphs and code, select random items and join them
      const shuffled = [...currentDataset].sort(() => Math.random() - 0.5);
      const itemsNeeded = Math.max(1, Math.ceil((timeLimit / 60) * 2)); // 2 paragraphs per minute
      const selectedItems = shuffled.slice(0, itemsNeeded);
      text = selectedItems.join(' ');
    } else {
      // For word-based datasets, generate enough words to last the entire test duration
      if (testMode === 'time') {
        const wordsNeeded = Math.max(100, (timeLimit / 60) * 80);
        const shuffled = [];
        
        while (shuffled.length < wordsNeeded) {
          const batch = [...currentDataset].sort(() => Math.random() - 0.5);
          shuffled.push(...batch);
        }
        
        text = shuffled.slice(0, wordsNeeded).join(' ');
      } else if (testMode === 'words') {
        const shuffled = [];
        
        while (shuffled.length < wordCount) {
          const batch = [...currentDataset].sort(() => Math.random() - 0.5);
          shuffled.push(...batch);
        }
        
        text = shuffled.slice(0, wordCount).join(' ');
      }
    }

    // Add punctuation if enabled
    if (punctuation) {
      text = addPunctuation(text);
    }

    // Add numbers if enabled
    if (numbers) {
      text = addNumbers(text);
    }

    return text;
  }, [testMode, timeLimit, wordCount, dataset, punctuation, numbers]);

  const addPunctuation = (text) => {
    const punctuationMarks = ['.', ',', '!', '?', ';', ':'];
    const words = text.split(' ');
    
    return words.map((word, index) => {
      if (Math.random() < 0.1 && index < words.length - 1) {
        return word + punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
      }
      return word;
    }).join(' ');
  };

  const addNumbers = (text) => {
    const words = text.split(' ');
    
    return words.map(word => {
      if (Math.random() < 0.05) {
        return Math.floor(Math.random() * 1000).toString();
      }
      return word;
    }).join(' ');
  };

  // Initialize test
  const initializeTest = useCallback(() => {
    const newText = generateTestText();
    setTestText(newText);
    setCurrentIndex(0);
    setUserInput('');
    setIsTestActive(false);
    setIsTestComplete(false);
    setStartTime(null);
    setEndTime(null);
    setTimeLeft(timeLimit);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setCorrectChars(0);
    setTotalChars(0);
    setAllErrors([]);
  }, [generateTestText, timeLimit]);

  // Initialize test on mount and when settings change
  useEffect(() => {
    initializeTest();
  }, [initializeTest]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isTestActive && testMode === 'time' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTestActive, testMode, timeLeft]);

  // Calculate statistics (accuracy only during test, WPM calculated at end)
  const calculateStats = useCallback(() => {
    if (!startTime) return;
    
    // Only calculate accuracy during the test, WPM will be calculated at the end
    const currentAccuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    
    setAccuracy(currentAccuracy);
  }, [correctChars, totalChars]);

  // Update statistics in real-time
  useEffect(() => {
    if (isTestActive) {
      calculateStats();
    }
  }, [isTestActive, correctChars, totalChars, calculateStats]);

  // Handle input change
  const handleInputChange = (e) => {
    const prevInput = userInput;
    const value = e.target.value;
    
    // Start test on first keystroke
    if (!isTestActive && !isTestComplete) {
      setIsTestActive(true);
      setStartTime(Date.now());
    }
    
    // Prevent typing beyond test text
    if (value.length > testText.length) return;
    
    setUserInput(value);
    
    // Calculate the correct cursor position based on word progress
    const targetWords = testText.split(' ');
    const typedWords = value.split(' ');
    const prevTypedWords = prevInput.split(' ');
    const spacesTyped = (value.match(/ /g) || []).length;
    const currentWordIndex = spacesTyped;
    
    // Calculate position in the target text where cursor should be
    let cursorPosition = 0;
    
    // Add lengths of all completed words plus their spaces
    for (let i = 0; i < currentWordIndex && i < targetWords.length; i++) {
      cursorPosition += targetWords[i].length + 1; // +1 for space
    }
    
    // Add the length of the current word being typed
    if (currentWordIndex < targetWords.length && currentWordIndex < typedWords.length) {
      const currentTypedWord = typedWords[currentWordIndex] || '';
      cursorPosition += currentTypedWord.length;
    }
    
    setCurrentIndex(cursorPosition);
    
    // Track errors for detailed analysis
    
    // Check if a word was just completed (space was added)
    const justCompletedWord = value.endsWith(' ') && !prevInput.endsWith(' ');
    
    if (justCompletedWord && prevTypedWords.length > 0) {
      const completedWordIndex = prevTypedWords.length - 1;
      const completedTypedWord = prevTypedWords[completedWordIndex];
      const completedTargetWord = targetWords[completedWordIndex];
      
      // Add to allErrors if the completed word was incorrect
      if (completedTargetWord && completedTypedWord && 
          completedTypedWord !== completedTargetWord) {
        const newError = {
          expected: completedTargetWord,
          typed: completedTypedWord,
          position: completedWordIndex
        };
        
        setAllErrors(prev => [...prev, newError]);
      }
    }
    
    // Calculate statistics - simple character by character comparison
    let correct = 0;
    let total = value.length;
    let errorCount = 0;
    
    for (let i = 0; i < value.length; i++) {
      if (value[i] === testText[i]) {
        correct++;
      } else {
        errorCount++;
      }
    }
    
    setCorrectChars(correct);
    setTotalChars(total);
    setErrors(errorCount);
    
    // Check if test is complete
    if (testMode === 'words' && value.length === testText.length) {
      completeTest();
    }
  };

  // Complete test
  const completeTest = useCallback(() => {
    setIsTestActive(false);
    setIsTestComplete(true);
    // Use the exact time limit instead of current time to avoid timing discrepancies
    setEndTime(startTime + (timeLimit * 1000));
  }, [startTime, timeLimit]);

  // Handle completion logic when completed state changes
  useEffect(() => {
    if (isTestComplete && !endTime) return;
    
    if (isTestComplete && endTime) {
      // Use the actual time limit for time-based tests, actual elapsed time for word-based tests
      const actualTimeInSeconds = testMode === 'time' ? timeLimit : (endTime - startTime) / 1000;
      const finalWpm = calculateWPM(userInput, actualTimeInSeconds);
      const finalAccuracy = calculateAccuracy(allErrors, testText);
      
      // Update the WPM state for display
      setWpm(finalWpm);
      
      // Save test results with profile integration
      saveTestResults({
        words: testText,
        typed: userInput,
        errors: allErrors,
        timeLimit: testMode === 'time' ? timeLimit : null,
        wordCount: testMode === 'words' ? wordCount : null,
        dataset: dataset,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        timestamp: new Date(),
        testMode: testMode,
        punctuation: punctuation,
        numbers: numbers
      });
    }
  }, [isTestComplete, endTime, userInput, startTime, allErrors, testText, timeLimit, wordCount, dataset, testMode, punctuation, numbers]);

  // Restart test
  const restartTest = () => {
    initializeTest();
    inputRef.current?.focus();
  };

  // Focus input when clicking on text
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Render words with proper wrapping
  const renderText = () => {
    const targetWords = testText.split(' ');
    const typedWords = userInput.split(' ');
    const spacesTyped = (userInput.match(/ /g) || []).length;
    const currentTypedWordIndex = spacesTyped;
    
    return targetWords.map((word, wordIndex) => {
      const isCurrentWord = wordIndex === currentTypedWordIndex;
      const isCompletedWord = wordIndex < currentTypedWordIndex;
      const isFutureWord = wordIndex > currentTypedWordIndex;
      
      let wordClassName = 'word';
      
      // Determine word styling
      if (isCompletedWord) {
        const typedWord = typedWords[wordIndex] || '';
        if (typedWord === word) {
          wordClassName += ' correct-word';
        } else {
          wordClassName += ' incorrect-word';
        }
      }
      
      // Render individual characters in the word
      const wordChars = word.split('').map((char, charIndex) => {
        let className = 'char';
        
        if (isCompletedWord) {
          const typedWord = typedWords[wordIndex] || '';
          if (typedWord === word) {
            className += ' correct';
          } else {
            className += ' incorrect';
          }
        } else if (isCurrentWord) {
          const currentTypedWord = typedWords[wordIndex] || '';
          
          if (charIndex < currentTypedWord.length) {
            if (currentTypedWord[charIndex] === char) {
              className += ' correct';
            } else {
              className += ' incorrect';
            }
          } else if (charIndex === currentTypedWord.length) {
            className += ' current';
          }
        } else if (isFutureWord) {
          // Future words remain neutral
          if (wordIndex === currentTypedWordIndex && charIndex === 0) {
            className += ' current';
          }
        }
        
        return (
          <span key={`${wordIndex}-${charIndex}`} className={className}>
            {char}
          </span>
        );
      });
      
      // Add space after word (except for last word)
      const spaceElement = wordIndex < targetWords.length - 1 ? (
        <span key={`${wordIndex}-space`} className={`char${isCompletedWord ? ' correct' : ''}`}>
          {'\u00A0'}
        </span>
      ) : null;
      
      return (
        <span key={wordIndex} className={wordClassName}>
          {wordChars}
          {spaceElement}
        </span>
      );
    });
  };

  return (
    <div className="typing-test">
      {/* Test Configuration */}
      <div className="test-config">
        <div className="config-group">
          <div className="config-buttons">
            <button 
              className={testMode === 'time' ? 'active' : ''}
              onClick={() => setTestMode('time')}
            >
              time
            </button>
            <button 
              className={testMode === 'words' ? 'active' : ''}
              onClick={() => setTestMode('words')}
            >
              words
            </button>
          </div>
        </div>

        {testMode === 'time' && (
          <div className="config-group">
            <div className="config-buttons">
              {[15, 30, 60, 120].map(time => (
                <button
                  key={time}
                  className={timeLimit === time ? 'active' : ''}
                  onClick={() => setTimeLimit(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {testMode === 'words' && (
          <div className="config-group">
            <div className="config-buttons">
              {[10, 25, 50, 100].map(count => (
                <button
                  key={count}
                  className={wordCount === count ? 'active' : ''}
                  onClick={() => setWordCount(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="config-group">
          <select 
            value={dataset} 
            onChange={(e) => setDataset(e.target.value)}
            className="dataset-select"
          >
            {Object.entries(datasets).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>

        <div className="config-group">
          <div className="config-buttons">
            <button
              className={punctuation ? 'active' : ''}
              onClick={() => setPunctuation(!punctuation)}
            >
              punctuation
            </button>
            <button
              className={numbers ? 'active' : ''}
              onClick={() => setNumbers(!numbers)}
            >
              numbers
            </button>
          </div>
        </div>
      </div>

      {/* Test Stats - Show timer from the start */}
      {!isTestComplete && (
        <div className="test-stats">
          {testMode === 'time' && (
            <div className="stat">
              <div className="stat-value">{timeLeft}</div>
              <div className="stat-label">time</div>
            </div>
          )}
          {testMode === 'words' && isTestActive && (
            <div className="stat">
              <div className="stat-value">{Math.floor((Date.now() - startTime) / 1000)}s</div>
              <div className="stat-label">time</div>
            </div>
          )}
        </div>
      )}

      {/* Test Text Display */}
      <div 
        className="text-display" 
        onClick={focusInput}
        ref={textDisplayRef}
      >
        <div className="text-content">
          {renderText()}
        </div>
      </div>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        className="hidden-input"
        disabled={isTestComplete}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Results */}
      {isTestComplete && (
        <div className="results">
          <div className="results-stats">
            <div className="result-stat">
              <div className="result-value">{wpm}</div>
              <div className="result-label">wpm</div>
            </div>
            <div className="result-stat">
              <div className="result-value">{accuracy}%</div>
              <div className="result-label">acc</div>
            </div>
            <div className="result-stat">
              <div className="result-value">{testMode === 'time' ? timeLimit : Math.round((endTime - startTime) / 1000)}s</div>
              <div className="result-label">time</div>
            </div>
            <div className="result-stat">
              <div className="result-value">{allErrors.length}</div>
              <div className="result-label">errors</div>
            </div>
          </div>
          
          {/* Error Details */}
          {allErrors.length > 0 && (
            <div className="error-details">
              <h3>Errors Made:</h3>
              <div className="error-list">
                {allErrors.map((error, index) => (
                  <div key={index} className="error-item">
                    <span className="error-expected">{error.expected}</span>
                    <span className="error-arrow">→</span>
                    <span className="error-typed">{error.typed}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button className="restart-button" onClick={restartTest}>
            <span>↻</span> restart test
          </button>
        </div>
      )}

    </div>
  );
};

export default TypingTest;
