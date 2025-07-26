import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '../models/Task';

interface NewTaskPayload {
  title: string;
  dueDate?: number;
  prerequisiteTasks: string[];
  prerequisiteLocation?: string;
  prerequisiteAfterDate?: number | null;
  prerequisiteNote?: string;
}

interface TaskInputProps {
  allTasks: Task[];
  onAdd: (payload: NewTaskPayload) => void;
}

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TaskInput: React.FC<TaskInputProps> = ({ allTasks, onAdd }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  // prerequisites
  const [prereqTasks, setPrereqTasks] = useState<string[]>([]);
  const [prereqLocation, setPrereqLocation] = useState<string>('');
  const [prereqAfterDate, setPrereqAfterDate] = useState<Date | undefined>(undefined);
  const [prereqNote, setPrereqNote] = useState<string>('');

  // toggles
  const [showPrereqs, setShowPrereqs] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [showAfterPicker, setShowAfterPicker] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    onAdd({
      title: trimmed,
      dueDate: dueDate?.getTime(),
      prerequisiteTasks: prereqTasks,
      prerequisiteLocation: prereqLocation || undefined,
      prerequisiteAfterDate: prereqAfterDate ? prereqAfterDate.getTime() : null,
      prerequisiteNote: prereqNote || undefined,
    });

    // reset
    setTitle('');
    setDueDate(undefined);
    setPrereqTasks([]);
    setPrereqLocation('');
    setPrereqAfterDate(undefined);
    setPrereqNote('');
    setShowPrereqs(false);
  };

  const onChangeDue = (_: any, selected?: Date) => {
    setShowDuePicker(false);
    if (selected) setDueDate(selected);
  };

  const onChangeAfter = (_: any, selected?: Date) => {
    setShowAfterPicker(false);
    if (selected) setPrereqAfterDate(selected);
  };

  const handleWebDateChange = (setter: (d: Date) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value) setter(new Date(value));
    };

  const togglePrereqTask = (id: string) => {
    setPrereqTasks((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const togglePrereqs = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPrereqs((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Task title */}
      <TextInput
        style={styles.input}
        placeholder="Add a new task"
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />

      {/* Due date */}
      {Platform.OS === 'web' ? (
        <input
          type="date"
          style={styles.webDate as any}
          value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
          onChange={handleWebDateChange((d) => setDueDate(d))}
        />
      ) : (
        <>
          <TouchableOpacity onPress={() => setShowDuePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>
              {dueDate ? `Due: ${dueDate.toLocaleDateString()}` : 'Set Due Date'}
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

      {/* Prerequisites toggle */}
      <TouchableOpacity onPress={togglePrereqs} style={styles.prereqToggle}>
        <Text style={styles.prereqToggleText}>
          {showPrereqs ? 'Hide Prerequisites ▲' : 'Show Prerequisites ▼'}
        </Text>
      </TouchableOpacity>

      {/* Collapsible prerequisite section */}
      {showPrereqs && (
        <View style={styles.prereqSection}>
          {/* After date */}
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
              <TouchableOpacity onPress={() => setShowAfterPicker(true)} style={styles.dateButton}>
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

          {/* Location */}
          <Text style={styles.sectionLabel}>Location (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Home, Gym, Office..."
            value={prereqLocation}
            onChangeText={setPrereqLocation}
          />

          {/* Note */}
          <Text style={styles.sectionLabel}>Note (optional)</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Any condition or note..."
            value={prereqNote}
            onChangeText={setPrereqNote}
            multiline
          />

          {/* Prerequisite Tasks */}
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

      <Button title="Add" onPress={handleAdd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginBottom: 16,
    alignItems: 'stretch',
    gap: 8,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 6,
  },
  dateButtonText: {
    color: '#333',
  },
  webDate: {
    marginTop: 4,
    marginBottom: 6,
    padding: 8,
    borderRadius: 4,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  prereqToggle: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    marginBottom: 6,
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
    marginBottom: 8,
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
    maxHeight: 120,
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
});

export default TaskInput;
