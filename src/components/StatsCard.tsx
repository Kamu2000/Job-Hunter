import './StatsCard.css';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'blue';
}

export default function StatsCard({ title, value, icon, trend, gradient = 'primary' }: StatsCardProps) {
    return (
        <div className={`stats-card stats-card-${gradient}`}>
            <div className="stats-icon">
                <span>{icon}</span>
            </div>
            <div className="stats-content">
                <div className="stats-title">{title}</div>
                <div className="stats-value">{value}</div>
                {trend && (
                    <div className={`stats-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        <span className="trend-icon">{trend.isPositive ? '↑' : '↓'}</span>
                        <span className="trend-value">{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
