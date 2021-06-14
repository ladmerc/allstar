const to = require('await-to-js').default;
const ObjectID = require('mongodb').ObjectID;

const connectToDatabase = require('../db');
const User = require('../models/user');
const UserLog = require('../models/log');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
}

const Success = (data, statusCode = 200) => ({ 
    body: data ? JSON.stringify(data) : "{}",
    statusCode: data ? statusCode : 204,
    headers
});

const Failure = (error, statusCode = 400) => {
    let message = error.message || 'An unexpected error occured'
    if (error && error.statusCode === 404) {
        message = 'Resource does not exist'
        statusCode = 404
    } else if ((error && error.statusCode >= 400 && error && error.statusCode <  500)) {
        message = error.message || 'Invalid data'
    } else if (!error && !statusCode) {
        statusCode = 500
    }
            
    return { 
        body: JSON.stringify({ message }),
        statusCode,
        headers
    }
};

const validateJSONBody = (event, keys) => {
    let requestBody;
    let message;
    try {
        requestBody = JSON.parse(event.body);
        (keys || []).some(key => {
            if (!requestBody[key] || !requestBody[key].trim()) {
                message = `Missing required ${key}`;
                return true
            }
        })
    } catch (e) {
        message = 'Invalid request body';
    }

    return { status: message ? 'ERROR' : 'OK', data: message ? { message } : requestBody }
      
}

class NotFoundError extends Error {
    statusCode = 404
}

const createUserLog = async (subscriptionId, type=UserLog.enumTypes.CONNECTED, email, description) => {
    if (!subscriptionId) throw new Error('subscriptionId required');

    await connectToDatabase();

    let userError, user;

    if (type === UserLog.enumTypes.CONNECTED && email) {
        [userError, user] = await to(User.create({ subscriptionId, email }));
    } else {
        [userError, user] = await to(User.findOne({ subscriptionId }));
    }
    
    if (userError) {
        console.error(`Error creating log for subscriptionId ${subscriptionId}`, userError);
        return;
    }
    
    if (!user) {
        console.error(`User with subscriptionId ${subscriptionId} not found`);
        return;
    }

    const [error, _] = await to (UserLog.create({ 
        user,
        type,
        description
    }))
    if (error) {
        console.error(`Failed to create '${type}' log for user: ${user.id}`);
    }
};

const updateSubscriptionStatus =  async(subscriptionId) => {
    if (!subscriptionId) throw new Error('subscriptionId required');
    await connectToDatabase();

    const [error, _] = await to(User.findOneAndUpdate({ subscriptionId }, { isSubscribed: true }));

    if (!error) createUserLog(subscriptionId, UserLog.enumTypes.SUBSCRIBED);
}

const getUserLog = async (identifier) => {
    return new Promise(async(resolve, reject) => {
        await connectToDatabase();
        let query

        // could use a lookup and aggregate if needed
        if (ObjectID.isValid(identifier)) {
            query = User.findById(identifier);
        } else {
            query = User.findOne().or([
                { email: identifier},
                { subscriptionId: identifier},
            ])
        }

        const [error, user] = await to(query);

        if (error || !user) {
            reject(error || new NotFoundError(`user with identifier ${identifier} does not exist`));
        } else {
            const [logError, logs] = await to(UserLog.find({ user }));
            if (logError) return reject(logError);

            resolve(logs.map(({ type, createdAt }) => ({ 
                type,
                createdAt
            })));
        }
    });
}

module.exports = { Success, Failure, validateJSONBody, createUserLog, updateSubscriptionStatus, getUserLog }