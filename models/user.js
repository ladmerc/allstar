const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        index: true,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'is invalid']
    },
    isSubscribed: {type: Boolean, default: false},
    subscriptionId: {type: String, index: true}
  }, { timestamps: true });

  module.exports = mongoose.model('User', UserSchema);