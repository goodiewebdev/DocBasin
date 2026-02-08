const { Checkout } = require("@polar-sh/express");

export const createCheckoutSession = Checkout((req) => {
  const { 
    products, 
    customerId,
    metadata,
  } = req.query;

  let parsedMetadata = {};
  if (typeof metadata === 'string') {
    try {
      parsedMetadata = JSON.parse(decodeURIComponent(metadata));
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