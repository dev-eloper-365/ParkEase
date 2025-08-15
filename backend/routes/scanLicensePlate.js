const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// License plate recognition API configuration
const API_KEY = "d27ffe7c90f98ab6f23879ec61b3871ed0fcc8b4";
const API_URL = "https://api.platerecognizer.com/v1/plate-reader/";

// Validate API key
if (!API_KEY || API_KEY === "your_api_key_here") {
  console.error('Warning: Invalid or missing API key for license plate recognition');
}

// POST /scan-license-plate - Upload and process license plate image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // Create form data for the license plate recognition API
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('upload', fs.createReadStream(req.file.path));
    
    console.log('File uploaded:', req.file.originalname, 'Size:', req.file.size, 'bytes');
    console.log('Form data headers:', formData.getHeaders());

    // Call the license plate recognition API
    console.log('Calling external API with key:', API_KEY ? 'Present' : 'Missing');
    console.log('API URL:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('External API response status:', response.status);
    console.log('External API response headers:', response.headers.raw());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API Error Response:', errorText);
      throw new Error(`External API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const plate = data.results[0].plate.toUpperCase();
      const confidence = data.results[0].confidence;
      
      // Generate random timeout time between 8am to 7pm
      const now = new Date();
      const timeIn = new Date();
      
      // Set random timeout between 8am to 7pm (same day)
      const randomTimeout = new Date();
      randomTimeout.setHours(8 + Math.floor(Math.random() * 11)); // 8am to 7pm (8-18)
      randomTimeout.setMinutes(Math.floor(Math.random() * 60)); // Random minutes
      randomTimeout.setSeconds(Math.floor(Math.random() * 60)); // Random seconds
      
      // Ensure timeout is after current time
      if (randomTimeout <= timeIn) {
        randomTimeout.setHours(timeIn.getHours() + 1 + Math.floor(Math.random() * 6)); // 1-6 hours after current time
      }
      
      // Calculate duration in hours and minutes
      const durationMs = randomTimeout.getTime() - timeIn.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const duration = `${durationHours}h ${durationMinutes}m`;
      
      // Create parking data object
      const parkingData = {
        no: Date.now(),
        type: 'Car',
        noPlate: plate,
        timeIn: timeIn.toLocaleTimeString(),
        timeOut: randomTimeout.toLocaleTimeString(),
        duration: duration,
        blockId: '0x' + Math.random().toString(16).slice(2, 10),
        confidence: confidence,
        imagePath: req.file.path,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to MongoDB using the existing ParkingData model
      const ParkingData = require('../models/ParkingData');
      const savedData = await ParkingData.create(parkingData);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        message: 'License plate recognized and data saved successfully',
        data: {
          plate: plate,
          confidence: confidence,
          parkingId: savedData._id,
          timeIn: parkingData.timeIn,
          timeOut: parkingData.timeOut,
          duration: parkingData.duration,
          blockId: parkingData.blockId
        }
      });

    } else {
      // Clean up uploaded file if no plate detected
      fs.unlinkSync(req.file.path);
      
      res.status(404).json({
        success: false,
        message: 'No license plate detected in the image'
      });
    }

  } catch (error) {
    console.error('Error processing license plate:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Provide more specific error messages based on error type
    let errorMessage = 'Error processing license plate image';
    let statusCode = 500;
    
    if (error.message.includes('External API error')) {
      if (error.message.includes('401')) {
        errorMessage = 'Invalid API key for license plate recognition service';
        statusCode = 401;
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded for license plate recognition service';
        statusCode = 429;
      } else if (error.message.includes('500')) {
        errorMessage = 'License plate recognition service is temporarily unavailable';
        statusCode = 503;
      } else {
        errorMessage = 'License plate recognition service error: ' + error.message.split(' - ')[1];
        statusCode = 502;
      }
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Unable to connect to license plate recognition service';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

// GET /scan-license-plate - Get recent scans (optional)
router.get('/', async (req, res) => {
  try {
    const ParkingData = require('../models/ParkingData');
    const recentScans = await ParkingData.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('noPlate timeIn blockId createdAt');

    res.json({
      success: true,
      data: recentScans
    });
  } catch (error) {
    console.error('Error fetching recent scans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent scans',
      error: error.message
    });
  }
});

module.exports = router;
