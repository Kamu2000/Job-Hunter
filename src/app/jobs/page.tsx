'use client';

import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { useToast } from '@/contexts/ToastContext';
import Header from '@/components/Header';
import { formatCurrency } from '@/lib/utils';
import './page.css';
import { Job } from '@/lib/types';

export default function JobsPage() {
    const { profile, isProfileComplete } = useProfile();
    const { applications, addApplication } = useApplications();
    const { showToast } = useToast();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('Remote'); // Default to Remote

    // Helper function to check if a job is already applied
    const isJobApplied = (jobId: string) => {
        return applications.some(app => app.jobId === jobId);
    };

    // Handle marking job as applied
    const handleMarkAsApplied = (job: Job) => {
        if (isJobApplied(job.id)) {
            showToast('You have already marked this job as applied!', 'warning');
            return;
        }

        addApplication({
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            companyLogo: job.companyLogo,
            location: job.location,
            status: 'Applied',
            salary: job.salaryMin && job.salaryMax
                ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
                : undefined,
            jobType: job.jobType,
            priority: 'Medium',
        });
        showToast('Application added successfully!', 'success');
    };

    const handleFetchJobs = async (isLoadMore = false) => {
        if (!profile) {
            showToast('Please complete your profile first to fetch personalized jobs!', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const nextPage = isLoadMore ? page + 1 : 1;

            // Call our server-side API route instead of direct API calls
            const response = await fetch('/api/fetch-jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profile,
                    page: nextPage
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();

            if (isLoadMore) {
                setJobs(prev => [...prev, ...data.jobs]);
                setPage(nextPage);
            } else {
                setJobs(data.jobs);
                setPage(1);
            }

            setHasFetched(true);
            setLastFetched(new Date());

            console.log(`Fetched ${data.count} jobs from ${data.source}`);
            showToast(`Successfully fetched ${data.count} jobs!`, 'success');
        } catch (error) {
            console.error('Error fetching jobs:', error);
            showToast('Failed to fetch jobs. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
        const matchesType = typeFilter === 'All' || job.locationType === typeFilter;
        return matchesSearch && matchesLocation && matchesType;
    });

    return (
        <div className="page">
            <Header
                title="🌍 Remote Job Search"
                subtitle={jobs.length > 0 ? `${jobs.length} remote opportunities found` : 'Find your next remote opportunity'}
            />

            <div className="page-content">
                {/* Profile Completion Alert */}
                {!isProfileComplete() && (
                    <div className="alert alert-warning">
                        ⚠️ <a href="/profile">Complete your profile</a> to get personalized job recommendations
                    </div>
                )}

                {/* Fetch Jobs Button */}
                <div className="fetch-section">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => handleFetchJobs(false)}
                        disabled={isLoading || !profile}
                    >
                        {isLoading && !hasFetched ? (
                            <>
                                <span className="spinner">⏳</span>
                                Fetching Jobs...
                            </>
                        ) : (
                            <>
                                🔍 {jobs.length > 0 ? 'Refresh Jobs' : 'Fetch Jobs from APIs'}
                            </>
                        )}
                    </button>
                    {lastFetched && (
                        <p className="last-fetched">
                            Last updated: {lastFetched.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {jobs.length > 0 && (
                    <>
                        {/* Search and Filters */}
                        <div className="search-section">
                            <div className="search-bar">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    className="input search-input"
                                    placeholder="Search by job title or company..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="filters">
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Location"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                />
                                <select
                                    className="select"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="results-info">
                            <p>{filteredJobs.length} jobs found</p>
                        </div>

                        {/* Jobs Grid */}
                        <div className="jobs-grid">
                            {filteredJobs.map(job => (
                                <div key={job.id} className="job-card card">
                                    <div className="job-header">
                                        <div className="company-info">
                                            <div className="company-logo">
                                                {job.companyLogo && job.companyLogo.startsWith('http') ? (
                                                    <img src={job.companyLogo} alt={job.company} />
                                                ) : job.companyLogo ? (
                                                    job.companyLogo
                                                ) : (
                                                    job.company.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="job-title">{job.title}</h3>
                                                <p className="company-name">{job.company}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="job-details">
                                        <div className="detail-item">
                                            <span>📍</span>
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span>💼</span>
                                            <span>{job.jobType}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span>🏠</span>
                                            <span className={job.locationType === 'Remote' ? 'remote-badge' : ''}>
                                                {job.locationType}
                                                {job.locationType === 'Remote' && job.timezoneRequirement && (
                                                    <span className="timezone-indicator"> • {job.timezoneRequirement}</span>
                                                )}
                                            </span>
                                        </div>
                                        {job.salaryMin && job.salaryMax && (
                                            <div className="detail-item">
                                                <span>💰</span>
                                                <span>
                                                    {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="job-description">{job.description}</p>

                                    {job.requirements.length > 0 && (
                                        <div className="job-skills">
                                            {job.requirements.slice(0, 5).map((skill, i) => (
                                                <span key={i} className="badge badge-primary">{skill}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="job-footer">
                                        {job.applicationUrl ? (
                                            <a
                                                href={job.applicationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm"
                                            >
                                                Apply Now
                                            </a>
                                        ) : (
                                            <button className="btn btn-primary btn-sm">
                                                Apply Now
                                            </button>
                                        )}
                                        {isJobApplied(job.id) ? (
                                            <button className="btn btn-success btn-sm" disabled>
                                                ✓ Applied
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleMarkAsApplied(job)}
                                            >
                                                Mark as Applied
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        <div className="load-more-section" style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                            <button
                                className="btn btn-secondary btn-lg"
                                onClick={() => handleFetchJobs(true)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner">⏳</span>
                                        Loading More...
                                    </>
                                ) : (
                                    'Load More Jobs'
                                )}
                            </button>
                        </div>
                    </>
                )}

                {jobs.length === 0 && !isLoading && (
                    <div className="empty-state">
                        <span className="empty-icon">🌍</span>
                        {hasFetched ? (
                            <p>No remote jobs found matching your profile. Try updating your profile with different titles or skills for remote work.</p>
                        ) : (
                            <p>Click "Fetch Jobs" to discover remote opportunities from around the world!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
