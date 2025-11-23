import axios from 'axios';
import { Job, UserProfile } from '@/lib/types';
import { generateId } from '@/lib/utils';

// Note: These are demo implementations. For production, you'd need actual API keys.
// Adzuna API: https://developer.adzuna.com/
// The Muse API: https://www.themuse.com/developers/api/v2
// Remotive API: https://remotive.com/api/remote-jobs

const ADZUNA_APP_ID = process.env.NEXT_PUBLIC_ADZUNA_APP_ID || 'demo';
const ADZUNA_API_KEY = process.env.NEXT_PUBLIC_ADZUNA_API_KEY || 'demo';

// Helper function to strip HTML tags and decode entities
function stripHtml(html: string): string {
    if (!html) return '';
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, ' ');
    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    // Truncate to reasonable length
    return text.substring(0, 300) + (text.length > 300 ? '...' : '');
}

// ===== ADZUNA API CLIENT =====
export async function fetchFromAdzuna(profile: UserProfile): Promise<Job[]> {
    try {
        // For demo purposes, return mock data
        // In production, uncomment the API call below

        /*
        const query = profile.targetJobTitles.join(' OR ');
        const location = profile.location;
        const country = 'us'; // Could be derived from location
        
        const response = await axios.get(
          `https://api.adzuna.com/v1/api/jobs/${country}/search/1`,
          {
            params: {
              app_id: ADZUNA_APP_ID,
              app_key: ADZUNA_API_KEY,
              what: query,
              where: location,
              results_per_page: 20,
              salary_min: profile.salaryMin,
            }
          }
        );
        
        return response.data.results.map((job: any) => ({
          id: generateId(),
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          locationType: 'On-site',
          jobType: job.contract_type || 'Full-time',
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          salaryCurrency: 'USD',
          description: job.description,
          requirements: [],
          benefits: [],
          postedDate: job.created,
          applicationUrl: job.redirect_url,
          saved: false,
        }));
        */

        // Demo data for now
        // return generateDemoJobs(profile, 'adzuna');
        return [];
    } catch (error) {
        console.error('Adzuna API error:', error);
        return [];
    }
}

// ===== THE MUSE API CLIENT =====
export async function fetchFromTheMuse(profile: UserProfile): Promise<Job[]> {
    try {
        // The Muse API is free and doesn't require authentication

        const response = await axios.get('https://www.themuse.com/api/public/jobs', {
            params: {
                category: profile.targetJobTitles[0],
                location: profile.location,
                page: 0,
                descending: true,
            }
        });

        return response.data.results.map((job: any) => ({
            id: generateId(),
            title: job.name,
            company: job.company.name,
            companyLogo: job.company.logo,
            location: job.locations[0]?.name || 'Remote',
            locationType: 'Remote',
            jobType: 'Full-time',
            salaryCurrency: 'USD',
            description: stripHtml(job.contents),
            requirements: job.tags || [],
            benefits: [],
            postedDate: job.publication_date,
            applicationUrl: job.refs.landing_page,
            saved: false,
            timezoneRequirement: 'Flexible',
            isAsync: true,
        }));

        // Fallback to demo data if API fails
        // return generateDemoJobs(profile, 'themuse');
    } catch (error) {
        console.error('The Muse API error:', error);
        return generateDemoJobs(profile, 'themuse');
    }
}

// ===== REMOTIVE API CLIENT =====
export async function fetchFromRemotive(profile: UserProfile): Promise<Job[]> {
    try {
        // Remotive has a free API

        const response = await axios.get('https://remotive.com/api/remote-jobs', {
            params: {
                category: profile.targetJobTitles[0],
                limit: 20,
            }
        });

        return response.data.jobs.map((job: any) => ({
            id: generateId(),
            title: job.title,
            company: job.company_name,
            companyLogo: job.company_logo,
            location: 'Remote',
            locationType: 'Remote',
            jobType: job.job_type || 'Full-time',
            salaryCurrency: 'USD',
            description: stripHtml(job.description),
            requirements: job.tags || [],
            benefits: [],
            postedDate: job.publication_date,
            applicationUrl: job.url,
            saved: false,
            timezoneRequirement: 'Flexible',
            isAsync: true,
        }));

        // Fallback to demo data if API fails
        // return generateDemoJobs(profile, 'remotive');
    } catch (error) {
        console.error('Remotive API error:', error);
        return generateDemoJobs(profile, 'remotive');
    }
}

