const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const {v4: uuidv4} = require('uuid');

const app = express();
const port = 8000;
const cors = require('cors');
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder where salary slips will be saved
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({storage: storage});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose
  .connect(
    'mongodb+srv://goutamghambir2018:NGcFuVXatbaRb6h4@cluster0.vvpnnwf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.log('Error connecting to MongoDB', error);
  });

app.listen(port, () => {
  console.log('Server is running on port 8000');
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

const Employee = require('./models/employee');
const Attendance = require('./models/attendance');

// Endpoint for login
app.post('/login', async (req, res) => {
  try {
    const {phoneNumber, pin} = req.body;

    // Find employee by phone number and pin
    const employee = await Employee.findOne({
      phoneNumber,
      pin,
    });

    if (!employee) {
      return res.status(401).json({message: 'Invalid phone number or PIN'});
    }

    // Create a JWT token
    const token = jwt.sign(
      {id: employee._id, phoneNumber: employee.phoneNumber},
      'your_jwt_secret_key',
      {expiresIn: '1h'},
    );

    res.status(200).json({message: 'Login successful', employee, token});
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({message: 'Error during login'});
  }
});

app.post('/addEmployee', async (req, res) => {
  try {
    const {
      employeeName,
      designation,
      phoneNumber,
      dateOfBirth,
      joiningDate,
      activeEmployee,
      salary,
      address,
      basicSalary,
      houseRent,
      medicalAllowance,
      providentFund,
      pin,
    } = req.body;

    const employeeId = uuidv4();
    // Create a new Employee
    const newEmployee = new Employee({
      employeeName,
      designation,
      phoneNumber,
      dateOfBirth,
      joiningDate,
      activeEmployee,
      salary,
      address,
      basicSalary,
      houseRent,
      medicalAllowance,
      providentFund,
      pin,
    });

    await newEmployee.save();

    res
      .status(201)
      .json({message: 'Employee saved successfully', employee: newEmployee});
  } catch (error) {
    console.log('Error creating employee', error);
    res.status(500).json({message: 'Failed to add an employee'});
  }
});

app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({message: 'Failed to get employees'});
  }
});

const addAttendance = async employeeId => {
  try {
    const currentDate = moment().format('YYYY-MM-DD');
    const existingAttendance = await Attendance.findOne({
      employeeId: employeeId,
      date: currentDate,
    });

    if (!existingAttendance) {
      const newAttendance = new Attendance({
        employeeId: employeeId,
        date: currentDate,
        timeIn: moment().format('HH:mm:ss'),
      });

      await newAttendance.save();
      console.log('Attendance added successfully');
    } else {
      console.log('Attendance already exists for today');
    }
  } catch (error) {
    console.log('Error adding attendance', error);
  }
};

// Endpoint for marking attendance
app.post('/attendance', async (req, res) => {
  try {
    const {employeeId, employeeName, status, location, mobileDetails} =
      req.body;

    // Get the current date and time
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const checkIn = now.toISOString(); // ISO string format for date and time

    // Create a new attendance record
    const attendance = new Attendance({
      employeeId,
      employeeName,
      date,
      status,
      checkIn,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      mobileDetails: {
        imei: mobileDetails.imei,
        model: mobileDetails.model,
      },
    });

    // Save the attendance record to the database
    await attendance.save();

    res
      .status(200)
      .json({message: 'Attendance marked successfully', attendance});
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({message: 'Failed to mark attendance'});
  }
});

app.post('/checkOut', async (req, res) => {
  try {
    const {employeeId, mobileDetails, location} = req.body;

    if (!employeeId) {
      return res.status(400).json({message: 'Employee ID is required'});
    }

    // Get the current date and time
    const now = new Date().toISOString();
    const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Find the latest attendance record for the employee on the current date
    const attendance = await Attendance.findOneAndUpdate(
      {
        employeeId,
        date: currentDate,
        checkOut: {$exists: false}, // Ensure check-out has not already been done
      },
      {
        checkOut: now,
        status: 'Checked Out', // Update the status to "Checked Out"
        checkOutMobileDetails: {
          imei: mobileDetails.imei,
          model: mobileDetails.model,
        }, // Add mobile details
        checkOutLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        }, // Add location
      },
      {new: true}, // Return the updated document
    );

    if (!attendance) {
      return res
        .status(404)
        .json({message: 'Attendance record not found or already checked out'});
    }

    res.status(200).json({message: 'Check-out successful', attendance});
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({message: 'Failed to check out'});
  }
});

// Endpoint for getting current attendance status
app.get('/attendanceStatus', async (req, res) => {
  try {
    const {employeeId} = req.query; // Use query parameter instead of body
    const currentDate = moment().format('YYYY-MM-DD');

    if (!employeeId) {
      return res.status(400).json({message: 'Employee ID is required'});
    }

    // Get the employee by ID
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({message: 'Employee not found'});
    }

    // Get today's attendance record for the specific employee
    const attendanceRecord = await Attendance.findOne({
      employeeId,
      date: currentDate,
    });

    const attendanceStatus = {
      employeeId: employee._id,
      employeeName: employee.employeeName,
      status: attendanceRecord ? attendanceRecord.status : 'Absent',
      mobileDetails: attendanceRecord ? attendanceRecord.mobileDetails : '',
      location: attendanceRecord ? attendanceRecord.location : '',
      checkOutMobileDetails: attendanceRecord
        ? attendanceRecord.checkOutMobileDetails
        : '',
      checkOutLocation: attendanceRecord
        ? attendanceRecord.checkOutLocation
        : '',
      checkIn: attendanceRecord ? attendanceRecord.checkIn : '',
      checkOut: attendanceRecord ? attendanceRecord.checkOut : '',
    };

    res.status(200).json(attendanceStatus);
  } catch (error) {
    console.error('Error fetching attendance status:', error);
    res.status(500).json({message: 'Failed to fetch attendance status'});
  }
});

