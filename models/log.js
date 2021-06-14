const mongoose = require('mongoose');

const enumTypes = {
    CONNECTED: 'CONNECTED', 
    SUBSCRIBED: 'SUBSCRIBED',
    UNSUBSCRIBED: 'UNSUBSCRIBED',
    UPDATE: 'UPDATE',
}

// If we're not expecting a huge number per user, then it might be better to embed this in user instead
const UserLogSchema = new mongoose.Schema({
    description: {
        type: String, 
        maxlength: [250, 'maximum 250 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: Object.keys(enumTypes),
        default: enumTypes.CONNECTED
    }
}, {timestamps: true});

UserLogSchema.statics.enumTypes = enumTypes

module.exports = mongoose.model('UserLog', UserLogSchema);


