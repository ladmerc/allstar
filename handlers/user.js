const to = require('await-to-js').default;

const { Success, validateJSONBody, updateSubscriptionStatus, getUserLog, Failure } = require('./utils');

module.exports.subscriptionStatus = async (event, context, callback) => {
    /* Updates a user's subscription status
    *  Returns null
    *  NOTE: This is probably unsecure and only here for completion - We ideally should listen to a 
    *  webhook instead. The stripe.createWebhook and stripe.processWebhook handles this more correctly
    */
    context.callbackWaitsForEmptyEventLoop = false;

    const { status, data } = validateJSONBody(event, ['subscriptionId']);


    if (status !== 'OK') {
        return callback(null, Failure(data, 429));
    }
    await updateSubscriptionStatus(data.subscriptionId);
    
    callback(null, Success());
};

module.exports.userLog = async (event, context, callback) => {
    /* Gets a user's transaction log
    */
    context.callbackWaitsForEmptyEventLoop = false;
    const [error, logs] = await to(getUserLog(event.pathParameters.id));

    if (error) return callback(null, Failure(error));

    return callback(null, Success({ logs }))

};