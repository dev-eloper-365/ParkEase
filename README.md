# ParkEase - License Plate Scanner

A comprehensive parking management system with automatic license plate recognition capabilities.

## Features

### 🚗 License Plate Scanner
- **Drag & Drop Upload**: Easy image upload with drag and drop functionality
- **AI Recognition**: Uses PlateRecognizer API for accurate license plate detection
- **Real-time Processing**: Instant results with confidence scores
- **Database Integration**: Automatically saves scan results to MongoDB
- **Recent Scans**: View history of recent license plate scans
- **Theme Support**: Dark and light mode support

### 📊 Dashboard Features
- **Admin Dashboard**: Complete parking management with search, filtering, and analytics
- **User Dashboard**: Simplified view with parking status and charts
- **Real-time Data**: Live parking occupancy and entry statistics
- **Responsive Design**: Works on desktop and mobile devices

## Routes

- `/` - Admin Dashboard
- `/user` - User Dashboard  
- `/scan-license-plate` - License Plate Scanner

## API Endpoints

### License Plate Scanning
- `POST /api/scan-license-plate` - Upload and process license plate image
- `GET /api/scan-license-plate` - Get recent scans

### Parking Data
- `GET /api/parkingData` - Get all parking records
- `POST /api/parkingData` - Add new parking record

### Occupancy Data
- `GET /api/occupancy` - Get occupancy statistics

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for data visualization
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Multer for file uploads
- PlateRecognizer API for license plate recognition

## Setup

1. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=8080
   ```

3. **Start Development Servers**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

## Usage

### Scanning License Plates
1. Navigate to `/scan-license-plate`
2. Drag and drop an image or click to upload
3. The system will automatically detect the license plate
4. Results are saved to the database with timestamp and block ID

### Navigation
- Use the camera icon in the Admin Dashboard to access the scanner
- Use the "Scan Plate" button in the User Dashboard
- Direct URL access: `/scan-license-plate`

## File Structure

```
ParkEase/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── LicensePlateScanner.tsx
│   │   │   └── ui/
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── routes/
│   │   ├── parkingRoutes.js
│   │   ├── occupancyRoutes.js
│   │   └── scanLicensePlate.js
│   ├── models/
│   │   ├── ParkingData.js
│   │   └── OccupancyData.js
│   └── server.js
└── README.md
```

## API Integration

The license plate scanner integrates with the PlateRecognizer API for accurate license plate detection. The system:

1. Accepts image uploads (JPG, PNG, GIF up to 5MB)
2. Sends images to PlateRecognizer API
3. Processes the response to extract license plate data
4. Saves results to MongoDB with metadata
5. Returns structured response with confidence scores

## Security Features

- File type validation (images only)
- File size limits (5MB max)
- Automatic file cleanup after processing
- Error handling and validation
- Secure API key management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
