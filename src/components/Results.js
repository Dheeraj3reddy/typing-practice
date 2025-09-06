// src/components/Results.js
import React from 'react';
import ErrorList from './ErrorList';
import { calculateWPM, calculateAccuracy } from '../utils/testUtils';

const Results = ({ errors, words, timeLimit, typedText, onRestart }) => {
  const wpm = calculateWPM(typedText || '', timeLimit);
  const accuracy = calculateAccuracy(errors, words);

  return (
    <div className="results">
      <div className="results-summary">
        <div>
          <h3>WPM</h3>
          <p>{Math.round(wpm)}</p>
        </div>
        <div>
          <h3>Accuracy</h3>
          <p>{accuracy}%</p>
        </div>
        <div>
          <h3>Errors</h3>
          <p>{errors.length}</p>
        </div>
      </div>
      <ErrorList errors={errors} />
      <button onClick={onRestart} className="restart-button">
        Try Again
      </button>
    </div>
  );
};

export default Results;
