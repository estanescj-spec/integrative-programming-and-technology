const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((con) => console.log(`MongoDB connected: ${con.connection.host}`))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
};

module.exports = connectDatabase;