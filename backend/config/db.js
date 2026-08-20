const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb+srv://abdalrhmanobeid19_db_user:aaabbb112233@mosque-cluster.1kqekdt.mongodb.net/?appName=mosque-cluster";
  await mongoose.connect(uri);
  console.log("MongoDB connected:", uri);
}

module.exports = connectDB;

