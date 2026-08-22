import { useState, useEffect } from "react";
import { api } from "../api.js";

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // حقول نموذج المنتج
  const [name, setName] = useState("");
  const [category, setCategory] = useState("لعبة");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await api.getProducts("All");
      setProducts(data);
    } catch (error) {
      console.error("خطأ في تحميل المنتجات:", error);
    }
  }

  function startEdit(product) {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    setImagePreview(product.imageUrl ? `https://manaralmoslhen-store.onrender.com${product.imageUrl}` : null);
    setImage(null);
  }

    function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('/uploads')) {
      return `https://manaralmoslhen-store.onrender.com${imageUrl}`;
    }
    return imageUrl;
  }

  function resetForm() {
    setEditingProduct(null);
    setName("");
    setCategory("لعبة");
    setPrice("");
    setImage(null);
    setImagePreview(null);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price);
      if (image) formData.append("image", image);

      if (editingProduct) {
        await api.updateProduct(editingProduct._id, formData);
      } else {
        await api.createProduct(formData);
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error("خطأ في حفظ المنتج:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        await api.deleteProduct(id);
        await loadProducts();
      } catch (error) {
        console.error("خطأ في حذف المنتج:", error);
        alert(error.message);
      }
    }
  }


   function handleFileUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
  
      setLoading(true);
      const reader = new FileReader();
  
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
  
          const formattedStudents = data.map((item) => ({
            name: item["اسم اللعبة"] || item["الاسم"] || item["name"] || "بدون اسم",
            category: String(item["التصنيف"] || item["النوع"]),
            price: Number(item["السعر"] || item["النقاط"] || item["points"] || 0),
          }));
  
          await api.bulkCreateProducts(formattedStudents);
          alert(`تمت إضافة ${formattedStudents.length} منتجات بنجاح! 🎉`);
          loadStudents();
        } catch (err) {
          alert("حدث خطأ أثناء قراءة الملف: " + err.message);
        } finally {
          setLoading(false);
          e.target.value = "";
        }
      };
  
      reader.readAsBinaryString(file);
    }

  return (
    <div>
      {/* نموذج إضافة وتعديل المنتجات */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          marginBottom: "24px"
        }}
      >
        <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>
          {editingProduct ? "✏️ تعديل بيانات المنتج" : "➕ إضافة منتج جديد"}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <input
            placeholder="اسم المنتج"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: "10px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              color: "#1e293b"
            }}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: "10px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              background: "#ffffff",
              color: "#1e293b"
            }}
          >
            <option value="لعبة">🎮 لعبة</option>
            <option value="كتاب">📚 كتاب</option>
            <option value="قرطاسية">✏️ قرطاسية</option>
            <option value="قرطاسية">🚨 إلكترونيات </option>
            <option value="أخرى">📌 أخرى</option>
          </select>

          <input
            type="number"
            placeholder="السعر (نقاط)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{
              padding: "10px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              color: "#1e293b"
            }}
          />

          {/* رافع الصورة */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="imageInput"
              style={{ display: "none" }}
            />
            <label
              htmlFor="imageInput"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #cbd5e1",
                borderRadius: "10px",
                cursor: "pointer",
                background: "#f8fafc",
                height: "42px",
                padding: "0 10px",
                fontSize: "13px",
                color: "#64748b",
                overflow: "hidden"
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="معاينة"
                  style={{ height: "32px", width: "32px", objectFit: "cover", borderRadius: "6px" }}
                />
              ) : (
                <span>📷 اختر صورة</span>
              )}
            </label>
          </div>
        </div>

        {/* أزرار الحفظ والإلغاء */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {editingProduct && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                background: "#f1f5f9",
                color: "#64748b",
                border: "1px solid #cbd5e1",
                padding: "10px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              ❌ إلغاء
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2DAFBB",
              color: "white",
              border: "none",
              padding: "10px 24px",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 2px 6px rgba(45, 175, 187, 0.3)",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "⏳ جارٍ الحفظ..." : editingProduct ? "💾 حفظ التعديل" : "➕ إضافة المنتج"}
          </button>
        </div>
      </form>

      {/* جدول عرض المنتجات */}
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)", overflowX: "auto" }}>
        <label
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                padding: "8px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              {loading ? "⏳ جاري الاستيراد..." : "📤 استيراد من Excel"}
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                // onChange={handleFileUpload}
                style={{ display: "none" }}
                disabled={loading}
              />
            </label>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", textAlign: "right" }}>
          <thead>
            <tr style={{ background: "#f8fafc", fontSize: "13px", color: "#475569" }}>
              {/* <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>الصورة</th> */}
              <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>اسم المنتج</th>
              <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>التصنيف</th>
              <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>السعر</th>
              <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              
              <tr key={p._id}>
                {/* <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", width: "60px" }}>
                  {p.imageUrl ? (
                    <img
                      src={`https://manaralmoslhen-store.onrender.com${p.imageUrl}`}
                      alt={p.name}
                      style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    />
                  ) : (
                    <div style={{ width: "44px", height: "44px", background: "#f1f5f9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                      🖼️
                    </div>
                  )}
                </td> */}
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: "600", color: "#0f172a" }}>
                  {p.name}
                </td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontSize: "13px", color: "#475569" }}>
                  <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "6px" }}>
                    {p.category}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: "700", color: "#2DAFBB" }}>
                  {p.price} نقطة
                </td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => startEdit(p)}
                      title="تعديل"
                      style={{
                        background: "#f1f5f9",
                        color: "#2DAFBB",
                        border: "1px solid #cbd5e1",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{
                        background: "#fef2f2",
                        color: "#ef4444",
                        border: "1px solid #fecaca",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}