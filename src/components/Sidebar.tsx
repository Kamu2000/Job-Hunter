'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/contexts/ProfileContext';
import { getInitials } from '@/lib/utils';
import './Sidebar.css';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Jobs', href: '/jobs', icon: '🔍' },
    { name: 'Applications', href: '/applications', icon: '📝' },
    { name: 'Interviews', href: '/interviews', icon: '📅' },
    { name: 'Tasks', href: '/tasks', icon: '✅' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Profile', href: '/profile', icon: '👤' },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { profile } = useProfile();

    const isActive = (path: string) => pathname === path;

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Job Hunter</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <nav className="sidebar-nav">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link href="/profile" className="user-profile" onClick={onClose}>
                        <div className="avatar">
                            {profile ? getInitials(profile.name) : 'JH'}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{profile?.name || 'Job Hunter'}</div>
                            <div className="user-email">{profile?.email || 'hunter@example.com'}</div>
                        </div>
                    </Link>
                </div>
            </aside>
        </>
    );
}
