import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    timeStamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread',
        required: false
    },
    message: {
        type: String,
        required: true
    },
});

export const Message = mongoose.model('Message', messageSchema);
