'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Interview, InterviewContextType } from '@/lib/types';
import { saveToLocalStorage, loadFromLocalStorage, generateId, isUpcoming } from '@/lib/utils';
import { mockInterviews } from '@/lib/mockData';

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

const STORAGE_KEY = 'job-hunter-interviews';

export const InterviewProvider = ({ children }: { children: ReactNode }) => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = loadFromLocalStorage<Interview[]>(STORAGE_KEY, []);
        setInterviews(stored.length > 0 ? stored : mockInterviews);
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            saveToLocalStorage(STORAGE_KEY, interviews);
        }
    }, [interviews, isLoaded]);

    const addInterview = (interview: Omit<Interview, 'id'>) => {
        const newInterview: Interview = {
            ...interview,
            id: generateId(),
        };
        setInterviews(prev => [...prev, newInterview]);
    };

    const updateInterview = (id: string, updates: Partial<Interview>) => {
        setInterviews(prev =>
            prev.map(interview =>
                interview.id === id ? { ...interview, ...updates } : interview
            )
        );
    };

    const deleteInterview = (id: string) => {
        setInterviews(prev => prev.filter(interview => interview.id !== id));
    };

    const getUpcomingInterviews = (): Interview[] => {
        return interviews
            .filter(interview => !interview.completed && isUpcoming(interview.date, interview.time))
            .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    };

    const getInterviewsByDate = (date: string): Interview[] => {
        return interviews.filter(interview => interview.date === date);
    };

    const value: InterviewContextType = {
        interviews,
        addInterview,
        updateInterview,
        deleteInterview,
        getUpcomingInterviews,
        getInterviewsByDate,
    };

    return (
        <InterviewContext.Provider value={value}>
            {children}
        </InterviewContext.Provider>
    );
};

export const useInterviews = () => {
    const context = useContext(InterviewContext);
    if (!context) {
        throw new Error('useInterviews must be used within InterviewProvider');
    }
    return context;
};
