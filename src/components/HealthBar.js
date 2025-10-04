import React from 'react';
import './HealthBar.css';

const HealthBar = ({ currentHealth, maxHealth, showNumbers = true, size = 'medium' }) => {
  const healthPercentage = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
  
  const getHealthColor = () => {
    if (healthPercentage > 70) return '#4CAF50'; // 绿色
    if (healthPercentage > 30) return '#FF9800'; // 橙色
    return '#F44336'; // 红色
  };

  return (
    <div className={`health-bar ${size}`}>
      {showNumbers && (
        <div className="health-numbers">
          {currentHealth} / {maxHealth}
        </div>
      )}
      <div className="health-bar-background">
        <div 
          className="health-bar-fill"
          style={{
            width: `${healthPercentage}%`,
            backgroundColor: getHealthColor()
          }}
        />
      </div>
    </div>
  );
};

export default HealthBar;
