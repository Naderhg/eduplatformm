const mongoose = require('mongoose');
const Course = require('./src/models/course.model');

require('dotenv').config();

async function checkThumbnails() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/education-platform');
    console.log('Connected to MongoDB');
    
    const courses = await Course.find({}).select('title thumbnail').limit(5);
    console.log('Courses with thumbnails:');
    courses.forEach(course => {
      console.log(`Title: ${course.title}`);
      console.log(`Thumbnail: ${course.thumbnail}`);
      console.log('---');
    });
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkThumbnails();
