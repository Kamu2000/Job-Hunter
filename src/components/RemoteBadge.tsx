import React from 'react';
import './RemoteBadge.css';

interface RemoteBadgeProps {
    type: 'fully-remote' | 'hybrid' | 'timezone-flexible' | 'async';
    size?: 'sm' | 'md' | 'lg';
}

const BADGE_CONFIG = {
    'fully-remote': {
        icon: '🌍',
        label: 'Fully Remote',
        color: 'success',
    },
    'hybrid': {
        icon: '🏢',
        label: 'Hybrid',
        color: 'primary',
    },
    'timezone-flexible': {
        icon: '🕐',
        label: 'Timezone Flexible',
        color: 'info',
    },
    'async': {
        icon: '⚡',
        label: 'Async',
        color: 'warning',
    },
};

export default function RemoteBadge({ type, size = 'md' }: RemoteBadgeProps) {
    const config = BADGE_CONFIG[type];

    return (
        <span className={`remote-badge-component remote-badge-${size} remote-badge-${config.color}`}>
            <span className="remote-badge-icon">{config.icon}</span>
            <span className="remote-badge-label">{config.label}</span>
        </span>
    );
}
