const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: Date, // Changed to Date type
    required: true,
  },
  dateOfBirth: {
    type: Date, // Changed to Date type
    required: true,
  },
  salary: {
    type: Number,
  },
  activeEmployee: {
    type: Boolean,
  },
  phoneNumber: {
    type: String,
  },
  address: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  basicSalary: {
    type: Number,
  },
  houseRent: {
    type: Number,
  },
  medicalAllowance: {
    type: Number,
  },
  providentFund: {
    type: Number,
  },
  travelAllowance: Number,
  loanRepayment: Number,
  salarySlip: String,
  pin: {
    type: Number,
    required: true,
  },
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
