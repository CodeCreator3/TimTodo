// screens/GoScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Task } from '../models/Task';
import { GoTaskCard } from '../components/GoTaskCard';
import { db } from '../utils/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot as firestoreOnSnapshot,
  orderBy,
  query,
  serverTimestamp,
  DocumentData,
  Query,
  QuerySnapshot,
} from 'firebase/firestore';

const TASKS_COLLECTION = 'tasks';
const ARCHIVE_COLLECTION = 'archivedTasks';

const GoScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const q = query(collection(db, TASKS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Task[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        loaded.push({
          id: docSnap.id,
          title: data.title,
          completed: data.completed,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
          dueDate: data.dueDate?.toMillis?.() ?? undefined,
        });
      });
      setTasks(loaded);
    });
    return unsubscribe;
  }, []);

  const soonest = useMemo(() => {
    return tasks
      .filter(t => !t.completed && typeof t.dueDate === 'number')
      .sort((a, b) => (a.dueDate! - b.dueDate!))[0] ?? null;
  }, [tasks]);

  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.completed) return;

    await addDoc(collection(db, ARCHIVE_COLLECTION), {
      title: task.title,
      completed: true,
      createdAt: task.createdAt,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      archivedAt: serverTimestamp(),
    });
    await deleteDoc(doc(db, TASKS_COLLECTION, id));
  };

  return (
    <View style={styles.container}>

      {!soonest ? (
        <Text style={styles.empty}>No upcoming tasks with a due date.</Text>
      ) : (
        <GoTaskCard task={soonest} onToggle={handleToggleTask} />
      )}
    </View>
  );
};

function onSnapshot(
  q: Query<DocumentData, DocumentData>,
  callback: (snapshot: QuerySnapshot<DocumentData>) => void
) {
  return firestoreOnSnapshot(q, callback);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
  },
  empty: {
    fontSize: 16,
    color: '#777',
  },
});

export default GoScreen;
