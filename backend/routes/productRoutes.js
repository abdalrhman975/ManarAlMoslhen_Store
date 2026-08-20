const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// GET - جلب جميع المنتجات
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== "All" ? { category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - إضافة منتج جديد مع صورة
router.post("/", async (req, res) => {
  try {
    const upload = req.app.get("upload") || req.upload;
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        const { name, category, price } = req.body;
        let imageUrl = null;
        if (req.file) {
          imageUrl = `/uploads/${req.file.filename}`;
        }

        const product = new Product({
          name,
          category,
          price: Number(price),
          imageUrl,
        });

        await product.save();
        res.status(201).json(product);
      } catch (error) {
        // حذف الصورة إذا فشل الحفظ
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - تعديل منتج
router.put("/:id", async (req, res) => {
  try {
    const upload = req.app.get("upload") || req.upload;
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        const product = await Product.findById(req.params.id);
        if (!product) {
          return res.status(404).json({ message: "المنتج غير موجود" });
        }

        const { name, category, price } = req.body;
        let imageUrl = product.imageUrl;

        // إذا تم رفع صورة جديدة
        if (req.file) {
          // حذف الصورة القديمة
          if (product.imageUrl) {
            const oldPath = path.join(__dirname, "..", product.imageUrl);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
          imageUrl = `/uploads/${req.file.filename}`;
        }

        product.name = name || product.name;
        product.category = category || product.category;
        product.price = price ? Number(price) : product.price;
        product.imageUrl = imageUrl;

        await product.save();
        res.json(product);
      } catch (error) {
        // حذف الصورة الجديدة إذا فشل التعديل
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - حذف منتج
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    // حذف ملف الصورة
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, "..", product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;