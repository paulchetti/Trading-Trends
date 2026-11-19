import path from 'path';
import fs from 'fs';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { sendKycSubmissionEmail } from '../services/emailService.js';
import { addKycSubmission, getUserByEmailOrUsername, getUserByReferralCode, createUser, updateUser } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const cleanExt = path.extname(file.originalname) || '.pdf';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + cleanExt);
  }
});

export const uploadKycDocs = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB per file
}).fields([
  { name: 'aadharFrontFile', maxCount: 1 },
  { name: 'aadharBackFile', maxCount: 1 },
  { name: 'aadharFile', maxCount: 1 },
  { name: 'panFile', maxCount: 1 }
]);

export async function submitKyc(req, res) {
  try {
    const { name, email, phone, dob, address, aadhar, pan, password, referralCode } = req.body;

    if (!name || !email || !phone || !dob || !address || !aadhar) {
      return res.status(400).json({ error: 'All personal identity fields are required' });
    }

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ error: 'Please create a secure password of at least 6 characters' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPan = (pan || 'N/A').trim();

    // Resolve referrer if referral code provided
    let verifiedReferrerId = null;
    if (referralCode && referralCode.trim()) {
      const foundReferrer = getUserByReferralCode(referralCode.trim()) || getUserByEmailOrUsername(referralCode.trim());
      if (foundReferrer) {
        verifiedReferrerId = foundReferrer.id;
      } else {
        verifiedReferrerId = referralCode.trim().toUpperCase();
      }
    }

    // Check if an existing account exists with this email
    const existingUser = getUserByEmailOrUsername(cleanEmail);
    let userId;

    if (existingUser) {
      if (existingUser.role === 'ADMIN' || existingUser.status === 'ACTIVE') {
        return res.status(400).json({
          error: 'An active account with this email address already exists. Please log in using the Trader Portal.'
        });
      }
      // If user exists with PENDING status, update password and information
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password.trim(), salt);
      updateUser(existingUser.id, {
        fullName: cleanName,
        phone: phone.trim(),
        dob: dob.trim(),
        address: address.trim(),
        aadharNo: aadhar.trim(),
        panNo: cleanPan,
        passwordHash,
        referredBy: verifiedReferrerId || existingUser.referredBy,
        status: 'PENDING_VERIFICATION'
      });
      userId = existingUser.id;
    } else {
      // Create the user account right now with PENDING_VERIFICATION status
      const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      const uniqueUsername = baseUsername + Math.floor(100 + Math.random() * 900);
      const newUser = createUser({
        username: uniqueUsername,
        email: cleanEmail,
        password: password.trim(),
        fullName: cleanName,
        phone: phone.trim(),
        dob: dob.trim(),
        address: address.trim(),
        aadharNo: aadhar.trim(),
        panNo: cleanPan,
        initialBalance: 200,
        dailyGrowthRate: 1,
        referredBy: verifiedReferrerId,
        status: 'PENDING_VERIFICATION'
      });
      userId = newUser.id;
    }

    const files = [];
    if (req.files?.aadharFrontFile?.[0]) {
      const f = req.files.aadharFrontFile[0];
      files.push({ originalname: `Aadhaar_Front_${f.originalname}`, filename: f.filename, path: f.path, label: 'Aadhaar (Front Side)' });
    }
    if (req.files?.aadharBackFile?.[0]) {
      const f = req.files.aadharBackFile[0];
      files.push({ originalname: `Aadhaar_Back_${f.originalname}`, filename: f.filename, path: f.path, label: 'Aadhaar (Back Side)' });
    }
    if (req.files?.aadharFile?.[0]) {
      const f = req.files.aadharFile[0];
      files.push({ originalname: f.originalname, filename: f.filename, path: f.path, label: 'Aadhaar Document' });
    }
    if (req.files?.panFile?.[0]) {
      const f = req.files.panFile[0];
      files.push({ originalname: `PAN_${f.originalname}`, filename: f.filename, path: f.path, label: 'PAN Card' });
    }

    const kycData = {
      userId,
      name: cleanName,
      email: cleanEmail,
      phone: phone.trim(),
      dob: dob.trim(),
      address: address.trim(),
      aadhar: aadhar.trim(),
      pan: cleanPan,
      referralCode: verifiedReferrerId,
      status: 'PENDING_VERIFICATION',
      files: files.map(f => ({ originalname: f.originalname, filename: f.filename, path: f.path, label: f.label }))
    };

    // Store in registry for admin verification
    const submissionEntry = addKycSubmission(kycData);

    // Send email dispatch with attachments to compliance admin
    await sendKycSubmissionEmail({ kycData, files });

    return res.status(200).json({
      success: true,
      submissionId: submissionEntry?.id || 'KYC-' + Date.now(),
      userId,
      name: cleanName,
      email: cleanEmail,
      message: 'Account successfully created and sent for compliance verification! When admin accepts your account, you will be eligible for investing. Please contact Customer Support with a screenshot of your confirmation.'
    });
  } catch (err) {
    console.error('KYC submission error:', err);
    return res.status(500).json({ error: 'Failed to process KYC application: ' + err.message });
  }
}
