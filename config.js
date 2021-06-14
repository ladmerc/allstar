module.exports = {
  stripeKey: process.env.STRIPE_KEY,
  stripePriceId: process.env.PRICE_ID_SUB,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripeWebhookPath: process.env.STRIPE_WEBHOOK_PATH,
  dbUrl: process.env.DB_URL
}