const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Order = require("../models/Order");

// دالة توليد كلمة سر عشوائية من 5 أرقام
const generate5DigitPassword = () => Math.floor(10000 + Math.random() * 90000).toString();

// 1. تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const student = await Student.findOne({ name, password });
    if (!student) return res.status(400).json({ message: "اسم الطالب أو كلمة المرور غير صحيحة" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. جلب كافة الطلاب
router.get("/", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// 3. إضافة طالب يدوياً (توليد 5 أرقام برمجياً إذا لم ترفق كلمة سر)
router.post("/", async (req, res) => {
  try {
    const studentData = {
      ...req.body,
      password: req.body.password || generate5DigitPassword(),
    };
    const newStudent = new Student(studentData);
    await newStudent.save();
    res.json(newStudent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. استيراد طلاب من Excel (توليد كلمة سر 5 أرقام لكل طالب)
router.post("/bulk", async (req, res) => {
  try {
    const students = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "الملف فارغ أو غير صالح" });
    }

    const processedStudents = students.map((s) => ({
      ...s,
      password: s.password && String(s.password).trim() !== "" ? String(s.password) : generate5DigitPassword(),
    }));

    const createdStudents = await Student.insertMany(processedStudents);
    res.json({ message: "تم استيراد الطلاب بنجاح", count: createdStudents.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. تعديل طالب
router.put("/:id", async (req, res) => {
  const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// 6. حذف طالب
router.delete("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    await Student.findByIdAndDelete(studentId);
    await Order.deleteMany({ student: studentId });
    res.json({ message: "تم حذف الطالب وطلباته بنجاح" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;