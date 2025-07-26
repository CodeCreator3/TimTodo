export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: number;
    dueDate?: number;
    archivedAt?: number;
}