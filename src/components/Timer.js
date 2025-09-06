// src/components/Timer.js
import React, { useState, useEffect, useRef } from 'react';

const Timer = ({ timeLimit, isActive, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const onCompleteRef = useRef(onComplete);

  // Keep the onComplete reference up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset timer when timeLimit changes
  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  // Main timer effect
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            onCompleteRef.current();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  return (
    <div className="timer">
      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
    </div>
  );
};

export default Timer;
