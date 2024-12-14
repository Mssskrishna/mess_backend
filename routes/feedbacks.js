const express = require('express');
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

const router = express.Router();

// Route to handle feedback submission
router.post('/feedback', async (req, res) => {
    try {
        // Extracting feedback details from the request body
        const {
            studentId,
            timeliness,
            cleanliness,
            quality,
            hygiene,
            service,
            review
        } = req.body;

        // Create a new feedback entry
        const feedback = new Feedback({
            studentId,
            timeliness,
            cleanliness,
            quality,
            quantity,
            courtesy,
            hygiene,
            service,
            washbasin_cleanliness,
            review
        });

        // Save the feedback entry to the database
        const savedFeedback = await feedback.save();

        // Respond with the saved feedback details
        res.status(201).json({
            message: 'Feedback submitted successfully',
            data: savedFeedback
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit feedback', error });
    }
});
router.get('/average-feedback', async (req, res) => {
    try {
        // Aggregate feedbacks and calculate the average for each numeric field
        const averages = await Feedback.aggregate([
            {
                $group: {
                    _id: null, // We don't need to group by any specific field, we want overall averages
                    averageTimeliness: { $avg: '$timeliness' },
                    averageCleanliness: { $avg: '$cleanliness' },
                    averageQuality: { $avg: '$quality' },
                    averageHygiene: { $avg: '$hygiene' },
                    averageService: { $avg: '$service' },
                },
            },
        ]);

        // If averages exist, return them, else return a message indicating no feedbacks
        if (averages.length > 0) {
            res.json({
                success: true,
                data: averages[0], // Since we grouped by null, there will only be one result
            });
        } else {
            res.json({
                success: false,
                message: 'No feedbacks available to calculate averages.',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error calculating average feedback values.',
        });
    }
});
module.exports = router;
