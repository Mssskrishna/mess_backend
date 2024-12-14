const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet'); // Added for security
const complaintRoutes = require('./routes/complaints');
const feedbackRoutes = require('./routes/feedbacks');
const overdueRoutes = require('./routes/overdues');
const responseRoutes = require('./routes/responses');
const dotenv = require('dotenv');
const multer = require('multer');
const Dish = require('./models/Dish');
const User = require('./models/User');

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(helmet()); // Security middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultSecret', // Use environment variable
  resave: false,
  saveUninitialized: false
}));

// Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/overdues', overdueRoutes);
app.use('/api/feedbacks', feedbackRoutes);
const uploadFolder = path.join(__dirname, 'uploads');

// Serve images from the 'uploads' directory
app.use('/uploads', express.static(uploadFolder));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
console.log(`Connecting to MongoDB at: ${MONGO_URI.split('@')[1]}`);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit process on DB connection failure
    });



// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to store uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Rename file with timestamp for uniqueness
  },
});

const upload = multer({ storage });

// Route to Serve HTML File
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Ensure index.html is in the same directory
});

// Route to Handle File Upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Validate if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { day, mealType } = req.body;

    // Validate required fields
    if (!day || !mealType) {
      return res.status(400).json({ error: 'Day and mealType are required' });
    }

    // Save file details in the database
    const newFile = new Dish({
      day: day,
      time: mealType, // Assuming 'time' is supposed to store the meal type
      imageId: req.file.filename, // Use the uploaded file's name as ID or reference
    });

    await newFile.save();

    // Return success response
    res.status(201).json({
      message: 'File uploaded and saved successfully',
      fileId: req.file.filename,
      details: newFile,
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});



app.post('/users',upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const { username, password } = req.body;

    const imageId =  req.file.filename ;
    // Create a new user
    const newUser = new User({ username, password,imageId});
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(400).json({ error: 'Error creating user', details: err.message });
  }
});

async function getDayAndMeal() {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentTime = new Date();
  const day = days[currentTime.getDay()]; // Get the current day
  const hours = currentTime.getHours();

  let meal;

  if (hours >= 5 && hours < 11) {
    meal = "breakfast";  // 5 AM to 10:59 AM
  } else if (hours >= 11 && hours < 17) {
    meal = "lunch";      // 11 AM to 4:59 PM
  } else if (hours >= 17 && hours < 22) {
    meal = "dinner";     // 5 PM to 9:59 PM
  } else {
    meal = "breakfast";  // 10 PM to 4:59 AM
  }

  return { day, meal };
}


app.get('/mealImage',async (req,res)=>{
  const {day,meal} = await getDayAndMeal();
  console.log(day,meal)
  if (!day || !meal) {
    return res.status(400).json({ message: 'Day and time are required.' });
  }

  try {
    const dish = await Dish.findOne({ day, time:meal });

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found for the given day and time.' });
    }

    return res.json({ imageId: dish.imageId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }

});


app.get('/image/:id', (req, res) => {
  const imageId = req.params.id; // Extract the image ID from the request params
  const imagePath = path.join(__dirname, 'uploads', imageId); // Construct the full path to the file
    // Send the file as a response
    res.send(imagePath);

});


// Fallback route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
