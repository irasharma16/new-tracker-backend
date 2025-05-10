const express = require('express');
const router = express.Router();
const Employee = require('../models/employee')

// Function to generate the next employee code
const getNextEmployeeCode = async () => {
  try {
    const lastEmployee = await Employee.findOne().sort({ employeeCode: -1 }).exec();
    return lastEmployee ? lastEmployee.employeeCode + 1 : 1;
  } catch (error) {
    console.error('Error generating employee code:', error);
    throw error;
  }
};

// Get all non-deleted employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find({ isDeleted: false });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new employee
router.post('/', async (req, res) => {
  try {
    const { employeeName, cancelled } = req.body;

    if (!employeeName) {
      return res.status(400).json({ message: 'Employee Name is required.' });
    }

    const employeeCode = await getNextEmployeeCode();
    
    const employee = new Employee({
      employeeCode,
      employeeName,
      cancelled: cancelled || false, // Default to false if not provided
      isDeleted: false
    });

    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Error saving employee:', error);
    res.status(500).json({ message: 'Error saving employee', error: error.message });
  }
});

// Update an existing employee's details
router.put('/update/:id', async (req, res) => {
  try {
    const { employeeCode, employeeName, cancelled } = req.body;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { employeeCode, employeeName, cancelled },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Soft delete an employee
router.put('/softDelete/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true }, // Use isDeleted field for soft deletion
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Permanently delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee permanently deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;   //Emp Router