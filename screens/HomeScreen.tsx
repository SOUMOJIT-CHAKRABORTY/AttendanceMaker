import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Image} from 'react-native';

const HomeScreen = () => {
  const [email, setEmail] = useState<String>('');
  const navigate = useNavigation();
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
          keyboardType="number-pad"
        />
        <TextInput
          placeholder="Employee ID"
          style={styles.textInput}
          keyboardType="email-address"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate.navigate('Profile')}>
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
  },
  inputView: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    // margin: 'auto',
    padding: 20,
  },
  button: {
    backgroundColor: '#3D77BB', // Set the background color to blue
    padding: 10, // Add some padding for the button
    paddingHorizontal: 20, // Add horizontal padding to the button
    borderRadius: 20, // Add border radius to make it look nicer
    marginTop: 10, // Add some margin at the top
  },
  buttonText: {
    color: 'white', // Set the text color to white
    textAlign: 'center', // Center the text horizontally
    fontWeight: 'bold', // Make the text bold
  },
});

export default HomeScreen;
