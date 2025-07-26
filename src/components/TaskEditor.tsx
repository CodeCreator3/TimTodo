// components/TaskEditor.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  FlatList,
  Modal,
  Button,
  LayoutAnimation,
  UIManager,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '../models/Task';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface EditTaskPayload {
  title: string;
  dueDate?: number | null;
  prerequisiteTasks: string[];
  prerequisiteLocation?: string | null;
  prerequisiteAfterDate?: number | null;
  prerequisiteNote?: string | null;
}

interface TaskEditorProps {
  visible: boolean;
  task: Task | null;
  allTasks: Task[];
  onClose: () => void;
  onSave: (payload: EditTaskPayload) => void;
}

const TaskEditor: React.FC<TaskEditorProps> = ({
  visible,
  task,
  allTasks,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const [prereqTasks, setPrereqTasks] = useState<string[]>([]);
  const [prereqLocation, setPrereqLocation] = useState<string>('');
  const [prereqAfterDate, setPrereqAfterDate] = useState<Date | undefined>(undefined);
  const [prereqNote, setPrereqNote] = useState<string>('');

  const [showPrereqs, setShowPrereqs] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [showAfterPicker, setShowAfterPicker] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);

  // hydrate fields when opening
  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);

    setPrereqTasks(task.prerequisiteTasks ?? []);
    setPrereqLocation(task.prerequisiteLocation ?? '');
    setPrereqAfterDate(task.prerequisiteAfterDate ? new Date(task.prerequisiteAfterDate) : undefined);
    setPrereqNote(task.prerequisiteNote ?? '');
  }, [task]);

  const togglePrereqs = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPrereqs((p) => !p);
  };

  const togglePrereqTask = (id: string) => {
    setPrereqTasks((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const onChangeDue = (_: any, selected?: Date) => {
    setShowDuePicker(false);
    if (selected) setDueDate(selected);
  };

  const onChangeAfter = (_: any, selected?: Date) => {
    setShowAfterPicker(false);
    if (selected) setPrereqAfterDate(selected);
  };

  const handleWebDateChange =
    (setter: (d: Date) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value) setter(new Date(value));
    };

  const handleSave = () => {
    if (!task) return;

    onSave({
      title: title.trim(),
      dueDate: dueDate ? dueDate.getTime() : null,
      prerequisiteTasks: prereqTasks,
      prerequisiteLocation: prereqLocation || null,
      prerequisiteAfterDate: prereqAfterDate ? prereqAfterDate.getTime() : null,
      prerequisiteNote: prereqNote || null,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Text style={styles.header}>Edit Task</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <Text style={styles.label}>Title</Text>
          <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
        />

        <Text style={styles.label}>Due Date</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            style={styles.webDate as any}
            value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
            onChange={handleWebDateChange((d) => setDueDate(d))}
          />
        ) : (
          <>
            <TouchableOpacity
              onPress={() => setShowDuePicker(true)}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>
                {dueDate ? `Due: ${dueDate.toLocaleDateString()}` : 'Pick due date'}
              </Text>
            </TouchableOpacity>
            {showDuePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={onChangeDue}
              />
            )}
          </>
        )}

        {/* Collapsible prerequisites */}
        <TouchableOpacity onPress={togglePrereqs} style={styles.prereqToggle}>
          <Text style={styles.prereqToggleText}>
            {showPrereqs ? 'Hide Prerequisites ▲' : 'Show Prerequisites ▼'}
          </Text>
        </TouchableOpacity>

        {showPrereqs && (
          <View style={styles.prereqSection}>
            <Text style={styles.sectionLabel}>Available After</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                style={styles.webDate as any}
                value={prereqAfterDate ? prereqAfterDate.toISOString().split('T')[0] : ''}
                onChange={handleWebDateChange((d) => setPrereqAfterDate(d))}
              />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setShowAfterPicker(true)}
                  style={styles.dateButton}
                >
                  <Text style={styles.dateButtonText}>
                    {prereqAfterDate
                      ? prereqAfterDate.toLocaleDateString()
                      : 'Pick after-date (optional)'}
                  </Text>
                </TouchableOpacity>
                {showAfterPicker && (
                  <DateTimePicker
                    value={prereqAfterDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onChangeAfter}
                  />
                )}
              </>
            )}

            <Text style={styles.sectionLabel}>Location (optional)</Text>
            <TextInput
              style={styles.input}
              value={prereqLocation}
              onChangeText={setPrereqLocation}
              placeholder="Location requirement"
            />

            <Text style={styles.sectionLabel}>Note (optional)</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              value={prereqNote}
              onChangeText={setPrereqNote}
              placeholder="Condition / note"
              multiline
            />

            <Text style={styles.sectionLabel}>Prerequisite Tasks</Text>
            <TouchableOpacity
              onPress={() => setShowTaskPicker((p) => !p)}
              style={styles.prereqButton}
            >
              <Text style={styles.prereqButtonText}>
                {prereqTasks.length > 0
                  ? `${prereqTasks.length} selected`
                  : 'Select tasks'}
              </Text>
            </TouchableOpacity>

            {showTaskPicker && (
              <View style={styles.prereqList}>
                <FlatList
                  data={allTasks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const selected = prereqTasks.includes(item.id);
                    return (
                      <TouchableOpacity
                        style={styles.prereqItem}
                        onPress={() => togglePrereqTask(item.id)}
                      >
                        <View style={[styles.checkbox, selected && styles.checked]} />
                        <Text style={{ flex: 1 }}>{item.title}</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </View>
        )}
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Cancel" onPress={onClose} />
          <Button title="Save" onPress={handleSave} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 32,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  webDate: {
    marginTop: 4,
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 12,
  },
  dateButtonText: {
    color: '#333',
  },
  prereqToggle: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    marginBottom: 12,
  },
  prereqToggleText: {
    fontSize: 14,
    color: '#333',
  },
  prereqSection: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  prereqButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 6,
  },
  prereqButtonText: {
    color: '#333',
  },
  prereqList: {
    maxHeight: 140,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginTop: 6,
    paddingVertical: 4,
  },
  prereqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#888',
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  checked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});

export default TaskEditor;
