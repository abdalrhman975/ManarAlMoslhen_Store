const mongoose = require("mongoose");

// دالة لتنظيف وتوحيد الألف في الاسم
const normalizeName = (val) => {
  if (typeof val !== "string") return val;
  return val
    .trim() 
    .replace(/[أإآ]/g, "ا"); 
};

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // إزالة المسافات تلقائياً بواسطة Mongoose
      set: normalizeName, // تطبق الدالة تلقائياً قبل الحفظ في قاعدة البيانات
    },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);