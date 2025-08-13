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
const API_KEY = "851ee2036557883b14a629aa78894331bd1db831";
const API_URL = "https://api.platerecognizer.com/v1/plate-reader/";

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

    // Call the license plate recognition API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to recognize license plate');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const plate = data.results[0].plate.toUpperCase();
      const confidence = data.results[0].confidence;
      
      // Create parking data object
      const parkingData = {
        no: Date.now(),
        type: 'Car',
        noPlate: plate,
        timeIn: new Date().toLocaleTimeString(),
        timeOut: '-',
        duration: '-',
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

    res.status(500).json({
      success: false,
      message: 'Error processing license plate image',
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
