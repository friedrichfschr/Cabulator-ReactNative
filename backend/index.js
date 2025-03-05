import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createUser, getUsers, loginUser, sendRequest } from './controllers/user.controller.js';
import { authMiddleware } from './middleware/auth.middleware.js'; // Import the middleware

dotenv.config();
const app = express();
app.use(express.json());

// Public routes (no authentication required)

import userRoutes from './routes/user.route.js'
app.use("/users", userRoutes)

// Protected routes (authentication required)
app.get('/users/:userId', authMiddleware, getUsers);
app.post('/friend-request', authMiddleware, sendRequest);

// Other protected routes
// app.post('/messages', authMiddleware, sendMessage);
// app.get('/messages/:userId', authMiddleware, getMessages);
// app.get('/friend-requests/:userId', authMiddleware, getFriendRequests);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
})
.catch((error) => {
  console.log('Error connecting to MongoDB', error);
});

