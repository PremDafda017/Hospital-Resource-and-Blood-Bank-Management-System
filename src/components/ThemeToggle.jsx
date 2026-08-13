import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa6';
import './ThemeToggle.css';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button 
      className={`theme-toggle ${theme}`}
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          {theme === 'light' ? <FaSun /> : <FaMoon />}
        </div>
      </div>
    </button>
  );
}

export default ThemeToggle;