require("dotenv").config();
const app = require("./app");
const sequelize = require("./database/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize
      .authenticate()
      .then(async () => {
        console.log("✅ Koneksi ke database MySQL berhasil.");
        // Sync models (alter: true will update tables without dropping them)
        try {
          await sequelize.sync({ alter: true });
          console.log("✅ Model database berhasil disinkronkan.");
        } catch (syncError) {
          // If sync fails due to constraint issues, try without alter
          console.warn(
            "⚠️ Sync dengan alter gagal, mencoba sync normal...",
            syncError.message,
          );
          await sequelize.sync();
          console.log("✅ Model database berhasil disinkronkan (mode normal).");
        }
      })
      .catch((err) => {
        console.warn(
          "⚠️ Gagal terhubung ke database MySQL. Server tetap berjalan menggunakan mock database/user fallback.",
          err.message,
        );
      });

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Gagal memulai server:", error.message);
    process.exit(1);
  }
}

startServer();
