const stripe = require('stripe')

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

const Stripe = stripe(STRIPE_SECRET_KEY)
module.exports = Stripe