import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../models/Task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
  return (
    <TouchableOpacity onPress={() => onToggle(task.id)}>
      <View style={styles.container}>
        <View style={[styles.checkbox, task.completed && styles.checked]} />
        <Text style={[styles.text, task.completed && styles.completed]}>
          {task.title}
        </Text>
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
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
});

export default TaskItem;