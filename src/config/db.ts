import mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to the database");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;