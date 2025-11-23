'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Application, ApplicationStatus, Statistics, ApplicationContextType } from '@/lib/types';
import { saveToLocalStorage, loadFromLocalStorage, generateId } from '@/lib/utils';
import { mockApplications } from '@/lib/mockData';

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

const STORAGE_KEY = 'job-hunter-applications';

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = loadFromLocalStorage<Application[]>(STORAGE_KEY, []);
        // If no stored data, use mock data for demonstration
        setApplications(stored.length > 0 ? stored : mockApplications);
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever applications change
    useEffect(() => {
        if (isLoaded) {
            saveToLocalStorage(STORAGE_KEY, applications);
        }
    }, [applications, isLoaded]);

    const addApplication = (application: Omit<Application, 'id' | 'appliedDate' | 'lastUpdated'>) => {
        const now = new Date().toISOString().split('T')[0];
        const newApplication: Application = {
            ...application,
            id: generateId(),
            appliedDate: now,
            lastUpdated: now,
        };
        setApplications(prev => [newApplication, ...prev]);
    };

    const updateApplication = (id: string, updates: Partial<Application>) => {
        setApplications(prev =>
            prev.map(app =>
                app.id === id
                    ? { ...app, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
                    : app
            )
        );
    };

    const deleteApplication = (id: string) => {
        setApplications(prev => prev.filter(app => app.id !== id));
    };

    const moveApplication = (id: string, newStatus: ApplicationStatus) => {
        updateApplication(id, { status: newStatus });
    };

    const getApplicationsByStatus = (status: ApplicationStatus): Application[] => {
        return applications.filter(app => app.status === status);
    };

    const getStatistics = (): Statistics => {
        const totalApplications = applications.length;
        const activeApplications = applications.filter(
            app => !['Rejected', 'Offer'].includes(app.status)
        ).length;

        const interviewsScheduled = applications.filter(
            app => ['Phone Screen', 'Interview'].includes(app.status)
        ).length;

        const offersReceived = applications.filter(app => app.status === 'Offer').length;
        const rejections = applications.filter(app => app.status === 'Rejected').length;

        const responseRate = totalApplications > 0
            ? Math.round(((totalApplications - applications.filter(app => app.status === 'Applied').length) / totalApplications) * 100)
            : 0;

        const applicationsByStatus = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {} as Record<ApplicationStatus, number>);

        // Group by month
        const applicationsByMonth = applications.reduce((acc, app) => {
            const date = new Date(app.appliedDate);
            const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            const existing = acc.find(item => item.month === monthKey);
            if (existing) {
                existing.count++;
            } else {
                acc.push({ month: monthKey, count: 1 });
            }
            return acc;
        }, [] as { month: string; count: number }[]);

        // Top companies
        const companyCount = applications.reduce((acc, app) => {
            acc[app.company] = (acc[app.company] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topCompanies = Object.entries(companyCount)
            .map(([company, count]) => ({ company, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalApplications,
            activeApplications,
            interviewsScheduled,
            offersReceived,
            rejections,
            responseRate,
            averageResponseTime: 7, // Mock value
            applicationsByStatus,
            applicationsByMonth,
            topCompanies,
        };
    };

    const value: ApplicationContextType = {
        applications,
        addApplication,
        updateApplication,
        deleteApplication,
        moveApplication,
        getApplicationsByStatus,
        getStatistics,
    };

    return (
        <ApplicationContext.Provider value={value}>
            {children}
        </ApplicationContext.Provider>
    );
};

export const useApplications = () => {
    const context = useContext(ApplicationContext);
    if (!context) {
        throw new Error('useApplications must be used within ApplicationProvider');
    }
    return context;
};
