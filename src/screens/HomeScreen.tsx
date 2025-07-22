import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Task } from '../models/Task';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import { db } from '../utils/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

const TASKS_COLLECTION = 'tasks';

const HomeScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const q = query(collection(db, TASKS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Task[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loaded.push({
          id: docSnap.id,
          title: data.title,
          completed: data.completed,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        });
      });
      setTasks(loaded);
    });
    return unsubscribe;
  }, []);

  const handleAddTask = async (title: string) => {
    await addDoc(collection(db, TASKS_COLLECTION), {
      title,
      completed: false,
      createdAt: serverTimestamp(),
    });
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await updateDoc(doc(db, TASKS_COLLECTION, id), {
        completed: !task.completed,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TaskInput onAdd={handleAddTask} />
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskItem task={item} onToggle={handleToggleTask} />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
});

export default HomeScreen;