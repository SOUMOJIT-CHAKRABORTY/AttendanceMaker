const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  checkIn: {
    type: String,
  },
  checkOut: {
    type: String,
  },
  location: {
    type: {
      latitude: {
        type: Number,
        // required: true, // Optional: set to true if latitude is mandatory
      },
      longitude: {
        type: Number,
        // required: true, // Optional: set to true if longitude is mandatory
      },
    },
    // required: true, // Optional: set to true if location is mandatory
  },
  mobileDetails: {
    imei: {
      type: String, // stores the IMEI number
      // required: true,
    },
    model: {
      type: String, // stores the mobile model
      // required: true,
    },
  },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
