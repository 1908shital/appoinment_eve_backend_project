const createPaymentSchema = {
  booking_id: { required: true },
  mop: { required: true },
  amount: { required: true },
};

const webhookSchema = {
  event_id: { required: true },
  payment_id: { required: true },
  status: { required: true },
};

module.exports = {
  createPaymentSchema,
  webhookSchema,
};
