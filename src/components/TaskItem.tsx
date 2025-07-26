import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../models/Task';

interface TaskItemProps {
  task: Task;
  allTasks: Task[];                     // <-- NEW
  onToggle: (id: string) => void;
  onEdit?: (task: Task) => void;        // optional
}

const TaskItem: React.FC<TaskItemProps> = ({ task, allTasks, onToggle, onEdit }) => {
  const hasPrereqs =
    (task.prerequisiteTasks && task.prerequisiteTasks.length > 0) ||
    task.prerequisiteLocation ||
    task.prerequisiteAfterDate ||
    task.prerequisiteNote;

  const prereqInfo = [
    task.prerequisiteTasks?.length
      ? `${task.prerequisiteTasks.length} task${task.prerequisiteTasks.length > 1 ? 's' : ''}`
      : null,
    task.prerequisiteLocation ? `Loc: ${task.prerequisiteLocation}` : null,
    task.prerequisiteAfterDate
      ? `After: ${new Date(task.prerequisiteAfterDate).toLocaleDateString()}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');

  // Resolve prerequisite task IDs to actual task objects (to show titles + completed state)
  const prerequisiteTasks = (task.prerequisiteTasks ?? [])
    .map(id => allTasks.find(t => t.id === id))
    .filter(Boolean) as Task[];

  // Calculate days till due
  let daysTillDue: number | null = null;
  if (typeof task.dueDate === 'number') {
    const now = new Date();
    const due = new Date(task.dueDate);
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    daysTillDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <TouchableOpacity onPress={() => onToggle(task.id)}>
      <View style={styles.container}>
        {/* LEFT COLUMN FOR PREREQUISITES SUMMARY */}
        {hasPrereqs ? (
          <View style={styles.prereqColumn}>
            <Text style={styles.prereqText}>{prereqInfo}</Text>
          </View>
        ) : (
          <View style={styles.prereqColumn} />
        )}

        {/* CHECKBOX + TASK INFO */}
        <View style={[styles.checkbox, task.completed && styles.checked]} />
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
          <Text style={[styles.text, task.completed && styles.completed]}>{task.title}</Text>
            {onEdit && (
              <TouchableOpacity onPress={() => onEdit(task)} style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Due date */}
          {typeof task.dueDate === 'number' && (
            <Text style={styles.dueDate}>
              {new Date(task.dueDate).toLocaleDateString()}
              {typeof daysTillDue === 'number' &&
                ` (${
                  daysTillDue === 0
                    ? 'Due today'
                    : daysTillDue > 0
                    ? `${daysTillDue} day${daysTillDue > 1 ? 's' : ''} left`
                    : `${-daysTillDue} day${-daysTillDue > 1 ? 's' : ''} ago`
                })`}
            </Text>
          )}

          {/* Linked prerequisite tasks list */}
          {prerequisiteTasks.length > 0 && (
            <View style={styles.prereqList}>
              <Text style={styles.prereqHeader}>Prerequisites:</Text>
              {prerequisiteTasks.map((pr) => (
                <Text
                  key={pr.id}
                  style={[
                    styles.prereqItem,
                    pr.completed && styles.prereqCompleted,
                  ]}
                  numberOfLines={2}
                >
                  ↳ {pr.title}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  prereqColumn: {
    width: 90,
    marginRight: 8,
    paddingVertical: 4,
  },
  prereqText: {
    fontSize: 11,
    color: '#555',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#888',
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    flexShrink: 1,
    flexGrow: 1,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  dueDate: {
    marginTop: 2,
    fontSize: 13,
    color: '#666',
  },
  editButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  editText: {
    fontSize: 12,
    color: '#1976d2',
  },
  prereqList: {
    marginTop: 6,
    paddingLeft: 4,
  },
  prereqHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    marginBottom: 2,
  },
  prereqItem: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  prereqCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
});

export default TaskItem;
