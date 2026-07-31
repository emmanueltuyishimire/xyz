import React from 'react';

/**
 * ResultsPanel.tsx
 * Displays structured calculation results with high visual contrast.
 * Features:
 * - Highlights the primary key value with large, bold text
 * - Emphasizes success vs warnings clearly
 * - Uses role="region" with aria-live="polite" to notify screen readers of updates
 */

interface ResultsPanelProps {
  title?: string;
  primaryValue: string | React.ReactNode;
  primaryLabel: string;
  children?: React.ReactNode;
  variant?: 'success' | 'info' | 'warning';
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  title = 'Your Calculation Results',
  primaryValue,
  primaryLabel,
  children,
  variant = 'success',
}) => {
  return (
    <div 
      className={`results-panel results-panel--${variant}`}
      role="region" 
      aria-live="polite"
      aria-label={title}
    >
      <h3 className="results-panel-title">{title}</h3>
      
      <div className="results-highlight-box">
        <span className="results-highlight-label">{primaryLabel}</span>
        <div className="results-highlight-value">{primaryValue}</div>
      </div>

      {children && (
        <div className="results-additional-details">
          {children}
        </div>
      )}
    </div>
  );
};
