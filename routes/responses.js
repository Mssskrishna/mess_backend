const express = require('express');
const Response = require('../models/Response'); // Import the Mongoose model

const router = express.Router();

// POST Route: Add a New Response
const Complaint = require('../models/Complaint'); // Import the Complaint model

router.post('/', async (req, res) => {
  try {
    const { complaintId, response } = req.body;

    if (!complaintId || !response) {
      return res.status(400).json({ message: 'Complaint ID and response are required' });
    }

    // Check if the complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Update the complaint status to "completed"
    complaint.status = 'completed';
    await complaint.save();

    // Save the new response
    const newResponse = new Response({ complaintId, response });
    await newResponse.save();

    res.status(201).json({
      message: 'Response created and complaint status updated to completed',
      response: newResponse,
    });
  } catch (error) {
    console.error('Error creating response or updating complaint:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET Route: Retrieve All Responses or Filter by Complaint ID
router.get('/', async (req, res) => {
  try {
    const { complaintId } = req.query;

    let filter = {};
    if (complaintId) {
      filter.complaintId = complaintId;
    }

    const responses = await Response.find(filter);
    res.status(200).json({ responses });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
