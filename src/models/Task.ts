export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  dueDate?: number;
  archivedAt?: number;

  // New prerequisite fields
  prerequisiteTasks?: string[];   // IDs of tasks that must be completed first
  prerequisiteLocation?: string;  // Location requirement
  prerequisiteAfterDate?: number; // Timestamp after which the task can be done
  prerequisiteNote?: string;      // Free-text condition
}
