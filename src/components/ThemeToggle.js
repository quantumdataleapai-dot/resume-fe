import React from "react";
import { useTheme } from "../utils/ThemeContext";
import "../styles/ThemeToggle.css";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${isDark ? "theme-toggle--dark" : ""}`}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <div className="tg-wrapper">
        {/* Twinkling stars — dark mode only */}
        <span className="tg-star tg-star--1" />
        <span className="tg-star tg-star--2" />
        <span className="tg-star tg-star--3" />

        <svg className="tg-svg" viewBox="0 0 24 24" width="26" height="26">
          {/* Sun — warm circle + rays */}
          <g className="tg-sun">
            <circle cx="12" cy="12" r="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                className="tg-sun-ray"
                x1="12" y1="3.5" x2="12" y2="1.5"
                stroke="#fbbf24"
                strokeWidth="1.8"
                strokeLinecap="round"
                transform={`rotate(${angle} 12 12)`}
              />
            ))}
          </g>

          {/* Crescent moon — circle with a cutout overlay */}
          <g className="tg-moon">
            <circle cx="12" cy="12" r="6.5" fill="#e2e8f0" />
            <circle cx="16" cy="9" r="5.5" fill="var(--tg-moon-mask, #0f172a)" />
          </g>
        </svg>
      </div>
    </button>
  );
}
