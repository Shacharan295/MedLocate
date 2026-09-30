const Notification = require('../models/Notification');
const Pharmacy = require('../models/Pharmacy');
const nodemailer = require('nodemailer');

// Setup optional Nodemailer transporter
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const sendEmailNotification = async (toEmail, subject, textContent) => {
  if (!transporter) {
    // Log for development tracking
    console.log(`[Email Mock/Dev] To: ${toEmail} | Subject: ${subject} | Content: ${textContent}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"MedLocate Health" <notifications@medlocate.health>',
      to: toEmail,
      subject,
      text: textContent
    });
  } catch (err) {
    console.warn(`[Nodemailer Warning] Failed to deliver email to ${toEmail}: ${err.message}`);
  }
};

const createNotification = async ({ userId, type, title, message, metadata = {} }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title: title || type.replace('_', ' '),
      message,
      metadata
    });
    return notification;
  } catch (err) {
    console.error(`[Notification Service Error]:`, err);
    return null;
  }
};

const notifyPharmacyStaff = async (pharmacyId, type, title, message, metadata = {}) => {
  try {
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy || !pharmacy.ownerId) return null;
    return await createNotification({
      userId: pharmacy.ownerId,
      type,
      title,
      message,
      metadata: { ...metadata, pharmacyId }
    });
  } catch (err) {
    console.error(`[Notification Service Pharmacy Error]:`, err);
    return null;
  }
};

const notifyPatient = async (patientId, type, title, message, metadata = {}) => {
  return await createNotification({
    userId: patientId,
    type,
    title,
    message,
    metadata
  });
};

module.exports = {
  createNotification,
  notifyPharmacyStaff,
  notifyPatient,
  sendEmailNotification
};
