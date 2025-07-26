// components/GoTaskCard.tsx
import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Task } from '../models/Task';

type Props = {
  task: Task;
  onToggle: (id: string) => void;
};

export const GoTaskCard: React.FC<Props> = ({ task, onToggle }) => {
  const hasDue = typeof task.dueDate === 'number';
  const formattedDue = hasDue ? new Date(task.dueDate!).toLocaleDateString() : null;

  const daysTillDue = useMemo(() => {
    if (!hasDue) return null;
    const now = new Date();
    const due = new Date(task.dueDate!);
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, [task.dueDate, hasDue]);

  const overdue = typeof daysTillDue === 'number' && daysTillDue < 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onToggle(task.id)}
      style={styles.card}
    >
      <Text style={styles.title} numberOfLines={3}>
        {task.title}
      </Text>

      {hasDue && (
        <View style={styles.dueWrap}>
          <Text style={[styles.due, overdue && styles.overdue]}>
            Due {formattedDue}
          </Text>
          {typeof daysTillDue === 'number' && (
            <Text style={[styles.relative, overdue && styles.overdue]}>
              {daysTillDue === 0
                ? 'Today'
                : daysTillDue > 0
                ? `${daysTillDue} day${daysTillDue > 1 ? 's' : ''} left`
                : `${-daysTillDue} day${-daysTillDue > 1 ? 's' : ''} ago`}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#F4F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111',
  },
  dueWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  due: {
    fontSize: 18,
    color: '#666',
  },
  relative: {
    marginTop: 4,
    fontSize: 14,
    color: '#888',
  },
  overdue: {
    color: '#d32f2f',
  },
});
