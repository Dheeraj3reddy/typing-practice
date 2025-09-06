// src/components/Statistics.js
import React, { useState } from 'react';
import { getTestResults } from '../utils/localStorage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../styles/Statistics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [errorAnalysisTab, setErrorAnalysisTab] = useState('7');
  const [expandedWord, setExpandedWord] = useState(null);
  const results = getTestResults();

  const getFilteredResults = (days) => {
    if (days === 'all') return results;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    return results.filter(result => {
      const resultDate = new Date(result.timestamp);
      return resultDate >= cutoffDate;
    });
  };

  const getTopErrors = (days) => {
    const filteredResults = getFilteredResults(days);
    const errorCounts = {};
    
    filteredResults.forEach(result => {
      if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach(error => {
          // Handle both old and new error formats with better fallbacks
          const expected = error.expected || error.word || 'unknown word';
          // Group errors by the original (expected) word only
          const errorKey = expected;
          errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;
        });
      }
    });
    
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  };

  const getWordErrorDetails = (word, days) => {
    const filteredResults = getFilteredResults(days);
    const typedVariations = {};
    
    filteredResults.forEach(result => {
      if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach(error => {
          const expected = error.expected || error.word || 'unknown word';
          const typed = error.typed || error.input || 'no input';
          
          if (expected === word) {
            typedVariations[typed] = (typedVariations[typed] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(typedVariations)
      .sort(([,a], [,b]) => b - a)
      .map(([typed, count]) => ({ typed, count }));
  };

  const getWPMChartData = () => {
    if (results.length === 0) return null;

    const sortedResults = [...results].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return {
      labels: sortedResults.map((_, index) => `Test ${index + 1}`),
      datasets: [
        {
          label: 'WPM',
          data: sortedResults.map(result => Math.round(result.wpm || 0)),
          borderColor: '#e2b714',
          backgroundColor: 'rgba(226, 183, 20, 0.1)',
          tension: 0.4,
          pointBackgroundColor: '#e2b714',
          pointBorderColor: '#e2b714',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const getErrorRateChartData = () => {
    if (results.length === 0) return null;

    const sortedResults = [...results].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return {
      labels: sortedResults.map((_, index) => `Test ${index + 1}`),
      datasets: [
        {
          label: 'Error Rate (%)',
          data: sortedResults.map(result => {
            const totalWords = result.words ? result.words.split(' ').length : 0;
            const errorCount = result.errors ? result.errors.length : 0;
            return totalWords > 0 ? Math.round((errorCount / totalWords) * 100 * 100) / 100 : 0;
          }),
          borderColor: '#ca4754',
          backgroundColor: 'rgba(202, 71, 84, 0.1)',
          tension: 0.4,
          pointBackgroundColor: '#ca4754',
          pointBorderColor: '#ca4754',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#d1d0c5',
          font: {
            family: 'Roboto Mono',
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#646669',
          font: {
            family: 'Roboto Mono',
          },
        },
        grid: {
          color: 'rgba(100, 102, 105, 0.2)',
        },
      },
      y: {
        ticks: {
          color: '#646669',
          font: {
            family: 'Roboto Mono',
          },
        },
        grid: {
          color: 'rgba(100, 102, 105, 0.2)',
        },
      },
    },
  };

  const renderHistory = () => {
    // Sort results to show latest first
    const sortedResults = [...results].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return (
      <div className="stats-grid">
        {results.length === 0 ? (
          <div className="no-data">No typing tests completed yet. Start typing to see your statistics!</div>
        ) : (
          sortedResults.map((result, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-metric">
                  <span className="stat-label">WPM:</span>
                  <span className="stat-value">{Math.round(result.wpm || 0)}</span>
                </div>
                <div className="stat-metric">
                  <span className="stat-label">Accuracy:</span>
                  <span className="stat-value">{Math.round(result.accuracy || 0)}%</span>
                </div>
                <div className="stat-date">
                  {new Date(result.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {result.errors && result.errors.length > 0 && (
                <div className="error-details">
                  <h4>Errors ({result.errors.length}):</h4>
                  <div className="error-list-stats">
                    {result.errors.slice(0, 5).map((error, errorIndex) => (
                      <div key={errorIndex} className="error-item-stats">
                        <span className="expected">"{error.expected || error.word || 'unknown'}"</span>
                        <span className="arrow">→</span>
                        <span className="typed">"{error.typed || error.input || 'no input'}"</span>
                      </div>
                    ))}
                    {result.errors.length > 5 && (
                      <div className="more-errors">+{result.errors.length - 5} more errors</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderTopErrors = () => {
    const topErrors = getTopErrors(errorAnalysisTab);
    const testsInPeriod = getFilteredResults(errorAnalysisTab).length;
    
    return (
      <div className="top-errors-section">
        <div className="error-analysis-tabs">
          <button 
            className={errorAnalysisTab === '7' ? 'active' : ''}
            onClick={() => setErrorAnalysisTab('7')}
          >
            7 Days
          </button>
          <button 
            className={errorAnalysisTab === '30' ? 'active' : ''}
            onClick={() => setErrorAnalysisTab('30')}
          >
            30 Days
          </button>
          <button 
            className={errorAnalysisTab === '90' ? 'active' : ''}
            onClick={() => setErrorAnalysisTab('90')}
          >
            90 Days
          </button>
          <button 
            className={errorAnalysisTab === 'all' ? 'active' : ''}
            onClick={() => setErrorAnalysisTab('all')}
          >
            All Time
          </button>
        </div>

        <div className="error-period-content">
          <div className="period-summary">
            <h3>
              {errorAnalysisTab === 'all' ? 'All Time' : `Past ${errorAnalysisTab} Days`} 
              <span className="test-count">({testsInPeriod} tests)</span>
            </h3>
          </div>
          
          {topErrors.length === 0 ? (
            <div className="no-errors">No errors in this period</div>
          ) : (
            <div className="top-errors-list">
              {topErrors.map(({ word, count }, index) => {
                const isExpanded = expandedWord === word;
                const errorDetails = isExpanded ? getWordErrorDetails(word, errorAnalysisTab) : [];
                
                return (
                  <div key={index} className="top-error-item-container">
                    <div 
                      className={`top-error-item ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => setExpandedWord(isExpanded ? null : word)}
                    >
                      <span className="error-rank">#{index + 1}</span>
                      <span className="error-text">"{word}"</span>
                      <span className="error-count">{count} times</span>
                      <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                    
                    {isExpanded && (
                      <div className="error-details-breakdown">
                        <h4>What you typed instead:</h4>
                        <div className="typed-variations">
                          {errorDetails.map(({ typed, count: typedCount }, detailIndex) => (
                            <div key={detailIndex} className="typed-variation">
                              <span className="variation-text">"{typed}"</span>
                              <span className="variation-count">{typedCount} times</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    const wpmData = getWPMChartData();
    const errorData = getErrorRateChartData();

    if (!wpmData || !errorData) {
      return (
        <div className="no-data">
          Complete at least 2 typing tests to see progress charts!
        </div>
      );
    }

    return (
      <div className="charts-container">
        <div className="chart-section">
          <h3>Words Per Minute Progress</h3>
          <div className="chart-wrapper">
            <Line data={wpmData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-section">
          <h3>Error Rate Progress</h3>
          <div className="chart-wrapper">
            <Line data={errorData} options={chartOptions} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="statistics">
      <div className="stats-tabs">
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Test History
        </button>
        <button 
          className={activeTab === 'errors' ? 'active' : ''}
          onClick={() => setActiveTab('errors')}
        >
          Error Analysis
        </button>
        <button 
          className={activeTab === 'charts' ? 'active' : ''}
          onClick={() => setActiveTab('charts')}
        >
          Progress Charts
        </button>
      </div>

      {activeTab === 'history' && (
        <div className="tab-content">
          <h2>Your Typing History</h2>
          {renderHistory()}
        </div>
      )}

      {activeTab === 'errors' && (
        <div className="tab-content">
          <h2>Most Common Errors</h2>
          {renderTopErrors()}
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="tab-content">
          <h2>Progress Over Time</h2>
          {renderCharts()}
        </div>
      )}
    </div>
  );
};

export default Statistics;
