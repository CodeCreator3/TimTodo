import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TaskInputProps {
  onAdd: (title: string, dueDate?: number) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text.trim(), dueDate ? dueDate.getTime() : undefined);
      setText('');
      setDueDate(undefined);
    }
  };

  const onChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  // Web date input handler
  const handleWebDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) setDueDate(new Date(value));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a new task"
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />
      {Platform.OS === 'web' ? (
        <input
          type="date"
          style={{ marginRight: 8, padding: 8, borderRadius: 4, borderColor: '#ccc', borderWidth: 1 }}
          value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
          onChange={handleWebDateChange}
        />
      ) : (
        <>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>
              {dueDate ? dueDate.toLocaleDateString() : 'Set Due Date'}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={onChange}
            />
          )}
        </>
      )}
      <Button title="Add" onPress={handleAdd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  dateButton: {
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  dateButtonText: {
    color: '#333',
  },
});

export default TaskInput;