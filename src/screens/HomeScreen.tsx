import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Task } from '../models/Task';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
// import TaskEditor ... if you already added it
import { db } from '../utils/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  DocumentData,
  Query,
  onSnapshot as firestoreOnSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';

const TASKS_COLLECTION = 'tasks';
const ARCHIVE_COLLECTION = 'archivedTasks';

interface HomeScreenProps {
  showArchiveDefault?: boolean;
}

type NewTaskPayload = {
  title: string;
  dueDate?: number;
  prerequisiteTasks: string[];
  prerequisiteLocation?: string;
  prerequisiteAfterDate?: number | null;
  prerequisiteNote?: string;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ showArchiveDefault = false }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [showArchive, setShowArchive] = useState(showArchiveDefault);

  const tsToMillis = (v: any): number | null => {
    if (!v) return null;
    if (typeof v === 'number') return v;
    if (v instanceof Date) return v.getTime();
    return v?.toMillis?.() ?? null;
  };

  // live tasks
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
          createdAt: tsToMillis(data.createdAt) ?? Date.now(),
          dueDate: tsToMillis(data.dueDate) ?? undefined,

          prerequisiteTasks: data.prerequisiteTasks ?? [],
          prerequisiteLocation: data.prerequisiteLocation ?? undefined,
          prerequisiteAfterDate: tsToMillis(data.prerequisiteAfterDate) ?? null,
          prerequisiteNote: data.prerequisiteNote ?? undefined,
        } as Task);
      });
      setTasks(loaded);
    });
    return unsubscribe;
  }, []);

  // archived
  useEffect(() => {
    const q = query(collection(db, ARCHIVE_COLLECTION), orderBy('archivedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: Task[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        loaded.push({
          id: docSnap.id,
          title: data.title,
          completed: data.completed,
          createdAt: tsToMillis(data.createdAt) ?? Date.now(),
          dueDate: tsToMillis(data.dueDate) ?? null,
          archivedAt: tsToMillis(data.archivedAt) ?? undefined,

          prerequisiteTasks: data.prerequisiteTasks ?? [],
          prerequisiteLocation: data.prerequisiteLocation ?? undefined,
          prerequisiteAfterDate: tsToMillis(data.prerequisiteAfterDate) ?? null,
          prerequisiteNote: data.prerequisiteNote ?? undefined,
        } as Task);
      });
      setArchivedTasks(loaded);
    });
    return unsubscribe;
  }, []);

  // sorting
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aHas = typeof a.dueDate === 'number';
      const bHas = typeof b.dueDate === 'number';
      if (aHas && bHas) return a.dueDate! - b.dueDate!;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [tasks]);

  const sortedArchivedTasks = useMemo(() => archivedTasks, [archivedTasks]);

  const handleAddTask = async (payload: NewTaskPayload) => {
    const {
      title,
      dueDate,
      prerequisiteTasks,
      prerequisiteLocation,
      prerequisiteAfterDate,
      prerequisiteNote,
    } = payload;

    await addDoc(collection(db, TASKS_COLLECTION), {
      title,
      completed: false,
      createdAt: serverTimestamp(),
      dueDate: dueDate ? new Date(dueDate) : null,
      prerequisiteTasks,
      prerequisiteLocation: prerequisiteLocation ?? null,
      prerequisiteAfterDate: prerequisiteAfterDate ? new Date(prerequisiteAfterDate) : null,
      prerequisiteNote: prerequisiteNote ?? null,
    });
  };

  const checkTaskPrerequisites = (task: Task, all: Task[]): boolean => {
    if (task.prerequisiteAfterDate && Date.now() < task.prerequisiteAfterDate) return false;

    const ids = task.prerequisiteTasks ?? [];
    if (ids.length > 0) {
      const unmet = ids.filter((id) => !all.find((t) => t.id === id && t.completed));
      if (unmet.length > 0) return false;
    }
    return true;
  };

  const handleToggleTask = async (id: string) => {
    const activeTask = tasks.find((t) => t.id === id);
    const archivedTask = archivedTasks.find((t) => t.id === id);

    if (activeTask && !activeTask.completed) {
      if (!checkTaskPrerequisites(activeTask, [...tasks, ...archivedTasks])) {
        Alert.alert('Prerequisites not met');
        return;
      }
      await addDoc(collection(db, ARCHIVE_COLLECTION), {
        title: activeTask.title,
        completed: true,
        createdAt: activeTask.createdAt ? new Date(activeTask.createdAt) : null,
        dueDate: activeTask.dueDate ? new Date(activeTask.dueDate) : null,
        archivedAt: serverTimestamp(),
        prerequisiteTasks: activeTask.prerequisiteTasks ?? [],
        prerequisiteLocation: activeTask.prerequisiteLocation ?? null,
        prerequisiteAfterDate: activeTask.prerequisiteAfterDate
          ? new Date(activeTask.prerequisiteAfterDate)
          : null,
        prerequisiteNote: activeTask.prerequisiteNote ?? null,
      });
      await deleteDoc(doc(db, TASKS_COLLECTION, id));
      return;
    }

    if (archivedTask && archivedTask.completed) {
      await addDoc(collection(db, TASKS_COLLECTION), {
        title: archivedTask.title,
        completed: false,
        createdAt: serverTimestamp(),
        dueDate: archivedTask.dueDate ? new Date(archivedTask.dueDate) : null,
        prerequisiteTasks: archivedTask.prerequisiteTasks ?? [],
        prerequisiteLocation: archivedTask.prerequisiteLocation ?? null,
        prerequisiteAfterDate: archivedTask.prerequisiteAfterDate
          ? new Date(archivedTask.prerequisiteAfterDate)
          : null,
        prerequisiteNote: archivedTask.prerequisiteNote ?? null,
      });
      await deleteDoc(doc(db, ARCHIVE_COLLECTION, id));
    }
  };

  // (Optional) if you're using TaskEditor:
  // const [editTask, setEditTask] = useState<Task | null>(null);
  // const [editVisible, setEditVisible] = useState(false);
  // const openEditor = (task: Task) => { setEditTask(task); setEditVisible(true); };
  // const handleSaveEdit = async (...) => { ... }

  return (
    <View style={styles.container}>
      {!showArchive && (
        <TaskInput
          allTasks={tasks}
          onAdd={handleAddTask}
        />
      )}

      <FlatList
        data={showArchive ? sortedArchivedTasks : sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            allTasks={showArchive ? [...tasks, ...archivedTasks] : tasks} // pass all
            onToggle={handleToggleTask}
            // onEdit={openEditor} // if you wired up editing
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      {/* {editTask && (
        <TaskEditor
          visible={editVisible}
          task={editTask}
          allTasks={[...tasks, ...archivedTasks]}
          onClose={() => setEditVisible(false)}
          onSave={handleSaveEdit}
        />
      )} */}
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

function onSnapshot(
  q: Query<DocumentData, DocumentData>,
  callback: (snapshot: QuerySnapshot<DocumentData>) => void
) {
  return firestoreOnSnapshot(q, callback);
}

export default HomeScreen;
