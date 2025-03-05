import { User } from "../models/user.model.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

// Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

export const createUser = async (req, res) => {
  console.log("req.body: ", req.body)
  try {
    const {name, email, password} = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({message: "Please fill out all fields"});
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({message: "User with this email already exists"});
    }
    
    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = new User({name, email, password: hashedPassword});
    const user = await newUser.save();
    
    const token = jwt.sign({userId: user._id}, JWT_SECRET, { expiresIn: '180d' });
    res.status(201).json({token});

  } catch (error) {
    res.status(500).json({message: error.message});
    console.log("Error while creating user: ", error);
  }
}

export const loginUser = async (req, res) => {
  console.log("req.body: ", req.body)

  try {
    const {email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({message: "Please fill out all fields"});
    }
    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).json({message: "Invalid Email"});
    }
    
    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({message: "Invalid password"});
    }

    // Use consistent secret key for JWT
    const token = jwt.sign({userId: user._id}, JWT_SECRET, { expiresIn: '180d' });
    res.status(200).json({token});
  }catch (error) {
    res.status(500).json({message: error.message});
    console.log("Error while logging in user: ", error);
    }
  }

export const signInWithApple = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({message: "No credential received"});
    }
    
    
    // First, try to find the user by email (which may be provided on first sign-in)
    let user = null;
    
    if (credential.email) {
      user = await User.findOne({email: credential.email});
    }
    
    // If still no user found, try to find by Apple user ID
    const appleUserId = credential.user; // This is the stable user identifier Apple provides
    if (!user && appleUserId) {
      user = await User.findOne({appleUserId: appleUserId});
    }
    
    if (!user) {
      // No existing user found - create a new user
      // For new users, Apple should provide email and name (at least on first sign-in)
      if (!credential.email) {
        return res.status(400).json({
          message: "Unable to create account. Apple did not provide an email address."
        });
      }
      
      const newUser = new User({
        name: credential.fullName?.givenName || "Apple User",
        email: credential.email,
        appleUserId: appleUserId, // Store this stable ID for future lookups
      });
      
      const savedUser = await newUser.save();
      const token = jwt.sign({userId: savedUser._id}, JWT_SECRET, { expiresIn: '180d' });
      return res.status(201).json({token});
    } else {
      // User found - generate and return token
      const token = jwt.sign({userId: user._id}, JWT_SECRET, { expiresIn: '180d' });
      return res.status(200).json({token});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
    console.log("Error while logging in with Apple: ", error);
  }
}

export const getUsers = async (req, res) => {
    try {
      const {userId} = req.params;
      const users = await User.find({_id: {$ne: userId}});
      
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({message: error.message});
      console.log("Error while getting user: ", error)
    }
  }

export const sendRequest = async (req, res) => {
  try {
    const {senderId, receiverId, message} = req.body;

    // Validate inputs
    if (!senderId || !receiverId) {
      return res.status(400).json({message: "Sender and receiver IDs are required"});
    }

    // Find receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({message: "Receiver not found"});
    }

    // Find sender to verify it exists
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({message: "Sender not found"});
    }
    
    // Check if request already exists
    const existingRequest = receiver.requests.find(
      req => req.from.toString() === senderId
    );
    
    if (existingRequest) {
      return res.status(400).json({message: "Friend request already sent"});
    }
    
    // Add request to receiver's requests array
    receiver.requests.push({
      from: senderId,
      message: message || '',
      status: 'pending'
    });
    
    await receiver.save();
    res.status(200).json({message: "Friend request sent successfully"});
    
  } catch (error) {
    res.status(500).json({message: error.message});
    console.log("Error while sending request: ", error);
  }
}