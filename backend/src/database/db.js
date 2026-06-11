const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "pengaduan_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging:
      process.env.NODE_ENV === "development"
        ? (msg) => console.log(`[SQL] ${msg}`)
        : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 10000,
      idle: 5000,
      evict: 15000,
    },
    define: {
      timestamps: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },

    benchmark: false,
    retry: { max: 3 },
  },
);

module.exports = sequelize;
