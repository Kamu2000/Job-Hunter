'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/contexts/ToastContext';
import Header from '@/components/Header';
import './page.css';

export default function ProfilePage() {
    const { profile, createProfile, updateProfile, isProfileComplete } = useProfile();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        location: '',
        targetJobTitles: '',
        skills: '',
        experienceLevel: 'Mid' as any,
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'USD',
        remote: true,
        hybrid: true,
        onsite: false,
        preferredLocations: '',
        timezonePreference: [] as string[],
        remoteWorkExperience: false,
        remoteWorkSetup: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                email: profile.email,
                location: profile.location,
                targetJobTitles: profile.targetJobTitles.join(', '),
                skills: profile.skills.join(', '),
                experienceLevel: profile.experienceLevel,
                salaryMin: profile.salaryMin?.toString() || '',
                salaryMax: profile.salaryMax?.toString() || '',
                salaryCurrency: profile.salaryCurrency,
                remote: profile.workPreferences.remote,
                hybrid: profile.workPreferences.hybrid,
                onsite: profile.workPreferences.onsite,
                preferredLocations: profile.preferredLocations.join(', '),
                timezonePreference: profile.timezonePreference || [],
                remoteWorkExperience: profile.remoteWorkExperience || false,
                remoteWorkSetup: profile.remoteWorkSetup || '',
            });
        }
    }, [profile]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const profileData = {
            name: formData.name,
            email: formData.email,
            location: formData.location,
            targetJobTitles: formData.targetJobTitles.split(',').map(s => s.trim()).filter(Boolean),
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
            experienceLevel: formData.experienceLevel,
            salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
            salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
            salaryCurrency: formData.salaryCurrency,
            workPreferences: {
                remote: formData.remote,
                hybrid: formData.hybrid,
                onsite: formData.onsite,
            },
            preferredLocations: formData.preferredLocations.split(',').map(s => s.trim()).filter(Boolean),
            timezonePreference: formData.timezonePreference,
            remoteWorkExperience: formData.remoteWorkExperience,
            remoteWorkSetup: formData.remoteWorkSetup,
        };

        if (profile) {
            updateProfile(profileData);
            showToast('Profile updated successfully!', 'success');
        } else {
            createProfile(profileData);
            showToast('Profile created successfully!', 'success');
        }
    };

    return (
        <div className="page">
            <Header
                title="Profile Settings"
                subtitle="Configure your job search preferences"
            />

            <div className="page-content">
                <div className="profile-container">
                    {!isProfileComplete() && (
                        <div className="alert alert-warning">
                            ⚠️ Complete your profile to get personalized job recommendations
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="profile-form">
                        <section className="form-section">
                            <h3>Personal Information</h3>

                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Current Location *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., San Francisco, CA"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                        </section>

                        <section className="form-section">
                            <h3>Job Preferences</h3>

                            <div className="form-group">
                                <label>Target Job Titles * (comma-separated)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Software Engineer, Full Stack Developer"
                                    value={formData.targetJobTitles}
                                    onChange={(e) => setFormData({ ...formData, targetJobTitles: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Skills * (comma-separated)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., React, TypeScript, Node.js"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Experience Level *</label>
                                <select
                                    className="select"
                                    value={formData.experienceLevel}
                                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                                    required
                                >
                                    <option value="Entry">Entry Level</option>
                                    <option value="Mid">Mid Level</option>
                                    <option value="Senior">Senior Level</option>
                                    <option value="Lead">Lead</option>
                                    <option value="Executive">Executive</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Minimum Salary</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="100000"
                                        value={formData.salaryMin}
                                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Maximum Salary</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="150000"
                                        value={formData.salaryMax}
                                        onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="form-section">
                            <h3>Work Preferences</h3>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.remote}
                                        onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                                    />
                                    <span>Remote</span>
                                </label>

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.hybrid}
                                        onChange={(e) => setFormData({ ...formData, hybrid: e.target.checked })}
                                    />
                                    <span>Hybrid</span>
                                </label>

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.onsite}
                                        onChange={(e) => setFormData({ ...formData, onsite: e.target.checked })}
                                    />
                                    <span>On-site</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Preferred Locations (comma-separated)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., San Francisco, New York, Austin"
                                    value={formData.preferredLocations}
                                    onChange={(e) => setFormData({ ...formData, preferredLocations: e.target.value })}
                                />
                                <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                                    Optional - For hybrid positions or location preferences
                                </small>
                            </div>
                        </section>

                        <section className="form-section">
                            <h3>🌍 Remote Work Preferences</h3>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.remoteWorkExperience}
                                        onChange={(e) => setFormData({ ...formData, remoteWorkExperience: e.target.checked })}
                                    />
                                    <span>I have prior remote work experience</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Timezone Preferences</label>
                                <div className="checkbox-group">
                                    {['Americas', 'Europe', 'Asia', 'Oceania', 'Flexible'].map(tz => (
                                        <label key={tz} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.timezonePreference.includes(tz)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            timezonePreference: [...formData.timezonePreference, tz]
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            timezonePreference: formData.timezonePreference.filter(t => t !== tz)
                                                        });
                                                    }
                                                }}
                                            />
                                            <span>{tz}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Remote Work Setup</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Home office, Co-working space"
                                    value={formData.remoteWorkSetup}
                                    onChange={(e) => setFormData({ ...formData, remoteWorkSetup: e.target.value })}
                                />
                            </div>
                        </section>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary btn-lg">
                                {profile ? 'Update Profile' : 'Create Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