app.post('/updateAttendance', async (req, res) => {
  try {
    const {employeeId, status, name} = req.body;
    const currentDate = moment().format('YYYY-MM-DD');

    if (!employeeId || !status) {
      return res
        .status(400)
        .json({message: 'Employee ID and status are required'});
    }

    // Find the existing attendance record for today or create a new one if status is 'Check In'
    let attendanceRecord = await Attendance.findOneAndUpdate(
      {employeeId, date: currentDate},
      {
        status,
        checkOut: status === 'Check Out' ? new Date().toISOString() : undefined,
      },
      {new: true},
    );

    if (!attendanceRecord && status === 'Check In') {
      // Create a new record if no existing record is found and the status is 'Check In'
      attendanceRecord = new Attendance({
        employeeId,
        employeeName: name,
        date: currentDate,
        status,
        checkIn: new Date().toISOString(),
      });
      await attendanceRecord.save();
    }

    if (!attendanceRecord) {
      return res.status(404).json({message: 'Attendance record not found'});
    }

    res.status(200).json({
      message: 'Attendance updated successfully',
      attendance: attendanceRecord,
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({message: 'Failed to update attendance'});
  }
});

// Endpoint for getting attendance history of a specific employee
app.get('/attendanceHistory', async (req, res) => {
  try {
    const {employeeId} = req.query;

    if (!employeeId) {
      return res.status(400).json({message: 'Employee ID is required'});
    }

    // Find attendance records for the given employee, sorted by date (newest first)
    const attendanceRecords = await Attendance.find({employeeId})
      .sort({date: -1})
      .exec();

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res
        .status(404)
        .json({message: 'No attendance records found for this employee'});
    }

    res.status(200).json({attendanceRecords});
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({message: 'Failed to fetch attendance history'});
  }
});

// Endpoint for updating employee details
app.put('/updateEmployee/:id', async (req, res) => {
  try {
    const {id} = req.params; // Get employee ID from URL parameters
    const {
      employeeName,
      designation,
      phoneNumber,
      dateOfBirth,
      joiningDate,
      activeEmployee,
      salary,
      address,
      basicSalary,
      houseRent,
      medicalAllowance,
      providentFund,
      pin,
    } = req.body; // Destructure updated employee details from the request body

    // Find the employee by ID and update the provided fields
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        employeeName,
        designation,
        phoneNumber,
        dateOfBirth,
        joiningDate,
        activeEmployee,
        salary,
        address,
        basicSalary,
        houseRent,
        medicalAllowance,
        providentFund,
        pin,
      },
      {new: true}, // Return the updated employee document
    );

    if (!updatedEmployee) {
      return res.status(404).json({message: 'Employee not found'});
    }

    res.status(200).json({
      message: 'Employee details updated successfully',
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({message: 'Failed to update employee'});
  }
});

app.delete('/deleteEmployee/:id', async (req, res) => {
  try {
    const {id} = req.params;

    if (!id) {
      return res.status(400).json({message: 'Employee ID is required'});
    }

    // Find and delete the employee
    const result = await Employee.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({message: 'Employee not found'});
    }

    res.status(200).json({message: 'Employee deleted successfully'});
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({message: 'Failed to delete employee'});
  }
});

app.get('/employee/:employeeId', async (req, res) => {
  try {
    const {employeeId} = req.params; // Get employeeId from the URL

    // Find the employee by ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({message: 'Employee not found'});
    }

    res.status(200).json({
      message: 'Employee details fetched successfully',
      employee,
    });
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).json({message: 'Failed to fetch employee details'});
  }
});

// POST route to save salary details
app.post(
  '/salary/:employeeId',
  upload.single('salarySlip'),
  async (req, res) => {
    try {
      const {employeeId} = req.params;
      const {salary, travelAllowance, loanRepayment} = req.body;

      // Find the employee by ID
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return res.status(404).json({message: 'Employee not found'});
      }

      // Update salary details in the employee record
      employee.currentSalary = salary;
      employee.travelAllowance = travelAllowance;
      employee.loanRepayment = loanRepayment;

      // If a salary slip is uploaded, save its path
      if (req.file) {
        const salarySlipPath = path.join('uploads', req.file.filename);
        employee.salarySlip = salarySlipPath;
      }

      // Save the updated employee record
      await employee.save();

      res.status(200).json({message: 'Salary details updated successfully'});
    } catch (error) {
      console.error('Error saving salary details:', error);
      res.status(500).json({message: 'Failed to save salary details'});
    }
  },
);
