import {useNavigation, useRoute} from '@react-navigation/native';
import * as React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import GetLocation from 'react-native-get-location';

const TARGET_LATITUDE = 37.4220936;
const TARGET_LONGITUDE = -122.083922;
const DISTANCE_THRESHOLD = 0.001; // Adjust this value for your acceptable distance range

const isLocationWithinThreshold = (latitude, longitude) => {
  const latDiff = Math.abs(latitude - TARGET_LATITUDE);
  const lonDiff = Math.abs(longitude - TARGET_LONGITUDE);
  return latDiff < DISTANCE_THRESHOLD && lonDiff < DISTANCE_THRESHOLD;
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {employee} = route.params;

  const [isCheckInEnabled, setIsCheckInEnabled] = React.useState(false);
  const [isCheckedIn, setIsCheckedIn] = React.useState(false);
  const [showButtons, setShowButtons] = React.useState(true);
  const [checkOutTimestamp, setCheckOutTimestamp] = React.useState('');
  const [checkInTimestamp, setCheckInTimestamp] = React.useState('');

  React.useEffect(() => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        console.log(location);
        const {latitude, longitude} = location;
        if (isLocationWithinThreshold(latitude, longitude)) {
          setIsCheckInEnabled(true);
        } else {
          setIsCheckInEnabled(false);
        }
      })
      .catch(error => {
        const {code, message} = error;
        console.log(code, message);
      });
  }, []);

  const handleCheckIn = async () => {
    try {
      const now = new Date().toISOString(); // ISO format for timestamp

      const response = await fetch('http://192.168.0.106:8000/attendance', {
        // Update with your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee._id,
          employeeName: employee.employeeName,
          status: 'Checked In',
          checkIn: now,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        setCheckInTimestamp(now);
        setIsCheckedIn(true);
        setIsCheckInEnabled(false);
      } else {
        console.error('Failed to check in');
      }
    } catch (error) {
      console.error('Error during check-in:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      const now = new Date().toISOString(); // ISO format for timestamp

      const response = await fetch('http://192.168.0.106:8000/checkOut', {
        // Update with your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee._id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message);
        setCheckOutTimestamp(now);
        setShowButtons(false);
      } else {
        console.error('Failed to check out');
      }
    } catch (error) {
      console.error('Error during check-out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.topIcon}
          onPress={() => navigation.navigate('Home')}>
          <Image source={require('../images/homesvg.png')} />
        </TouchableOpacity>
        <View style={styles.topIcon}>
          <Image
            source={require('../images/logo.png')}
            style={styles.logoImg}
          />
        </View>
      </View>
      <View style={{marginTop: 30, marginLeft: 20}}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            color: '#000',
            fontFamily: 'Roboto',
          }}>
          {employee.employeeName}
        </Text>
        <Text>{employee.email}</Text>
        <View style={{marginTop: 30}}>
          <Text style={{fontSize: 28, color: '#000', fontWeight: 'bold'}}>
            Hi, {employee.employeeName}
          </Text>
          <Text style={{fontSize: 24, color: '#97BCE8', fontWeight: 'bold'}}>
            Welcome To The Office
          </Text>
          <Text style={{marginTop: 30, fontSize: 18, fontWeight: '700'}}>
            {isCheckedIn && !checkOutTimestamp
              ? `You have successfully checked in at: ${checkInTimestamp}`
              : isCheckedIn && checkOutTimestamp
              ? `You have checked out today at: ${checkOutTimestamp}`
              : 'Please check in to start your day.'}
          </Text>
        </View>
      </View>
      {showButtons &&
        (!isCheckedIn ? (
          <TouchableOpacity
            style={[
              styles.checkInButton,
              {backgroundColor: isCheckInEnabled ? '#007BFF' : '#cccccc'},
            ]}
            onPress={handleCheckIn}
            disabled={!isCheckInEnabled}>
            <Text style={styles.checkInButtonText}>Check In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.checkInButton,
              {backgroundColor: '#FF0000'}, // Different color for Check Out
            ]}
            onPress={handleCheckOut}>
            <Text style={styles.checkInButtonText}>Check Out</Text>
          </TouchableOpacity>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  topIcon: {
    marginTop: 20,
    marginLeft: 10,
  },
  logoImg: {
    transform: [{translateX: 40}],
  },
  topbar: {
    flexDirection: 'row',
    padding: 10,
  },
  checkInButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
