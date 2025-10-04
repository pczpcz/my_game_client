import React from 'react';
import './ExperienceBar.css';

const ExperienceBar = ({ 
  currentExp, 
  maxExp, 
  level = 1,
  showLevel = true,
  showNumbers = true 
}) => {
  const expPercentage = Math.max(0, Math.min(100, (currentExp / maxExp) * 100));
  
  return (
    <div className="experience-bar">
      {showLevel && (
        <div className="level-display">
          <span className="level-text">Lv.{level}</span>
        </div>
      )}
      <div className="exp-bar-container">
        {showNumbers && (
          <div className="exp-numbers">
            {currentExp} / {maxExp}
          </div>
        )}
        <div className="exp-bar-background">
          <div 
            className="exp-bar-fill"
            style={{
              width: `${expPercentage}%`
            }}
          />
          <div className="exp-bar-glow" />
        </div>
      </div>
    </div>
  );
};

export default ExperienceBar;
