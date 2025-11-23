'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskPriority, TaskStatus, TaskContextType } from '@/lib/types';
import { saveToLocalStorage, loadFromLocalStorage, generateId } from '@/lib/utils';
import { mockTasks } from '@/lib/mockData';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY = 'job-hunter-tasks';

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = loadFromLocalStorage<Task[]>(STORAGE_KEY, []);
        setTasks(stored.length > 0 ? stored : mockTasks);
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            saveToLocalStorage(STORAGE_KEY, tasks);
        }
    }, [tasks, isLoaded]);

    const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
        const newTask: Task = {
            ...task,
            id: generateId(),
            createdAt: new Date().toISOString().split('T')[0],
        };
        setTasks(prev => [newTask, ...prev]);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id ? { ...task, ...updates } : task
            )
        );
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const toggleTaskStatus = (id: string) => {
        setTasks(prev =>
            prev.map(task => {
                if (task.id === id) {
                    const newStatus: TaskStatus = task.status === 'Done' ? 'Todo' : 'Done';
                    return {
                        ...task,
                        status: newStatus,
                        completedAt: newStatus === 'Done' ? new Date().toISOString().split('T')[0] : undefined,
                    };
                }
                return task;
            })
        );
    };

    const getTasksByPriority = (priority: TaskPriority): Task[] => {
        return tasks.filter(task => task.priority === priority);
    };

    const getTasksByStatus = (status: TaskStatus): Task[] => {
        return tasks.filter(task => task.status === status);
    };

    const value: TaskContextType = {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        getTasksByPriority,
        getTasksByStatus,
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within TaskProvider');
    }
    return context;
};
