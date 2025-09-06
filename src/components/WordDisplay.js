import React, { useEffect, useRef, useState, useMemo } from 'react';

const WordDisplay = ({ words, currentInput }) => {
  const containerRef = useRef(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  
  const targetWords = words.split(' ');
  const typedWords = currentInput.split(' ');
  const currentWordIndex = typedWords.length - 1;
  const isTypingCurrentWord = !currentInput.endsWith(' ');
  
  // Configuration
  const LINES_VISIBLE = 3;
  const LINE_HEIGHT = 60;
  const WORDS_PER_LINE = 12; // Approximate words per line
  
  // Simple line creation - just split words into chunks
  const createLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < targetWords.length; i += WORDS_PER_LINE) {
      const lineWords = targetWords.slice(i, i + WORDS_PER_LINE).map((word, index) => ({
        word,
        index: i + index
      }));
      lines.push(lineWords);
    }
    return lines;
  }, [targetWords]);
  
  // Find which line contains the current word
  const getCurrentLineIndex = () => {
    for (let lineIndex = 0; lineIndex < createLines.length; lineIndex++) {
      const line = createLines[lineIndex];
      for (let wordInLine of line) {
        if (wordInLine.index === currentWordIndex) {
          return lineIndex;
        }
      }
    }
    return 0;
  };
  
  // Update current line when typing progresses
  useEffect(() => {
    const newLineIndex = getCurrentLineIndex();
    setCurrentLineIndex(newLineIndex);
  }, [currentWordIndex]);
  
  // Calculate scroll offset for smooth line transitions
  const scrollOffset = Math.max(0, currentLineIndex - 1) * LINE_HEIGHT;
  
  return (
    <div className="word-display-container" ref={containerRef}>
      <div 
        className="word-display-content"
        style={{
          transform: `translateY(-${scrollOffset}px)`,
          transition: 'transform 0.4s ease-out'
        }}
      >
        {createLines.map((line, lineIndex) => (
          <div 
            key={lineIndex} 
            className={`word-line ${lineIndex === currentLineIndex ? 'current-line' : ''}`}
            style={{ height: `${LINE_HEIGHT}px` }}
          >
            {line.map(({ word: targetWord, index: wordIndex }) => {
              const typedWord = typedWords[wordIndex] || '';
              
              // Determine word status
              let wordStatus = 'untyped';
              let showCursor = false;
              
              if (wordIndex < currentWordIndex) {
                // Completed words (we've moved past them)
                wordStatus = typedWord === targetWord ? 'correct' : 'incorrect';
              } else if (wordIndex === currentWordIndex) {
                if (isTypingCurrentWord) {
                  // Currently typing this word
                  wordStatus = 'current';
                  showCursor = true;
                } else {
                  // Just completed this word (space was pressed)
                  wordStatus = typedWord === targetWord ? 'correct' : 'incorrect';
                  showCursor = true;
                }
              }
              
              return (
                <span key={wordIndex} className={`word ${wordStatus}`}>
                  {targetWord}
                  {showCursor && (
                    <span className="cursor">|</span>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordDisplay;
