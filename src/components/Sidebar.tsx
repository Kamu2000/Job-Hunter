'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/contexts/ProfileContext';
import { getInitials } from '@/lib/utils';
import './Sidebar.css';

const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Jobs', href: '/jobs', icon: '🔍' },
    { name: 'Applications', href: '/applications', icon: '📝' },
    { name: 'Interviews', href: '/interviews', icon: '📅' },
    { name: 'Tasks', href: '/tasks', icon: '✅' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Profile', href: '/profile', icon: '👤' },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { profile } = useProfile();

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">💼</span>
                        <h1 className="logo-text">Job Hunter Pro</h1>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>


                <nav className="sidebar-nav">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-text">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">
                            <span>{profile ? getInitials(profile.name) : 'JH'}</span>
                        </div>
                        <div className="user-info">
                            <div className="user-name">{profile?.name || 'Job Hunter'}</div>
                            <div className="user-email">{profile?.email || 'hunter@example.com'}</div>
                        </div>
                    </div>
                </div>
            </aside >
        </>
    );
}
