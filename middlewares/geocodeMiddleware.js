const axios = require("axios");

async function geocodeMiddleware(req, res, next) {
  const { shippingAddress } = req.body;
  if (!shippingAddress) {
    return res.status(400).json({ error: "Shipping address is required" });
  }
  const fullAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country}, ${shippingAddress.postalCode}`;
  try {
    let res1 = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        fullAddress
      )}`,
      {
        headers: {
          "User-Agent": "my-doctor-appointment-app",
          "Accept-Language": "en",
        },
      }
    );
    if (res1.data.length > 0) {
      const { lat, lon } = res1.data[0];
      req.body.orderPlacedLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
      return next();
    }
    const fallbackAddress = `${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country}`;
    console.warn("Full address failed, trying fallback:", fallbackAddress);
    let res2 = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        fallbackAddress
      )}`,
      {
        headers: {
          "User-Agent": "my-doctor-appointment-app",
          "Accept-Language": "en",
        },
      }
    );
    if (res2.data.length > 0) {
      const { lat, lon } = res2.data[0];
      req.body.orderPlacedLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
      return next();
    }
    req.body.orderPlacedLocation = {
      latitude: null,
      longitude: null,
    };
    return next();
  } catch (err) {
    console.error("Geocode error:", err.message);
    req.body.orderPlacedLocation = {
      latitude: null,
      longitude: null,
    };
    next();
  }
}

module.exports = geocodeMiddleware;
