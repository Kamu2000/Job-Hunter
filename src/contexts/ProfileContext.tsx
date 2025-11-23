'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, ProfileContextType } from '@/lib/types';
import { saveToLocalStorage, loadFromLocalStorage, generateId } from '@/lib/utils';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY = 'job-hunter-profile';

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = loadFromLocalStorage<UserProfile | null>(STORAGE_KEY, null);
        setProfile(stored);
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            saveToLocalStorage(STORAGE_KEY, profile);
        }
    }, [profile, isLoaded]);

    const createProfile = (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const newProfile: UserProfile = {
            ...profileData,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
        };
        setProfile(newProfile);
    };

    const updateProfile = (updates: Partial<UserProfile>) => {
        if (!profile) return;

        const updatedProfile: UserProfile = {
            ...profile,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        setProfile(updatedProfile);
    };

    const deleteProfile = () => {
        setProfile(null);
    };

    const isProfileComplete = (): boolean => {
        if (!profile) return false;

        return !!(
            profile.name &&
            profile.email &&
            profile.location &&
            profile.targetJobTitles.length > 0 &&
            profile.skills.length > 0 &&
            profile.experienceLevel
        );
    };

    const value: ProfileContextType = {
        profile,
        createProfile,
        updateProfile,
        deleteProfile,
        isProfileComplete,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within ProfileProvider');
    }
    return context;
};
