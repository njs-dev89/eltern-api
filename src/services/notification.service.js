import crypto from "crypto";
const generateIdHash = (id) => {
  const hmac = crypto.createHmac("sha256", ONESIGNAL_REST_API_KEY);
  hmac.update(id);
  // or hmac.update(identifier);
  console.log(hmac.digest("hex"));
  return hmac.digest("hex");
};

export { generateIdHash };
