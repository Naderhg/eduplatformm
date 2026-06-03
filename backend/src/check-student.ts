import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from './models/user.model';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set!");
    return;
  }
  
  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");
  
  const studentId = '6a0cf2141cb53d43d5aee241';
  const student = await User.findById(studentId);
  if (!student) {
    console.log("Student not found in DB!");
  } else {
    console.log("Student Info:");
    console.log("Name:", student.name);
    console.log("Role:", student.role);
    console.log("Parent Phone in DB:", student.parentPhone);
  }
  
  await mongoose.connection.close();
}

run();
