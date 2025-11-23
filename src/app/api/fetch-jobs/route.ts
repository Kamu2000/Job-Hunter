import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { Job, UserProfile } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { fetchJobsFromAPIs } from '@/lib/jobAPI';
import { scrapeAllSources } from '@/lib/scrapers';

// JSearch API via RapidAPI - aggregates jobs from LinkedIn, Indeed, Glassdoor, ZipRecruiter
// Get free API key at: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY || 'demo';
const JSEARCH_HOST = 'jsearch.p.rapidapi.com';

// Helper function to strip HTML tags and decode entities
function stripHtml(html: string): string {
    if (!html) return '';
    let text = html.replace(/<[^>]*>/g, ' ');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/\s+/g, ' ').trim();
    return text.substring(0, 300) + (text.length > 300 ? '...' : '');
}

// Fetch from JSearch API (aggregates multiple job boards)
async function fetchFromJSearch(profile: UserProfile, page: number = 1): Promise<Job[]> {
    try {
        // If no API key, use scrapers instead of demo data
        if (JSEARCH_API_KEY === 'demo') {
            console.log('No API key - using web scrapers (We Work Remotely, RemoteOK)');
            return scrapeAllSources(profile);
        }

        const query = profile.targetJobTitles.join(' OR ');
        const location = profile.location;

        const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
            params: {
                query: `${query} remote`,
                page: page.toString(),
                num_pages: '1',
                date_posted: 'month',
                remote_jobs_only: 'true', // Filter for remote jobs only
            },
            headers: {
                'X-RapidAPI-Key': JSEARCH_API_KEY,
                'X-RapidAPI-Host': JSEARCH_HOST,
            },
        });

        if (!response.data.data) {
            return generateDemoJobs(profile);
        }

        return response.data.data
            .map((job: any) => ({
                id: generateId(),
                title: job.job_title,
                company: job.employer_name,
                companyLogo: job.employer_logo,
                location: job.job_city && job.job_state
                    ? `${job.job_city}, ${job.job_state}`
                    : job.job_country || 'Remote',
                locationType: job.job_is_remote ? 'Remote' : (job.job_offer_expiration_datetime_utc ? 'Hybrid' : 'On-site'),
                jobType: job.job_employment_type || 'Full-time',
                salaryMin: job.job_min_salary,
                salaryMax: job.job_max_salary,
                salaryCurrency: 'USD',
                description: stripHtml(job.job_description),
                requirements: job.job_required_skills || [],
                benefits: job.job_benefits || [],
                postedDate: job.job_posted_at_datetime_utc?.split('T')[0] || new Date().toISOString().split('T')[0],
                applicationUrl: job.job_apply_link,
                saved: false,
                timezoneRequirement: job.job_is_remote ? 'Flexible' : undefined,
                isAsync: job.job_is_remote,
            }))
            // Filter out on-site only positions for remote-first platform
            .filter((job: Job) => job.locationType === 'Remote' || job.locationType === 'Hybrid');
    } catch (error) {
        console.error('JSearch API error:', error);
        // Fallback to scrapers if API fails
        return scrapeAllSources(profile);
    }
}

// Demo data generator
function generateDemoJobs(profile: UserProfile): Job[] {
    // ... (kept for reference or fallback if needed, but unused now)
    const companies = [
        { name: 'Google', logo: 'https://logo.clearbit.com/google.com' },
        { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com' },
        { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
        { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com' },
        { name: 'Apple', logo: 'https://logo.clearbit.com/apple.com' },
    ];

    const locations = profile.preferredLocations.length > 0
        ? profile.preferredLocations
        : ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote'];

    return Array.from({ length: 20 }, (_, i) => {
        const company = companies[i % companies.length];
        const isRemote = i % 3 !== 2; // 66% remote, 33% hybrid
        return {
            id: generateId(),
            title: profile.targetJobTitles[i % profile.targetJobTitles.length] || 'Software Engineer',
            company: company.name,
            companyLogo: company.logo,
            location: isRemote ? 'Remote' : locations[i % locations.length],
            locationType: isRemote ? 'Remote' : 'Hybrid' as any,
            jobType: 'Full-time' as any,
            salaryMin: (profile.salaryMin || 100000) + (i * 5000),
            salaryMax: (profile.salaryMax || 150000) + (i * 5000),
            salaryCurrency: profile.salaryCurrency,
            description: `Exciting ${profile.experienceLevel} level remote opportunity working with ${profile.skills.slice(0, 3).join(', ')}. Join our distributed team and work from anywhere! We're looking for talented individuals passionate about remote work and technology.`,
            requirements: profile.skills.slice(0, 5),
            benefits: ['Health Insurance', 'Remote Work', '401k', 'Stock Options', 'Unlimited PTO', 'Home Office Stipend'],
            postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            applicationUrl: `https://careers.${company.name.toLowerCase()}.com/`,
            saved: false,
            timezoneRequirement: isRemote ? 'Flexible' : 'Americas',
            isAsync: isRemote,
        };
    });
}

// Job matching algorithm
function scoreAndSortJobs(jobs: Job[], profile: UserProfile): Job[] {
    return jobs.map(job => {
        let score = 0;

        const titleMatch = profile.targetJobTitles.some(title =>
            job.title.toLowerCase().includes(title.toLowerCase())
        );
        if (titleMatch) score += 50;

        const skillMatches = profile.skills.filter(skill =>
            job.description.toLowerCase().includes(skill.toLowerCase()) ||
            job.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
        );
        score += skillMatches.length * 10;

        // REMOTE-FIRST: Heavily favor remote positions
        if (job.locationType === 'Remote') {
            score += 60; // Major bonus for fully remote
        } else if (job.locationType === 'Hybrid') {
            score += 30; // Moderate bonus for hybrid
        }

        // Additional bonus for async/timezone flexible
        if (job.isAsync || job.timezoneRequirement === 'Flexible') {
            score += 20;
        }

        if (profile.preferredLocations.some(loc =>
            job.location.toLowerCase().includes(loc.toLowerCase())
        )) {
            score += 20;
        }

        if (profile.salaryMin && job.salaryMin && job.salaryMin >= profile.salaryMin) {
            score += 15;
        }

        return { ...job, matchScore: score };
    })
        .sort((a: any, b: any) => b.matchScore - a.matchScore)
        .map(({ matchScore, ...job }) => job);
}

export async function POST(request: NextRequest) {
    try {
        const { profile, page = 1 } = await request.json();

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile is required' },
                { status: 400 }
            );
        }

        // Fetch jobs from JSearch API (or fallback to demo data)
        const jobs = await fetchFromJSearch(profile, page);

        // Remove duplicates
        const uniqueJobs = jobs.filter((job, index, self) =>
            index === self.findIndex((j) =>
                j.title.toLowerCase() === job.title.toLowerCase() &&
                j.company.toLowerCase() === job.company.toLowerCase()
            )
        );

        // Score and sort by relevance
        const sortedJobs = scoreAndSortJobs(uniqueJobs, profile);

        return NextResponse.json({
            jobs: sortedJobs,
            count: sortedJobs.length,
            source: JSEARCH_API_KEY === 'demo' ? 'scrapers' : 'jsearch',
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}
