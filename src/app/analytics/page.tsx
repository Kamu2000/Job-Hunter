'use client';

import { useApplications } from '@/contexts/ApplicationContext';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import { calculatePercentage } from '@/lib/utils';
import './page.css';

export default function AnalyticsPage() {
    const { getStatistics } = useApplications();
    const stats = getStatistics();

    return (
        <div className="page">
            <Header
                title="Analytics"
                subtitle="Insights into your job search performance"
            />

            <div className="page-content">
                {/* Key Metrics */}
                <section className="stats-section">
                    <h3 className="section-title">Key Metrics</h3>
                    <div className="grid grid-cols-4 gap-lg">
                        <StatsCard
                            title="Total Applications"
                            value={stats.totalApplications}
                            icon="📝"
                            gradient="primary"
                        />
                        <StatsCard
                            title="Response Rate"
                            value={`${stats.responseRate}%`}
                            icon="📊"
                            gradient="success"
                        />
                        <StatsCard
                            title="Interview Rate"
                            value={`${calculatePercentage(stats.interviewsScheduled, stats.totalApplications)}%`}
                            icon="📅"
                            gradient="warning"
                        />
                        <StatsCard
                            title="Offer Rate"
                            value={`${calculatePercentage(stats.offersReceived, stats.totalApplications)}%`}
                            icon="🎉"
                            gradient="purple"
                        />
                    </div>
                </section>

                {/* Application Status Distribution */}
                <section className="analytics-section">
                    <h3 className="section-title">Application Status Distribution</h3>
                    <div className="status-chart">
                        {Object.entries(stats.applicationsByStatus).map(([status, count]) => {
                            const percentage = calculatePercentage(count, stats.totalApplications);
                            return (
                                <div key={status} className="status-bar-container">
                                    <div className="status-info">
                                        <span className="status-label">{status}</span>
                                        <span className="status-value">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="status-bar">
                                        <div
                                            className="status-bar-fill"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Applications Over Time */}
                <section className="analytics-section">
                    <h3 className="section-title">Applications Over Time</h3>
                    <div className="timeline-chart">
                        {stats.applicationsByMonth.map(({ month, count }) => (
                            <div key={month} className="timeline-item">
                                <div className="timeline-bar" style={{ height: `${count * 20}px` }}>
                                    <span className="timeline-count">{count}</span>
                                </div>
                                <div className="timeline-label">{month}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Companies */}
                <section className="analytics-section">
                    <h3 className="section-title">Top Companies Applied To</h3>
                    <div className="companies-list">
                        {stats.topCompanies.map(({ company, count }, index) => (
                            <div key={company} className="company-item card">
                                <div className="company-rank">#{index + 1}</div>
                                <div className="company-info">
                                    <h4 className="company-name">{company}</h4>
                                    <p className="company-count">{count} applications</p>
                                </div>
                                <div className="company-percentage">
                                    {calculatePercentage(count, stats.totalApplications)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Success Metrics */}
                <section className="analytics-section">
                    <h3 className="section-title">Success Metrics</h3>
                    <div className="metrics-grid">
                        <div className="metric-card card">
                            <div className="metric-icon">✅</div>
                            <div className="metric-content">
                                <div className="metric-label">Applications Submitted</div>
                                <div className="metric-value">{stats.totalApplications}</div>
                            </div>
                        </div>
                        <div className="metric-card card">
                            <div className="metric-icon">📞</div>
                            <div className="metric-content">
                                <div className="metric-label">Interviews Secured</div>
                                <div className="metric-value">{stats.interviewsScheduled}</div>
                            </div>
                        </div>
                        <div className="metric-card card">
                            <div className="metric-icon">🎯</div>
                            <div className="metric-content">
                                <div className="metric-label">Offers Received</div>
                                <div className="metric-value">{stats.offersReceived}</div>
                            </div>
                        </div>
                        <div className="metric-card card">
                            <div className="metric-icon">❌</div>
                            <div className="metric-content">
                                <div className="metric-label">Rejections</div>
                                <div className="metric-value">{stats.rejections}</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
