"use client";

import React from 'react';
import './MobileHeader.css';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <header className="mobile-header">
            <div className="mobile-header-logo">Job Hunter Pro</div>
            <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
                ☰
            </button>
        </header>
    );
}
