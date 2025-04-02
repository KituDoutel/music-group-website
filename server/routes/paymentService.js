const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  static async createSubscription(userId, plan, paymentMethodId) {
    try {
      // Buat customer di Stripe
      const customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email: await this.getUserEmail(userId),
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Buat subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: this.getPlanPriceId(plan) }],
        expand: ['latest_invoice.payment_intent']
      });

      // Simpan ke database
      await this.saveSubscription(
        userId, 
        plan, 
        subscription.id,
        subscription.current_period_end
      );

      return {
        status: subscription.status,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (err) {
      throw new Error(`Payment failed: ${err.message}`);
    }
  }

  static async getUserEmail(userId) {
    const [user] = await query('SELECT email FROM users WHERE id = ?', [userId]);
    return user.email;
  }

  static getPlanPriceId(plan) {
    const prices = {
      premium: process.env.STRIPE_PREMIUM_PRICE_ID,
      pro: process.env.STRIPE_PRO_PRICE_ID
    };
    return prices[plan];
  }

  static async saveSubscription(userId, plan, subscriptionId, endDate) {
    await query(
      `INSERT INTO subscriptions 
       (user_id, plan, start_date, end_date, payment_status)
       VALUES (?, ?, NOW(), FROM_UNIXTIME(?), 'active')
       ON DUPLICATE KEY UPDATE
       plan = VALUES(plan),
       end_date = VALUES(end_date),
       payment_status = VALUES(payment_status)`,
      [userId, plan, endDate]
    );
  }
}