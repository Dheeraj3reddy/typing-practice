import React from 'react';

const ErrorList = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="error-list">
      <h3>Errors ({errors.length})</h3>
      <div className="error-list-container">
        {errors.map((error, index) => (
          <div key={index} className="error-item-stats">
            <span className="expected">"{error.expected || error.word}"</span>
            <span className="arrow">→</span>
            <span className="typed">"{error.typed}"</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorList;
