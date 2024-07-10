import {useNavigation} from '@react-navigation/native';
import * as React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import GetLocation from 'react-native-get-location';

const TARGET_LATITUDE = 37.4220936;
const TARGET_LONGITUDE = -122.083922;
const DISTANCE_THRESHOLD = 0.001; // Adjust this value for your acceptable distance range

const isLocationWithinThreshold = (latitude: number, longitude: number) => {
  const latDiff = Math.abs(latitude - TARGET_LATITUDE);
  const lonDiff = Math.abs(longitude - TARGET_LONGITUDE);
  return latDiff < DISTANCE_THRESHOLD && lonDiff < DISTANCE_THRESHOLD;
};

const ProfileScreen = () => {
  const navigation = useNavigation();
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

  const handleCheckIn = () => {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString();
    setCheckInTimestamp(formattedDate);
    console.log(`Check In timestamp: ${timestamp}`);
    console.log(`Check In time: ${formattedDate}`);
    setIsCheckedIn(true);
    setIsCheckInEnabled(false);
  };
  const handleCheckOut = () => {
    const checkOutTimestamp = Date.now();
    const cdate = new Date(checkOutTimestamp);
    const formattedDateOut = cdate.toLocaleString();
    setCheckOutTimestamp(formattedDateOut);
    console.log(`Check Out timestamp: ${checkOutTimestamp}`);
    console.log(`Check Out time: ${formattedDateOut}`);
    // setIsCheckedIn(false);
    setShowButtons(false);
    // setIsCheckInEnabled(true);
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
          User Name
        </Text>
        <Text>email</Text>
        <View style={{marginTop: 30}}>
          <Text style={{fontSize: 28, color: '#000', fontWeight: 'bold'}}>
            Hi, User Name
          </Text>
          <Text style={{fontSize: 24, color: '#97BCE8', fontWeight: 'bold'}}>
            Welcome To The Office
          </Text>
          <Text style={{marginTop: 30, fontSize: 18, fontWeight: '700'}}>
            {isCheckedIn && !checkOutTimestamp
              ? `You have successfully checked in at: ${checkInTimestamp}`
              : isCheckedIn && checkOutTimestamp
              ? `You have checked out at: ${checkOutTimestamp}`
              : 'Please check in to start your day.'}
          </Text>
        </View>
      </View>
      {/* <TouchableOpacity
        style={[
          styles.checkInButton,
          {backgroundColor: isCheckInEnabled ? '#007BFF' : '#cccccc'},
        ]}
        onPress={handleCheckIn}
        // disabled={!isCheckInEnabled}
      >
        <Text style={styles.checkInButtonText}>
          {!isCheckedIn ? `Check In` : `Check Out`}
        </Text>
      </TouchableOpacity> */}
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
