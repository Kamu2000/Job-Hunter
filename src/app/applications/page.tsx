'use client';

import { useState } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { useToast } from '@/contexts/ToastContext';
import { ApplicationStatus, Application } from '@/lib/types';
import Header from '@/components/Header';
import ApplicationCard from '@/components/ApplicationCard';
import './page.css';

const statusColumns: ApplicationStatus[] = [
    'Wishlist',
    'Applied',
    'Phone Screen',
    'Interview',
    'Offer',
    'Rejected',
];

export default function ApplicationsPage() {
    const { applications, getApplicationsByStatus, deleteApplication, addApplication, updateApplication } = useApplications();
    const { showToast } = useToast();
    const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'All'>('All');
    const [showModal, setShowModal] = useState(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);
    const [formData, setFormData] = useState({
        jobTitle: '',
        company: '',
        location: '',
        status: 'Applied' as ApplicationStatus,
        priority: 'Medium' as 'Low' | 'Medium' | 'High',
        salary: '',
        jobType: '',
        notes: '',
        contactPerson: '',
        contactEmail: '',
    });

    const filteredApplications = selectedStatus === 'All'
        ? applications
        : getApplicationsByStatus(selectedStatus);

    const handleOpenModal = (app?: Application) => {
        if (app) {
            setEditingApplication(app);
            setFormData({
                jobTitle: app.jobTitle,
                company: app.company,
                location: app.location,
                status: app.status,
                priority: app.priority,
                salary: app.salary || '',
                jobType: app.jobType || '',
                notes: app.notes || '',
                contactPerson: app.contactPerson || '',
                contactEmail: app.contactEmail || '',
            });
        } else {
            setEditingApplication(null);
            setFormData({
                jobTitle: '',
                company: '',
                location: '',
                status: 'Applied',
                priority: 'Medium',
                salary: '',
                jobType: '',
                notes: '',
                contactPerson: '',
                contactEmail: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingApplication(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingApplication) {
            updateApplication(editingApplication.id, formData);
            showToast('Application updated successfully!', 'success');
        } else {
            addApplication(formData);
            showToast('Application added successfully!', 'success');
        }
        handleCloseModal();
    };

    const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
        updateApplication(id, { status: newStatus });
        showToast('Application status updated!', 'success');
    };

    const handleDelete = (id: string) => {
        deleteApplication(id);
        showToast('Application deleted!', 'info');
    };

    return (
        <div className="page">
            <Header
                title="Applications"
                subtitle={`Tracking ${applications.length} job applications`}
            />

            <div className="page-content">
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        ➕ Add Application
                    </button>
                </div>
                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${selectedStatus === 'All' ? 'active' : ''}`}
                        onClick={() => setSelectedStatus('All')}
                    >
                        All ({applications.length})
                    </button>
                    {statusColumns.map(status => {
                        const count = getApplicationsByStatus(status).length;
                        return (
                            <button
                                key={status}
                                className={`filter-tab ${selectedStatus === status ? 'active' : ''}`}
                                onClick={() => setSelectedStatus(status)}
                            >
                                {status} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Kanban Board */}
                <div className="kanban-board">
                    {statusColumns.map(status => {
                        const statusApps = getApplicationsByStatus(status);
                        return (
                            <div key={status} className="kanban-column">
                                <div className="column-header">
                                    <h3 className="column-title">{status}</h3>
                                    <span className="column-count">{statusApps.length}</span>
                                </div>
                                <div className="column-content">
                                    {statusApps.length > 0 ? (
                                        statusApps.map(app => (
                                            <ApplicationCard
                                                key={app.id}
                                                application={app}
                                                onDelete={handleDelete}
                                                onEdit={handleOpenModal}
                                                onMove={handleStatusChange}
                                            />
                                        ))
                                    ) : (
                                        <div className="empty-column">
                                            <span className="empty-icon">📭</span>
                                            <p>No applications</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* List View (Mobile) */}
                <div className="list-view">
                    {filteredApplications.length > 0 ? (
                        <div className="applications-grid">
                            {filteredApplications.map(app => (
                                <ApplicationCard
                                    key={app.id}
                                    application={app}
                                    onDelete={deleteApplication}
                                    onEdit={handleOpenModal}
                                    onMove={handleStatusChange}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <p>No applications found</p>
                        </div>
                    )}
                </div>

                {/* Add/Edit Application Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{editingApplication ? 'Edit Application' : 'Add New Application'}</h3>
                                <button className="btn btn-icon btn-ghost" onClick={handleCloseModal}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body">
                                <div className="form-group">
                                    <label>Job Title *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        required
                                    />
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
                                    <label>Location *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Status *</label>
                                        <select
                                            className="select"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                                            required
                                        >
                                            {statusColumns.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Priority *</label>
                                        <select
                                            className="select"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                                            required
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Salary</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., $100k - $150k"
                                            value={formData.salary}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Job Type</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., Full-time"
                                            value={formData.jobType}
                                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Contact Person</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Email</label>
                                        <input
                                            type="email"
                                            className="input"
                                            value={formData.contactEmail}
                                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea
                                        className="input"
                                        rows={4}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingApplication ? 'Update' : 'Add'} Application
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
