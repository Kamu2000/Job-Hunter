'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTasks } from '@/contexts/TaskContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { useInterviews } from '@/contexts/InterviewContext';
import { useToast } from '@/contexts/ToastContext';
import { Task, TaskPriority, TaskStatus } from '@/lib/types';
import Header from '@/components/Header';
import { getPriorityBadgeClass } from '@/lib/utils';
import './page.css';

export default function TasksPage() {
    const { tasks, toggleTaskStatus, deleteTask, addTask, updateTask } = useTasks();
    const { applications } = useApplications();
    const { interviews } = useInterviews();
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium' as TaskPriority,
        status: 'Todo' as TaskStatus,
        dueDate: '',
        relatedToType: '' as 'job' | 'application' | 'interview' | '',
        relatedToId: '',
    });

    // Sort tasks by date (newest first) within their status groups
    const getSortedTasks = (status: TaskStatus) => {
        return tasks
            .filter(t => t.status === status)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const todoTasks = getSortedTasks('Todo');
    const inProgressTasks = getSortedTasks('In Progress');
    const doneTasks = getSortedTasks('Done');

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as TaskStatus;
        const currentTask = tasks.find(t => t.id === draggableId);

        if (currentTask && currentTask.status !== newStatus) {
            // Update task status
            updateTask(draggableId, {
                status: newStatus,
                completedAt: newStatus === 'Done' ? new Date().toISOString().split('T')[0] : undefined
            });

            // Optional: Show toast for status change
            // showToast(`Task moved to ${newStatus}`, 'success');
        }
    };

    const handleOpenModal = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate || '',
                relatedToType: task.relatedTo?.type || '',
                relatedToId: task.relatedTo?.id || '',
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                status: 'Todo',
                dueDate: '',
                relatedToType: '',
                relatedToId: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTask(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const taskData = {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            dueDate: formData.dueDate || undefined,
            relatedTo: formData.relatedToType && formData.relatedToId ? {
                type: formData.relatedToType,
                id: formData.relatedToId,
                name: formData.relatedToType === 'application'
                    ? applications.find(a => a.id === formData.relatedToId)?.jobTitle || ''
                    : formData.relatedToType === 'interview'
                        ? interviews.find(i => i.id === formData.relatedToId)?.position || ''
                        : '',
            } : undefined,
        };

        if (editingTask) {
            updateTask(editingTask.id, taskData);
            showToast('Task updated successfully!', 'success');
        } else {
            addTask(taskData);
            showToast('Task created successfully!', 'success');
        }
        handleCloseModal();
    };

    const handleToggleStatus = (id: string) => {
        const task = tasks.find(t => t.id === id);
        const wasDone = task?.status === 'Done';
        toggleTaskStatus(id);
        showToast(wasDone ? 'Task marked as todo' : 'Task completed!', 'success');
    };

    const handleDelete = (id: string) => {
        deleteTask(id);
        showToast('Task deleted!', 'info');
    };

    const TaskItem = ({ task, index }: { task: Task; index: number }) => (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                >
                    <div className="task-checkbox">
                        <input
                            type="checkbox"
                            checked={task.status === 'Done'}
                            onChange={() => handleToggleStatus(task.id)}
                        />
                    </div>
                    <div className="task-content">
                        <h4 className={`task-title ${task.status === 'Done' ? 'completed' : ''}`}>
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="task-description">{task.description}</p>
                        )}
                        <div className="task-meta">
                            <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                                {task.priority}
                            </span>
                            {task.dueDate && (
                                <span className="task-due">
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                            {task.relatedTo && (
                                <span className="task-related">
                                    Related to: {task.relatedTo.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="task-actions">
                        <button
                            className="btn btn-icon btn-sm btn-ghost"
                            onClick={() => handleOpenModal(task)}
                            aria-label="Edit task"
                        >
                            ✏️
                        </button>
                        <button
                            className="btn btn-icon btn-sm btn-ghost task-delete"
                            onClick={() => handleDelete(task.id)}
                            aria-label="Delete task"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );

    const TaskColumn = ({ title, status, tasks }: { title: string; status: string; tasks: Task[] }) => (
        <div className="task-column">
            <div className="column-header">
                <h3 className="column-title">{title}</h3>
                <span className="column-count">{tasks.length}</span>
            </div>
            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {tasks.map((task, index) => (
                            <TaskItem key={task.id} task={task} index={index} />
                        ))}
                        {provided.placeholder}
                        {tasks.length === 0 && !snapshot.isDraggingOver && (
                            <div className="empty-column">
                                <span className="empty-icon">
                                    {status === 'Todo' ? '✅' : status === 'In Progress' ? '🔄' : '🎉'}
                                </span>
                                <p>No tasks {status.toLowerCase()}</p>
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );

    return (
        <div className="page">
            <Header
                title="Tasks"
                subtitle={`${tasks.filter(t => t.status !== 'Done').length} active tasks`}
            />

            <div className="page-content">
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        ➕ Create Task
                    </button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="tasks-board">
                        <TaskColumn title="To Do" status="Todo" tasks={todoTasks} />
                        <TaskColumn title="In Progress" status="In Progress" tasks={inProgressTasks} />
                        <TaskColumn title="Done" status="Done" tasks={doneTasks} />
                    </div>
                </DragDropContext>

                {/* Add/Edit Task Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
                                <button className="btn btn-icon btn-ghost" onClick={handleCloseModal}>
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        className="input"
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Priority *</label>
                                        <select
                                            className="select"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                            required
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status *</label>
                                        <select
                                            className="select"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                            required
                                        >
                                            <option value="Todo">Todo</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Related To</label>
                                    <select
                                        className="select"
                                        value={formData.relatedToType}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                relatedToType: e.target.value as any,
                                                relatedToId: '',
                                            });
                                        }}
                                    >
                                        <option value="">None</option>
                                        <option value="application">Application</option>
                                        <option value="interview">Interview</option>
                                    </select>
                                </div>
                                {formData.relatedToType === 'application' && (
                                    <div className="form-group">
                                        <label>Select Application</label>
                                        <select
                                            className="select"
                                            value={formData.relatedToId}
                                            onChange={(e) => setFormData({ ...formData, relatedToId: e.target.value })}
                                        >
                                            <option value="">Select Application</option>
                                            {applications.map(app => (
                                                <option key={app.id} value={app.id}>
                                                    {app.company} - {app.jobTitle}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {formData.relatedToType === 'interview' && (
                                    <div className="form-group">
                                        <label>Select Interview</label>
                                        <select
                                            className="select"
                                            value={formData.relatedToId}
                                            onChange={(e) => setFormData({ ...formData, relatedToId: e.target.value })}
                                        >
                                            <option value="">Select Interview</option>
                                            {interviews.map(interview => (
                                                <option key={interview.id} value={interview.id}>
                                                    {interview.company} - {interview.position}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingTask ? 'Update' : 'Create'} Task
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
