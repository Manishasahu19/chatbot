
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const availableThemes = ['theme-light', 'theme-dark', 'theme-blue'];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('theme-light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && availableThemes.includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};