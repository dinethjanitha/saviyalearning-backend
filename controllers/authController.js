
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendMail } from '../services/mailService.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';

// In-memory stores for demo (use DB or cache in production)
const resetTokens = new Map();
const refreshTokens = new Map();


export const signup = async (req, res) => {
  try {
    const { email, password, name, country, region } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      passwordHash,
      profile: { name, country, region },
    });
    await user.save();
    // Email verification token (MongoDB)
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 3600000); // 24 hours
    await EmailVerificationToken.create({
      userId: user._id,
      token: verifyToken,
      expiresAt,
    });
    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verifyToken}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your email',
      html: `<p>Welcome, ${user.profile.name}! Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`,
    });
    // Send welcome mail
    await sendMail({
      to: user.email,
      subject: 'Welcome to the P2P Education System',
      html: `<p>Hi ${user.profile.name},<br>Welcome to our platform! We're glad to have you.</p>`,
    });
    res.status(201).json({ message: 'User registered. Verification email sent.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const accessToken = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET || 'refreshsecret',
      { expiresIn: '7d' }
    );
    refreshTokens.set(refreshToken, true);
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token || !refreshTokens.has(token)) {
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refreshsecret');
    const user = await User.findById(payload._id);
    if (!user) return res.status(401).json({ message: 'User not found.' });
    const newAccessToken = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, { userId: user._id, expires: Date.now() + 3600000 }); // 1 hour
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Hi ${user.profile.name},<br>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
    });
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Email verification endpoint
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }
    const tokenDoc = await EmailVerificationToken.findOne({ token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }
    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.verified = true;
    await user.save();
    await EmailVerificationToken.deleteOne({ _id: tokenDoc._id });
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const data = resetTokens.get(token);
    if (!data || data.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    const user = await User.findById(data.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    resetTokens.delete(token);
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const logout = (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) refreshTokens.delete(refreshToken);
  res.json({ message: 'Logged out.' });
};
