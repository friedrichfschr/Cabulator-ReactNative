import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: function() {
            // Password is only required if not using social auth
            return !this.appleToken && !this.appleUserId;
        }
    },
    appleToken: {
        type: String
    },
    appleUserId: {
        type: String,
        sparse: true,  // Allows for unique but null values
    },
    image: {
        type: String,
    },
    requests: [{
        from : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        }, 
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],

});

export const User = mongoose.model('User', userSchema);

