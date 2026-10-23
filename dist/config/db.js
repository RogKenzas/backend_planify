"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connecté");
    }
    catch (error) {
        console.error(error);
    }
};
module.exports = connectDB;
//# sourceMappingURL=db.js.map