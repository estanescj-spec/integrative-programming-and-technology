const mongoose = require("mongoose");

const connectDatabase = () => {
  return mongoose
    .connect(process.env.DB_URI, { serverSelectionTimeoutMS: 5000 })
    .then((con) => {
      console.log(`MongoDB connected: ${con.connection.host}`);
    })
    .catch((err) => {
      console.error(err.message);
      console.error(err.reason);
      process.exit(1);
    });
};

module.exports = connectDatabase;
