'use client';

import { useState, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial theme
        const theme = localStorage.getItem('theme') || 'light';
        setIsDark(theme === 'dark');
        document.documentElement.setAttribute('data-theme', theme);
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setIsDark(!isDark);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title-section">
                    <h2 className="header-title">{title}</h2>
                    {subtitle && <p className="header-subtitle">{subtitle}</p>}
                </div>

                <div className="header-actions">
                    <button
                        className="btn btn-icon btn-ghost"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    <button className="btn btn-icon btn-ghost" aria-label="Notifications">
                        🔔
                    </button>

                    <button className="btn btn-icon btn-ghost" aria-label="Settings">
                        ⚙️
                    </button>
                </div>
            </div>
        </header>
    );
}
