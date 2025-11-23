'use client';

import { useState } from 'react';
import { useInterviews } from '@/contexts/InterviewContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { useToast } from '@/contexts/ToastContext';
import { Interview, InterviewType } from '@/lib/types';
import Header from '@/components/Header';
import { formatDateTime, getInterviewTypeColor } from '@/lib/utils';
import './page.css';

export default function InterviewsPage() {
    const { interviews, getUpcomingInterviews, addInterview, updateInterview, deleteInterview } = useInterviews();
    const { applications } = useApplications();
    const { showToast } = useToast();
    const upcomingInterviews = getUpcomingInterviews();
    const [showModal, setShowModal] = useState(false);
    const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
    const [formData, setFormData] = useState({
        applicationId: '',
        company: '',
        position: '',
        type: 'Technical' as InterviewType,
        date: '',
        time: '',
        duration: 60,
        location: '',
        meetingLink: '',
        interviewer: '',
        interviewerEmail: '',
        notes: '',
        preparation: [] as string[],
    });

    const handleOpenModal = (interview?: Interview) => {
        if (interview) {
            setEditingInterview(interview);
            setFormData({
                applicationId: interview.applicationId,
                company: interview.company,
                position: interview.position,
                type: interview.type,
                date: interview.date,
                time: interview.time,
                duration: interview.duration,
                location: interview.location || '',
                meetingLink: interview.meetingLink || '',
                interviewer: interview.interviewer || '',
                interviewerEmail: interview.interviewerEmail || '',
                notes: interview.notes || '',
                preparation: interview.preparation || [],
            });
        } else {
            setEditingInterview(null);
            setFormData({
                applicationId: applications.length > 0 ? applications[0].id : '',
                company: '',
                position: '',
                type: 'Technical',
                date: '',
                time: '',
                duration: 60,
                location: '',
                meetingLink: '',
                interviewer: '',
                interviewerEmail: '',
                notes: '',
                preparation: [],
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingInterview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingInterview) {
            updateInterview(editingInterview.id, {
                ...formData,
                completed: editingInterview.completed,
            });
            showToast('Interview updated successfully!', 'success');
        } else {
            addInterview({
                ...formData,
                completed: false,
            });
            showToast('Interview scheduled successfully!', 'success');
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        deleteInterview(id);
        showToast('Interview deleted!', 'info');
    };

    const handleAddPrepItem = () => {
        const item = prompt('Enter preparation item:');
        if (item) {
            setFormData({
                ...formData,
                preparation: [...formData.preparation, item],
            });
        }
    };

    const handleRemovePrepItem = (index: number) => {
        setFormData({
            ...formData,
            preparation: formData.preparation.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="page">
            <Header
                title="Interviews"
                subtitle={`${upcomingInterviews.length} upcoming interviews`}
            />

            <div className="page-content">
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        ➕ Schedule Interview
                    </button>
                </div>
                {/* Upcoming Interviews */}
                <section className="interviews-section">
                    <h3 className="section-title">Upcoming Interviews</h3>
                    <div className="interviews-list">
                        {upcomingInterviews.length > 0 ? (
                            upcomingInterviews.map(interview => (
                                <div key={interview.id} className="interview-card card">
                                    <div className="interview-header">
                                        <div>
                                            <h4 className="interview-company">{interview.company}</h4>
                                            <p className="interview-position">{interview.position}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span className={`badge badge-${getInterviewTypeColor(interview.type)}`}>
                                                {interview.type}
                                            </span>
                                            <button
                                                className="btn btn-icon btn-sm btn-ghost"
                                                onClick={() => handleOpenModal(interview)}
                                                aria-label="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-icon btn-sm btn-ghost"
                                                onClick={() => handleDelete(interview.id)}
                                                aria-label="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    <div className="interview-details">
                                        <div className="detail-item">
                                            <span>📅</span>
                                            <span>{formatDateTime(interview.date, interview.time)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span>⏱️</span>
                                            <span>{interview.duration} minutes</span>
                                        </div>
                                        {interview.meetingLink && (
                                            <div className="detail-item">
                                                <span>🔗</span>
                                                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                                                    Join Meeting
                                                </a>
                                            </div>
                                        )}
                                        {interview.interviewer && (
                                            <div className="detail-item">
                                                <span>👤</span>
                                                <span>{interview.interviewer}</span>
                                            </div>
                                        )}
                                    </div>

                                    {interview.notes && (
                                        <div className="interview-notes">
                                            <strong>Notes:</strong> {interview.notes}
                                        </div>
                                    )}

                                    {interview.preparation && interview.preparation.length > 0 && (
                                        <div className="interview-prep">
                                            <strong>Preparation:</strong>
                                            <ul>
                                                {interview.preparation.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon">📅</span>
                                <p>No upcoming interviews scheduled</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* All Interviews */}
                <section className="interviews-section">
                    <h3 className="section-title">All Interviews</h3>
                    <div className="interviews-grid">
                        {interviews.map(interview => (
                            <div key={interview.id} className="interview-item card">
                                <div className="item-header">
                                    <h4>{interview.company}</h4>
                                    <span className={`badge badge-${interview.completed ? 'success' : 'warning'}`}>
                                        {interview.completed ? 'Completed' : 'Upcoming'}
                                    </span>
                                </div>
                                <p className="item-subtitle">{interview.position}</p>
                                <div className="item-details">
                                    <span className={`badge badge-${getInterviewTypeColor(interview.type)}`}>
                                        {interview.type}
                                    </span>
                                    <span className="item-date">{formatDateTime(interview.date, interview.time)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Add/Edit Interview Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{editingInterview ? 'Edit Interview' : 'Schedule New Interview'}</h3>
                                <button className="btn btn-icon btn-ghost" onClick={handleCloseModal}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body">
                                <div className="form-group">
                                    <label>Application</label>
                                    <select
                                        className="select"
                                        value={formData.applicationId}
                                        onChange={(e) => {
                                            const app = applications.find(a => a.id === e.target.value);
                                            setFormData({
                                                ...formData,
                                                applicationId: e.target.value,
                                                company: app?.company || '',
                                                position: app?.jobTitle || '',
                                            });
                                        }}
                                    >
                                        <option value="">Select Application</option>
                                        {applications.map(app => (
                                            <option key={app.id} value={app.id}>
                                                {app.company} - {app.jobTitle}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Company *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Position *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type *</label>
                                        <select
                                            className="select"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as InterviewType })}
                                            required
                                        >
                                            <option value="Phone Screen">Phone Screen</option>
                                            <option value="Technical">Technical</option>
                                            <option value="Behavioral">Behavioral</option>
                                            <option value="System Design">System Design</option>
                                            <option value="Final Round">Final Round</option>
                                            <option value="HR Round">HR Round</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Duration (minutes) *</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date *</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Time *</label>
                                        <input
                                            type="time"
                                            className="input"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Zoom, Office, etc."
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Meeting Link</label>
                                    <input
                                        type="url"
                                        className="input"
                                        placeholder="https://..."
                                        value={formData.meetingLink}
                                        onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Interviewer</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.interviewer}
                                            onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Interviewer Email</label>
                                        <input
                                            type="email"
                                            className="input"
                                            value={formData.interviewerEmail}
                                            onChange={(e) => setFormData({ ...formData, interviewerEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea
                                        className="input"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Preparation Items</label>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        {formData.preparation.map((item, index) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <span>• {item}</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-icon btn-sm btn-ghost"
                                                    onClick={() => handleRemovePrepItem(index)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={handleAddPrepItem}
                                    >
                                        ➕ Add Preparation Item
                                    </button>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingInterview ? 'Update' : 'Schedule'} Interview
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
