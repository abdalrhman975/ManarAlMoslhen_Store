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
    setImagePreview(product.imageUrl ? `http://localhost:5000${product.imageUrl}` : null);
    setImage(null);
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

  return (
    <div>
      {/* نموذج إضافة وتعديل المنتجات */}
      <form onSubmit={handleSubmit} className="product-form">
        <h3>
          {editingProduct ? "✏️ تعديل بيانات المنتج" : "➕ إضافة منتج جديد"}
        </h3>
        <div className="form-fields">
          <input
            placeholder="اسم المنتج"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="لعبة">🎮 لعبة</option>
            <option value="كتاب">📚 كتاب</option>
            <option value="قرطاسية">✏️ قرطاسية</option>
            <option value="أخرى">📌 أخرى</option>
          </select>
          <input
            type="number"
            placeholder="السعر (نقاط)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="imageInput"
            />
            <label htmlFor="imageInput" className="upload-label">
              {imagePreview ? (
                <img src={imagePreview} alt="معاينة" className="preview-image" />
              ) : (
                <span>📷 اختر صورة</span>
              )}
            </label>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "⏳ جارٍ الحفظ..." : editingProduct ? "💾 حفظ التعديل" : "➕ إضافة المنتج"}
          </button>
          {editingProduct && (
            <button type="button" onClick={resetForm} className="btn-cancel">
              ❌ إلغاء
            </button>
          )}
        </div>
      </form>

      {/* جدول المنتجات */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>الصورة</th>
              <th>اسم المنتج</th>
              <th>التصنيف</th>
              <th>السعر</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  {p.imageUrl ? (
                    <img 
                      src={`http://localhost:5000${p.imageUrl}`} 
                      alt={p.name} 
                      className="product-thumb"
                    />
                  ) : (
                    <div className="product-thumb placeholder">🖼️</div>
                  )}
                </td>
                <td className="product-name-cell">
                  <span>{p.name}</span>
                </td>
                <td>{p.category}</td>
                <td className="price-cell">{p.price} نقطة</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => startEdit(p)}
                      className="btn-edit"
                      title="تعديل"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="btn-delete"
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