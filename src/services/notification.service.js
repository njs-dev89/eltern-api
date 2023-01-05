import crypto from "crypto";
import axios from "axios";

const generateIdHash = (id) => {
  const hmac = crypto.createHmac("sha256", process.env.ONESIGNAL_REST_API_KEY);
  hmac.update(id);
  // or hmac.update(identifier);
  console.log(hmac.digest("hex"));
  return hmac.digest("hex");
};

const sendNotification = async (message) => {
  const options = {
    method: "POST",
    url: "https://onesignal.com/api/v1/notifications",
    headers: {
      accept: "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      "content-type": "application/json",
    },
    data: {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_external_user_ids: [message.userId],
      contents: { en: message.content },
      headings: { en: message.heading },
    },
  };
  if (message.imageUrl) {
    options.data.big_picture = message.imageUrl;
    options.data.ios_attachments = { id1: message.imageUrl };
  }
  try {
    return axios.request(options);
  } catch (e) {
    console.log(e);
  }
};

export { generateIdHash, sendNotification };
