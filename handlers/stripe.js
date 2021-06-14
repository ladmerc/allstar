const Stripe = require('stripe');
const to = require('await-to-js').default;


const { stripeKey, stripePriceId, stripeWebhookSecret } = require('../config');
const { Success, Failure, validateJSONBody, createUserLog, updateSubscriptionStatus } = require('./utils');
const UserLog = require('../models/log');

const stripe = Stripe(stripeKey);

module.exports.getCustomer = async (event, context, callback) => {
    /* Get customer information, given the customer ID
    *  Returns stripe customer data
    */
    const [error, customer] = await to(stripe.customers.retrieve(event.pathParameters.id));
   
    if (error) return callback(null, Failure(eror));

    callback(null, Success({ customer }));
};

module.exports.createSubscription = async (event, context, callback) => {
    /* Creates a stripe subscription given a customer email and the price ID
    *  Returns:
    *       subscriptionId: string
    *       clientSecret: string
    */
    context.callbackWaitsForEmptyEventLoop = false;
    const { status, data } = validateJSONBody(event, ['email']);

    if (status !== 'OK') {
        return callback(null, Failure(data, 429));
    }

    const [customerError, customer] = await to(stripe.customers.create({ email: data.email }));

    if (customerError) return callback(null, Failure(customerError))

    const [subscriptionError, subscription] = await to(
        stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: stripePriceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent']
        })
    );

    if (subscriptionError) return callback(null, Failure(subscriptionError))
    
    await createUserLog(subscription.id, UserLog.enumTypes.CONNECTED, data.email);
    
    callback(null, Success({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
    }, 201));
    
};

module.exports.deleteSubscription = async (event, context, callback) => {
    /* Deletes a stripe subscription, given the subscription ID
    *  Returns nothing
    */
    context.callbackWaitsForEmptyEventLoop = false;
    const [error, _] = await to(stripe.subscriptions.del(event.pathParameters.id));

    if (error) return callback(null, Failure(error));
    
    await createUserLog(event.pathParameters.id, UserLog.enumTypes.UNSUBSCRIBED);

    callback(null, Success());

};

module.exports.createWebhook = async (event, context, callback) => {
    /* Creates a stripe webhook
    *  Returns nothing
    */
    const baseUrl = event.requestContext.domainName;
    const [error, _] = await to(stripe.webhookEndpoints.create({
        url: `https://${baseUrl}/secret-webhook`,
        enabled_events: [
          'invoice.payment_succeeded'
        ],
    }));

    if (error) return callback(null, Failure(error));

    callback(null, Success());
};

module.exports.processWebhook = async (event, context, callback) => {
    /* Processes a stripe webhook
    *  Returns nothing
    */
    context.callbackWaitsForEmptyEventLoop = false;
    const sig = request.headers['stripe-signature'];

    const [error, stripeEvent] = await to(stripe.webhooks.constructEvent(request.body, sig, stripeWebhookSecret));
    
    if (error) return callback(null, Failure(error)); 

    switch (stripeEvent.type) {
        case 'invoice.payment_succeeded':
            if (event.data.object['billing_reason'] === 'subscription_create') {
                await updateSubscriptionStatus(stripeEvent.data.object['subscription'])
            }
          break;
        default:
          console.error(`Unhandled event type ${stripeEvent.type}`);
    }

    callback(null, Success());
};