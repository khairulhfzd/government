const bcrypt = require("bcryptjs");

const hashedPassword =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
const plainPassword = "admin123";

(async () => {
  try {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log("Password valid:", isValid);

    if (!isValid) {
      // Try with salt rounds 10 like in seed.js
      const newHash = await bcrypt.hash("admin123", 10);
      console.log("Newly generated hash:", newHash);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
