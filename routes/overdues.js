const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');

const router = express.Router();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'n200573@rguktn.ac.in',
    pass: 'AJAY KUMAR MADAKA',
  },
});

// Function to send email
const sendEmail = async (complaint) => {
  try {
    const mailOptions = {
      from: 'n200573@rguktn.ac.in',
      to: 'n200634@rguktn.ac.in',
      subject: `Complaint Received: ${complaint.Id}`,
      text: `The following complaint is overdue: ${complaint.text}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent for complaint ID: ${complaint._id}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
  }
};

// Function to check and send email for overdue complaints
const checkComplaints = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const overdueComplaints = await Complaint.find({
      dateReceived: { $lte: sevenDaysAgo },
      isMailed: false,
    });

    for (const complaint of overdueComplaints) {
      await sendEmail(complaint);
      complaint.isMailed = true; // Mark as mailed
      await complaint.save();
    }
  } catch (error) {
    console.error(`Error checking complaints: ${error}`);
  }
};

// Schedule the task to run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to check overdue complaints');
  checkComplaints();
});

// Route to trigger the check manually
router.get('/check-complaints', async (req, res) => {
  await checkComplaints();
  res.send('Checked and mailed overdue complaints');
});


module.exports = router;
