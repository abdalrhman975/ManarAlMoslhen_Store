const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET - جلب جميع المنتجات
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== "All" ? { category: category.trim() } : {};
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
      if (err) return res.status(400).json({ message: err.message });

      try {
        const { name, category, price } = req.body;
        
        // حفظ مسار نسبي دائماً لتسهيل النقل بين المحلية وRender
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const product = new Product({
          name: name ? name.trim() : "",
          category: category ? category.trim() : "أخرى",
          price: Number(price) || 0,
          imageUrl,
        });

        await product.save();
        res.status(201).json(product);
      } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
      if (err) return res.status(400).json({ message: err.message });

      try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

        const { name, category, price } = req.body;
        let imageUrl = product.imageUrl;

        if (req.file) {
          if (product.imageUrl && product.imageUrl.includes("/uploads/")) {
            const filename = product.imageUrl.split("/uploads/")[1];
            const oldPath = path.join(__dirname, "..", "uploads", filename);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          imageUrl = `/uploads/${req.file.filename}`;
        }

        product.name = name ? name.trim() : product.name;
        product.category = category ? category.trim() : product.category;
        product.price = price !== undefined ? Number(price) : product.price;
        product.imageUrl = imageUrl;

        await product.save();
        res.json(product);
      } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

    if (product.imageUrl && product.imageUrl.includes("/uploads/")) {
      const filename = product.imageUrl.split("/uploads/")[1];
      const imagePath = path.join(__dirname, "..", "uploads", filename);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - استيراد منتجات متعددة
router.post("/bulk", async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "الملف فارغ أو غير صالح" });
    }

    const validProducts = products
      .map((p) => {
        const cleanImg = p.imageUrl ? String(p.imageUrl).trim() : null;
        return {
          name: p.name ? String(p.name).trim() : "",
          category: p.category ? String(p.category).trim() : "أخرى",
          price: Number(p.price) || 0,
          imageUrl: cleanImg && cleanImg !== "" ? cleanImg : null,
        };
      })
      .filter((p) => p.name !== "");

    if (validProducts.length === 0) {
      return res.status(400).json({ message: "لا توجد بيانات صالحة للاستيراد" });
    }

    const createdProducts = await Product.insertMany(validProducts, { ordered: false });

    res.json({
      message: "تم استيراد المنتجات بنجاح",
      count: createdProducts.length,
    });
  } catch (err) {
    if (err.insertedDocs && err.insertedDocs.length > 0) {
      return res.json({
        message: "تم استيراد المنتجات الصالحة وتجاهل العناصر المكررة/الخاطئة",
        count: err.insertedDocs.length,
      });
    }

    res.status(500).json({ message: err.message });
  }
});

module.exports = router;