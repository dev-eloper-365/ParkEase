const express = require("express");
const router = express.Router();
const ParkingData = require("../models/ParkingData");

router.get("/", async (req, res) => {
  try {
    const parkingData = await ParkingData.find().sort({ timeIn: -1 }).limit(20);
    res.json(parkingData);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Failed to retrieve parking data" });
  }
});

// DELETE /parkingData/:id - Delete a parking entry by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete the parking entry
    const deletedEntry = await ParkingData.findByIdAndDelete(id);
    
    if (!deletedEntry) {
      return res.status(404).json({ 
        success: false, 
        message: "Parking entry not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Parking entry deleted successfully",
      deletedEntry: deletedEntry
    });
    
  } catch (err) {
    console.error("Error deleting parking entry:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete parking entry",
      error: err.message 
    });
  }
});

module.exports = router;
