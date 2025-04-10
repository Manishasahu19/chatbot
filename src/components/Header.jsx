import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function Header({ userName }) {
  const { theme, setTheme } = useContext(ThemeContext);

  const handleThemeChange = (e) => {
    setTheme('theme-' + e.target.value);
  };

  return (
    <div className="header">
      <div className="logo">🤖 AI ChatBot</div>

      <div className="user-section">
        <select value={theme.replace('theme-', '')} onChange={handleThemeChange} className="theme-selector">
          <option value="light">🌞 Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="blue">💠 Blue</option>
        </select>

        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff&rounded=true&size=40`}
          alt="User Avatar"
          className="avatar"
        />
        <span className="greeting">Hi, {userName}</span>
      </div>
    </div>
  );
}

export default Header;