// ===== UNIFIED JOB FETCHER =====
export async function fetchJobsFromAPIs(profile: UserProfile): Promise<Job[]> {
    const [adzunaJobs, museJobs, remotiveJobs] = await Promise.all([
        fetchFromAdzuna(profile),
        fetchFromTheMuse(profile),
        fetchFromRemotive(profile),
    ]);

    // Combine all jobs
    const allJobs = [...adzunaJobs, ...museJobs, ...remotiveJobs];

    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.filter((job, index, self) =>
        index === self.findIndex((j) =>
            j.title.toLowerCase() === job.title.toLowerCase() &&
            j.company.toLowerCase() === job.company.toLowerCase()
        )
    );

    // Score and sort by relevance to profile
    return scoreAndSortJobs(uniqueJobs, profile);
}

// ===== JOB MATCHING ALGORITHM =====
function scoreAndSortJobs(jobs: Job[], profile: UserProfile): Job[] {
    return jobs.map(job => {
        let score = 0;

        // Title match
        const titleMatch = profile.targetJobTitles.some(title =>
            job.title.toLowerCase().includes(title.toLowerCase())
        );
        if (titleMatch) score += 50;

        // Skills match
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

        // Location match (less important for remote jobs)
        if (profile.preferredLocations.some(loc =>
            job.location.toLowerCase().includes(loc.toLowerCase())
        )) {
            score += 10;
        }

        // Salary match
        if (profile.salaryMin && job.salaryMin && job.salaryMin >= profile.salaryMin) {
            score += 15;
        }

        return { ...job, matchScore: score };
    })
        .sort((a: any, b: any) => b.matchScore - a.matchScore)
        .map(({ matchScore, ...job }) => job);
}

// ===== DEMO DATA GENERATOR =====
function generateDemoJobs(profile: UserProfile, source: string): Job[] {
    const companies = ['TechCorp', 'InnovateLabs', 'DataSystems', 'CloudTech', 'StartupXYZ'];
    const locations = ['Remote', 'Remote - US', 'Remote - Europe', 'Remote - Worldwide', 'Remote - Americas'];

    return Array.from({ length: 5 }, (_, i) => {
        const isRemote = i % 4 !== 3; // 75% fully remote, 25% hybrid
        return {
            id: generateId(),
            title: profile.targetJobTitles[i % profile.targetJobTitles.length] || 'Software Engineer',
            company: companies[i % companies.length],
            companyLogo: ['🚀', '💡', '📊', '☁️', '🎯'][i % 5],
            location: isRemote ? locations[i % locations.length] : 'Hybrid - ' + (profile.preferredLocations[0] || 'San Francisco'),
            locationType: isRemote ? 'Remote' : 'Hybrid' as any,
            jobType: 'Full-time' as any,
            salaryMin: profile.salaryMin || 100000,
            salaryMax: profile.salaryMax || 150000,
            salaryCurrency: profile.salaryCurrency,
            description: `Exciting remote opportunity for ${profile.experienceLevel} level professional with skills in ${profile.skills.slice(0, 3).join(', ')}. Work from anywhere with our distributed team! Source: ${source}`,
            requirements: profile.skills.slice(0, 5),
            benefits: ['Health Insurance', 'Remote Work', '401k', 'Home Office Stipend', 'Flexible Hours'],
            postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            applicationUrl: `https://example.com/jobs/${generateId()}`,
            saved: false,
            timezoneRequirement: isRemote ? 'Flexible' : 'Americas',
            isAsync: isRemote,
        };
    });
}
