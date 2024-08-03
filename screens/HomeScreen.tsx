import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {Image} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const HomeScreen = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigation();

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleLogin = async () => {
    try {
      const formattedDateOfBirth = moment(dateOfBirth).format('YYYY-MM-DD');

      const response = await fetch(
        'https://attendancemaker.onrender.com/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: mobileNumber,
            dateOfBirth: formattedDateOfBirth,
          }),
        },
      );

      const result = await response.json();

      if (response.status === 200) {
        Alert.alert('Login Successful', result.message);
        navigate.navigate('Profile', {employee: result.employee});
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Login Error', 'An error occurred during login.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../images/logo.png')}
        style={{marginBottom: 20}}
      />
      <View style={styles.shadowContainer}>
        <Image source={require('../images/bgsvg.png')} style={styles.image} />
      </View>
      <View style={styles.inputView}>
        <Text style={styles.inputHeader}>LOGIN TO YOUR ACCOUNT</Text>
        <TextInput
          placeholder="Mobile Number"
          style={styles.textInput}
          placeholderTextColor={'#000'}
          keyboardType="number-pad"
          onChangeText={setMobileNumber}
          value={mobileNumber}
        />
        <View>
          <TouchableOpacity onPress={showDatepicker} style={styles.dateInput}>
            <Text style={styles.dateText}>
              {dateOfBirth
                ? dateOfBirth.toISOString().split('T')[0]
                : 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={onChange}
              maximumDate={new Date()} // Users cannot select a future date
            />
          )}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 0, // Required for Android to apply shadow
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 30,
  },
  image: {
    width: 200, // Set your image width
    height: 200, // Set your image height
    borderRadius: 10, // Match border radius for consistency
  },
  inputHeader: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    width: 250, // Ensures the TextInput has sufficient width
    borderRadius: 20,
    marginBottom: 10,
    color: '#000',
  },
  inputView: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dateInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    width: 250,
    borderRadius: 20,
    marginBottom: 10,
    justifyContent: 'center',
  },
  dateText: {
    color: '#000',
  },
  button: {
    backgroundColor: '#3D77BB',
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
