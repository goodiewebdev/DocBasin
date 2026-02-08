const { Checkout } = require("@polar-sh/express");

const createCheckoutSession = Checkout(async (req) => {
  const { products, customerId, metadata } = req.query;

  let parsedMetadata = {};
  if (metadata) {
    try {
      parsedMetadata = typeof metadata === 'string' 
        ? JSON.parse(decodeURIComponent(metadata)) 
        : metadata;
    } catch (e) {
      console.error("Failed to parse metadata JSON", e);
    }
  }

  return {
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    successUrl: process.env.SUCCESS_URL,
    server: "sandbox", 
    theme: "dark",
    products: Array.isArray(products) ? products : [products],
    customerId: customerId,
    metadata: parsedMetadata,
  };
});

module.exports = { createCheckoutSession };