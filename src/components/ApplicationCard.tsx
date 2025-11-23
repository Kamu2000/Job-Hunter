import { Application, ApplicationStatus } from '@/lib/types';
import { formatDate, getStatusBadgeClass, getPriorityBadgeClass } from '@/lib/utils';
import './ApplicationCard.css';

interface ApplicationCardProps {
    application: Application;
    onEdit?: (application: Application) => void;
    onDelete?: (id: string) => void;
    onMove?: (id: string, newStatus: ApplicationStatus) => void;
}

const statusOptions: ApplicationStatus[] = [
    'Wishlist',
    'Applied',
    'Phone Screen',
    'Interview',
    'Offer',
    'Rejected',
];

export default function ApplicationCard({ application, onEdit, onDelete, onMove }: ApplicationCardProps) {
    return (
        <div className="application-card">
            <div className="application-header">
                <div className="company-info">
                    {application.companyLogo && (
                        <div className="company-logo">{application.companyLogo}</div>
                    )}
                    <div>
                        <h3 className="job-title">{application.jobTitle}</h3>
                        <p className="company-name">{application.company}</p>
                    </div>
                </div>
                <div className="card-actions">
                    {onEdit && (
                        <button
                            className="btn btn-icon btn-sm btn-ghost"
                            onClick={() => onEdit(application)}
                            aria-label="Edit"
                        >
                            ✏️
                        </button>
                    )}
                    {onDelete && (
                        <button
                            className="btn btn-icon btn-sm btn-ghost"
                            onClick={() => onDelete(application.id)}
                            aria-label="Delete"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            <div className="application-details">
                <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{application.location}</span>
                </div>
                {application.salary && (
                    <div className="detail-item">
                        <span className="detail-icon">💰</span>
                        <span className="detail-text">{application.salary}</span>
                    </div>
                )}
                <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">Applied {formatDate(application.appliedDate)}</span>
                </div>
            </div>

            <div className="application-footer">
                <div className="badges">
                    {onMove ? (
                        <select
                            className={`badge ${getStatusBadgeClass(application.status)}`}
                            value={application.status}
                            onChange={(e) => onMove(application.id, e.target.value as ApplicationStatus)}
                            style={{ 
                                border: 'none', 
                                background: 'inherit', 
                                color: 'inherit',
                                cursor: 'pointer',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                            }}
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    ) : (
                        <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                            {application.status}
                        </span>
                    )}
                    <span className={`badge ${getPriorityBadgeClass(application.priority)}`}>
                        {application.priority} Priority
                    </span>
                </div>
            </div>

            {application.notes && (
                <div className="application-notes">
                    <p>{application.notes}</p>
                </div>
            )}
        </div>
    );
}
