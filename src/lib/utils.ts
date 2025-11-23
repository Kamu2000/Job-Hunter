import { ApplicationStatus, TaskPriority, InterviewType } from './types';

// ===== DATE UTILITIES =====
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
};

export const formatDateTime = (dateString: string, timeString: string): string => {
    const date = new Date(`${dateString}T${timeString}`);
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('en-US', options);
};

export const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
};

export const isUpcoming = (dateString: string, timeString?: string): boolean => {
    const dateTime = timeString
        ? new Date(`${dateString}T${timeString}`)
        : new Date(dateString);
    return dateTime > new Date();
};

export const getDaysUntil = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

// ===== STATUS COLOR MAPPING =====
export const getStatusColor = (status: ApplicationStatus): string => {
    const colorMap: Record<ApplicationStatus, string> = {
        'Wishlist': 'gray',
        'Applied': 'primary',
        'Phone Screen': 'warning',
        'Interview': 'warning',
        'Offer': 'success',
        'Rejected': 'danger',
    };
    return colorMap[status] || 'gray';
};

export const getStatusBadgeClass = (status: ApplicationStatus): string => {
    return `badge-${getStatusColor(status)}`;
};

// ===== PRIORITY COLOR MAPPING =====
export const getPriorityColor = (priority: TaskPriority): string => {
    const colorMap: Record<TaskPriority, string> = {
        'Low': 'gray',
        'Medium': 'warning',
        'High': 'danger',
    };
    return colorMap[priority];
};

export const getPriorityBadgeClass = (priority: TaskPriority): string => {
    return `badge-${getPriorityColor(priority)}`;
};

// ===== INTERVIEW TYPE COLOR MAPPING =====
export const getInterviewTypeColor = (type: InterviewType): string => {
    const colorMap: Record<InterviewType, string> = {
        'Phone Screen': 'primary',
        'Technical': 'warning',
        'Behavioral': 'success',
        'System Design': 'warning',
        'Final Round': 'danger',
        'HR Round': 'primary',
    };
    return colorMap[type];
};

// ===== LOCAL STORAGE HELPERS =====
export const saveToLocalStorage = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
};

export const removeFromLocalStorage = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
};

// ===== STRING UTILITIES =====
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
};

// ===== NUMBER UTILITIES =====
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
};

export const calculatePercentage = (part: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
};

// ===== ARRAY UTILITIES =====
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
};

// ===== VALIDATION UTILITIES =====
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// ===== ID GENERATION =====
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ===== SEARCH & FILTER =====
export const searchInObject = <T extends Record<string, any>>(
    obj: T,
    query: string,
    fields: (keyof T)[]
): boolean => {
    const lowerQuery = query.toLowerCase();
    return fields.some(field => {
        const value = obj[field];
        if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerQuery);
        }
        return false;
    });
};
