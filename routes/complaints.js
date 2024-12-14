const express = require('express');
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint'); 
const Response = require('../models/Response');
const router = express.Router();

function generateId() {
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const random = Math.random().toString(36).substring(2, 8); // Random alphanumeric
    return `${timestamp}-${random}`; // Example: 'lztw9q-jg5h3k'
}

// Route to handle complaint submission
router.post('/complaint', async (req, res) => {
    try {
        // Extracting complaint details from the request body
        const {
            Type,
            text,
           
            tag,
        } = req.body;

        const Id =  generateId();
        const image = "none";
        const status = "in-progress";
        // Create a new complaint entry
        const complaint = new Complaint({
            Id,
            Type,
            text,
            image,
            tag,
            status
        });

        // Save the complaint entry to the database
        const savedComplaint = await complaint.save();

        // Respond with the saved complaint details
        res.status(201).json({
            message: 'Complaint submitted successfully',
            data: savedComplaint
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit complaint', error });
    }
});

// Route to get complaint details by Id
router.get('/complaint/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findOne({ tag: id });

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.status(200).json({ data: complaint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve complaint', error });
    }
});

// Route to handle response submission
router.post('/response', async (req, res) => {
    try {
        // Extracting response details from the request body
        const {
            complaintId,
            response
        } = req.body;

        // Create a new response entry
        const newResponse = new Response({
            complaintId,
            response
        });

        // Save the response entry to the database
        const savedResponse = await newResponse.save();

        // Respond with the saved response details
        res.status(201).json({
            message: 'Response submitted successfully',
            data: savedResponse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit response', error });
    }
});

// Route to get response details by complaintId
router.get('/response/:complaintId', async (req, res) => {
    try {
        const { complaintId } = req.params;
        const response = await Response.findOne({ complaintId });

        if (!response) {
            return res.status(404).json({ message: 'Response not found for the given complaint ID' });
        }

        res.status(200).json({ data: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve response', error });
    }
});


module.exports = router;