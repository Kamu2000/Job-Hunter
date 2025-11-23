import axios from 'axios';
import * as cheerio from 'cheerio';
import { parseString } from 'xml2js';
import { Job, UserProfile } from './types';
import { generateId } from './utils';

// Helper function to strip HTML tags
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

// Scrape We Work Remotely RSS Feed
export async function scrapeWeWorkRemotely(profile: UserProfile): Promise<Job[]> {
    try {
        const response = await axios.get('https://weworkremotely.com/categories/remote-programming-jobs.rss', {
            timeout: 10000,
        });

        return new Promise((resolve, reject) => {
            parseString(response.data, (err, result) => {
                if (err) {
                    console.error('We Work Remotely RSS parse error:', err);
                    reject(err);
                    return;
                }

                try {
                    const items = result.rss.channel[0].item || [];
                    const jobs: Job[] = items.slice(0, 20).map((item: any) => {
                        const title = item.title[0];
                        const description = stripHtml(item.description[0]);
                        const link = item.link[0];
                        const pubDate = item.pubDate[0];

                        // Extract company from title (format: "Company: Job Title")
                        const titleParts = title.split(':');
                        const company = titleParts[0]?.trim() || 'Unknown Company';
                        const jobTitle = titleParts[1]?.trim() || title;

                        return {
                            id: generateId(),
                            title: jobTitle,
                            company: company,
                            location: 'Remote',
                            locationType: 'Remote' as const,
                            jobType: 'Full-time' as const,
                            salaryCurrency: 'USD',
                            description: description,
                            requirements: [],
                            benefits: [],
                            postedDate: new Date(pubDate).toISOString().split('T')[0],
                            applicationUrl: link,
                            saved: false,
                        };
                    });

                    resolve(jobs);
                } catch (parseError) {
                    console.error('We Work Remotely data processing error:', parseError);
                    resolve([]);
                }
            });
        });
    } catch (error) {
        console.error('We Work Remotely scraper error:', error);
        return [];
    }
}

// Scrape RemoteOK (using their JSON API)
export async function scrapeRemoteOK(profile: UserProfile): Promise<Job[]> {
    try {
        // RemoteOK has a JSON API endpoint
        const response = await axios.get('https://remoteok.com/api', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobHunterPro/1.0)',
            },
        });

        const jobs = response.data
            .slice(1, 21) // Skip first item (metadata) and take 20 jobs
            .filter((job: any) => job.position) // Filter out non-job items
            .map((job: any) => ({
                id: generateId(),
                title: job.position,
                company: job.company || 'Unknown Company',
                companyLogo: job.company_logo,
                location: job.location || 'Remote',
                locationType: 'Remote' as const,
                jobType: 'Full-time' as const,
                salaryMin: job.salary_min,
                salaryMax: job.salary_max,
                salaryCurrency: 'USD',
                description: stripHtml(job.description || ''),
                requirements: job.tags || [],
                benefits: [],
                postedDate: job.date ? new Date(job.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                applicationUrl: job.url ? `https://remoteok.com${job.url}` : job.apply_url,
                saved: false,
            }));

        return jobs;
    } catch (error) {
        console.error('RemoteOK scraper error:', error);
        return [];
    }
}

// Aggregate all scraper sources
export async function scrapeAllSources(profile: UserProfile): Promise<Job[]> {
    console.log('Scraping jobs from We Work Remotely and RemoteOK...');

    const [wwrJobs, remoteOKJobs] = await Promise.all([
        scrapeWeWorkRemotely(profile),
        scrapeRemoteOK(profile),
    ]);

    const allJobs = [...wwrJobs, ...remoteOKJobs];

    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.filter((job, index, self) =>
        index === self.findIndex((j) =>
            j.title.toLowerCase() === job.title.toLowerCase() &&
            j.company.toLowerCase() === job.company.toLowerCase()
        )
    );

    console.log(`Scraped ${uniqueJobs.length} unique jobs (${wwrJobs.length} from WWR, ${remoteOKJobs.length} from RemoteOK)`);

    return uniqueJobs;
}
