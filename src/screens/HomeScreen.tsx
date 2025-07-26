import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Task } from '../models/Task';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import { db } from '../utils/firebase';
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
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

const HomeScreen: React.FC<HomeScreenProps> = ({ showArchiveDefault = false }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
    const [showArchive, setShowArchive] = useState(showArchiveDefault);

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
                    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
                    dueDate: data.dueDate instanceof Date
  ? data.dueDate.getTime()
  : data.dueDate?.toMillis?.() ?? null,
                    archivedAt: data.archivedAt?.toMillis?.() ?? undefined,
                });
            });
            setArchivedTasks(loaded);
        });
        return unsubscribe;
    }, []);

    const handleAddTask = async (title: string, dueDate?: number) => {
        await addDoc(collection(db, TASKS_COLLECTION), {
            title,
            completed: false,
            createdAt: serverTimestamp(),
            dueDate: dueDate ? new Date(dueDate) : null,
        });
    };

    const handleToggleTask = async (id: string) => {
        const task = tasks.find((t) => t.id === id);
        if (task) {
            if (!task.completed) {
                // Mark as completed and move to archive
                await addDoc(collection(db, ARCHIVE_COLLECTION), {
                    ...task,
                    dueDate: task.dueDate ? new Date(task.dueDate) : null, // Ensure no undefined
                    archivedAt: serverTimestamp(),
                    completed: true,
                });
                await deleteDoc(doc(db, TASKS_COLLECTION, id));
            } else {
                await addDoc(collection(db, TASKS_COLLECTION), {
                    ...task,
                    createdAt: serverTimestamp(),
                    completed: false,
                });
                await deleteDoc(doc(db, ARCHIVE_COLLECTION, id));
            }
        }
    };

    return (
        <View style={styles.container}>
            {!showArchive && <TaskInput onAdd={handleAddTask} />}
            <FlatList
                data={showArchive ? archivedTasks : tasks}
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

function onSnapshot(
    q: Query<DocumentData, DocumentData>,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void
) {
    return firestoreOnSnapshot(q, callback);
}

export default HomeScreen;
