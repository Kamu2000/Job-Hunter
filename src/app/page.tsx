'use client';

import { useApplications } from '@/contexts/ApplicationContext';
import { useInterviews } from '@/contexts/InterviewContext';
import { useTasks } from '@/contexts/TaskContext';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import ApplicationCard from '@/components/ApplicationCard';
import { formatDateTime, getDaysUntil } from '@/lib/utils';
import './page.css';

export default function Dashboard() {
  const { applications, getStatistics } = useApplications();
  const { getUpcomingInterviews } = useInterviews();
  const { tasks } = useTasks();

  const stats = getStatistics();
  const upcomingInterviews = getUpcomingInterviews().slice(0, 3);
  const recentApplications = applications.slice(0, 4);
  const highPriorityTasks = tasks
    .filter(task => task.priority === 'High' && task.status !== 'Done')
    .slice(0, 5);

  return (
    <div className="page">
      <Header
        title="🌍 Your Remote Job Search Hub"
        subtitle="Welcome back! Track your remote job search journey"
      />

      <div className="page-content">
        {/* Statistics Overview */}
        <section className="stats-section">
          <div className="grid grid-cols-4 gap-lg">
            <StatsCard
              title="Total Applications"
              value={stats.totalApplications}
              icon="📝"
              gradient="primary"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Active Applications"
              value={stats.activeApplications}
              icon="🔄"
              gradient="blue"
            />
            <StatsCard
              title="Interviews Scheduled"
              value={stats.interviewsScheduled}
              icon="📅"
              gradient="warning"
            />
            <StatsCard
              title="Offers Received"
              value={stats.offersReceived}
              icon="🎉"
              gradient="success"
            />
          </div>
        </section>

        <div className="dashboard-grid">
          {/* Recent Applications */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Recent Applications</h3>
              <a href="/applications" className="section-link">
                View all →
              </a>
            </div>
            <div className="applications-list">
              {recentApplications.length > 0 ? (
                recentApplications.map(app => (
                  <ApplicationCard key={app.id} application={app} />
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No applications yet. Start applying to jobs!</p>
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Interviews */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Upcoming Interviews</h3>
              <a href="/interviews" className="section-link">
                View all →
              </a>
            </div>
            <div className="interviews-list">
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.map(interview => (
                  <div key={interview.id} className="interview-item card">
                    <div className="interview-header">
                      <div>
                        <h4 className="interview-company">{interview.company}</h4>
                        <p className="interview-position">{interview.position}</p>
                      </div>
                      <span className={`badge badge-${interview.type === 'Technical' ? 'warning' : 'primary'}`}>
                        {interview.type}
                      </span>
                    </div>
                    <div className="interview-details">
                      <div className="interview-detail">
                        <span>📅</span>
                        <span>{formatDateTime(interview.date, interview.time)}</span>
                      </div>
                      <div className="interview-detail">
                        <span>⏱️</span>
                        <span>{interview.duration} minutes</span>
                      </div>
                      {getDaysUntil(interview.date) <= 3 && (
                        <span className="badge badge-danger">
                          In {getDaysUntil(interview.date)} days
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📅</span>
                  <p>No upcoming interviews scheduled</p>
                </div>
              )}
            </div>

            {/* High Priority Tasks */}
            <div className="section-header" style={{ marginTop: '2rem' }}>
              <h3 className="section-title">High Priority Tasks</h3>
              <a href="/tasks" className="section-link">
                View all →
              </a>
            </div>
            <div className="tasks-list">
              {highPriorityTasks.length > 0 ? (
                highPriorityTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-checkbox">
                      <input type="checkbox" checked={task.status === 'Done'} readOnly />
                    </div>
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      {task.dueDate && (
                        <div className="task-due">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <span className="badge badge-danger">High</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">✅</span>
                  <p>No high priority tasks</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            <a href="/jobs" className="action-card">
              <span className="action-icon">🌍</span>
              <span className="action-text">Find Remote Jobs</span>
            </a>
            <a href="/applications" className="action-card">
              <span className="action-icon">➕</span>
              <span className="action-text">Add Application</span>
            </a>
            <a href="/interviews" className="action-card">
              <span className="action-icon">📅</span>
              <span className="action-text">Schedule Interview</span>
            </a>
            <a href="/tasks" className="action-card">
              <span className="action-icon">✅</span>
              <span className="action-text">Create Task</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
