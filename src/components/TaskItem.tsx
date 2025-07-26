import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../models/Task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  // Calculate days till due
  let daysTillDue: number | null = null;
  if (task.dueDate) {
    const now = new Date();
    const due = new Date(task.dueDate);
    // Zero out time for accurate day difference
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    daysTillDue = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  console.log("TaskItem:", task.title, "dueDate:", task.dueDate);

  return (
    <TouchableOpacity onPress={() => onToggle(task.id)}>
      <View style={styles.container}>
        <View style={[styles.checkbox, task.completed && styles.checked]} />
        <Text style={[styles.text, task.completed && styles.completed]}>
          {task.title}
        </Text>
        {task.dueDate && (
          <Text style={styles.dueDate}>
            {new Date(task.dueDate).toLocaleDateString()}
            {typeof daysTillDue === 'number' && (
              ` (${
                daysTillDue === 0
                  ? 'Due today'
                  : daysTillDue > 0
                  ? `${daysTillDue} day${
                      daysTillDue > 1 ? 's' : ''
                    } left`
                  : `${-daysTillDue} day${
                      -daysTillDue > 1 ? 's' : ''
                    } ago`
              })`
            )}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
  text: {
    fontSize: 16,
    flex: 1,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  dueDate: {
    marginLeft: 12,
    color: '#888',
    fontSize: 14,
  },
});

export default TaskItem;