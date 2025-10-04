import React from 'react';
import './SkillBar.css';

const SkillBar = ({ 
  skills = [], 
  onSkillClick,
  activeSkill = null,
  cooldowns = {},
  showCooldown = true 
}) => {
  const handleSkillClick = (skill, index) => {
    if (onSkillClick && (!cooldowns[index] || cooldowns[index] <= 0)) {
      onSkillClick(skill, index);
    }
  };

  const getSkillCooldown = (index) => {
    return cooldowns[index] || 0;
  };

  return (
    <div className="skill-bar">
      {skills.map((skill, index) => {
        const cooldown = getSkillCooldown(index);
        const isOnCooldown = cooldown > 0;
        const isActive = activeSkill === index;

        return (
          <div
            key={index}
            className={`skill-slot ${isActive ? 'active' : ''} ${isOnCooldown ? 'cooldown' : ''}`}
            onClick={() => handleSkillClick(skill, index)}
            title={skill.name}
          >
            <div className="skill-icon">
              {skill.icon || skill.name.charAt(0)}
            </div>
            {skill.keybind && (
              <div className="skill-keybind">{skill.keybind}</div>
            )}
            {showCooldown && isOnCooldown && (
              <div className="skill-cooldown">
                <div className="cooldown-overlay" />
                <div className="cooldown-text">{cooldown}s</div>
              </div>
            )}
            {skill.manaCost && (
              <div className="skill-mana-cost">{skill.manaCost}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SkillBar;
