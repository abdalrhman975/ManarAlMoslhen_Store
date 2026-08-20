import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

const CATEGORIES = ["All", "لعبة", "كتاب", "قرطاسية", "أخرى"];

export default function Market({ student, setStudent, onLogout, cart, addToCart }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [quantities, setQuantities] = useState({});
  const [warning, setWarning] = useState("");

  useEffect(() => {
    api.getProducts(category).then(setProducts);
  }, [category]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotalPoints = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const remainingPoints = student.points - cartTotalPoints;

  const qty = (id) => quantities[id] ?? 1;
  const setQty = (id, val) => setQuantities((prev) => ({ ...prev, [id]: Math.max(1, val) }));

  function handleAddToCart(product, quantity) {
    setWarning("");
    const itemCost = product.price * quantity;
    if (remainingPoints < itemCost) {
      setWarning(`عذراً، رصيدك المتاح (${remainingPoints} نقطة) لا يكفي لإضافة هذا المنتج.`);
      return;
    }
    addToCart(product, quantity);
  }

  // دالة للحصول على رابط الصورة الكامل
  function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    // إذا كان الرابط يبدأ بـ /uploads أضف الـ base URL
    if (imageUrl.startsWith('/uploads')) {
      return `http://localhost:5000${imageUrl}`;
    }
    return imageUrl;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "var(--surface)",
        padding: "20px 24px",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--border-color)",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "var(--text-primary)" }}>أهلاً بك، {student.name} 👋</h2>
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            الرصيد المتاح: <strong style={{ color: "var(--primary)", fontSize: "16px" }}>{remainingPoints} نقطة</strong>
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link to="/store/cart" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              🛒 السلة <span style={{color: "white", padding: "2px 8px", fontSize: "12px" }}>{cartCount}</span>
            </button>
          </Link>

          <button
            onClick={() => {
              if (onLogout) onLogout();
              else {
                localStorage.removeItem("mosque_student");
                localStorage.removeItem("mosque_cart");
                setStudent(null);
              }
            }}
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              padding: "10px 16px",
              borderRadius: "var(--radius-sm)",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            🚪 خروج
          </button>
        </div>
      </div>

      {warning && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "20px", border: "1px solid #fecaca", fontWeight: "600" }}>
          ⚠️ {warning}
        </div>
      )}

      {/* Categories Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: "8px 20px",
              borderRadius: "var(--radius-md)",
              border: "1px solid",
              borderColor: category === c ? "var(--primary)" : "var(--border-color)",
              background: category === c ? "var(--primary)" : "var(--surface)",
              color: category === c ? "white" : "var(--text-secondary)",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            {c === "All" ? "الكل" : c}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
        {products.map((p) => {
          const imageUrl = getImageUrl(p.imageUrl);
          return (
            <div key={p._id} className="card-hover" style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <div>
                {/* صورة المنتج */}
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={p.name} 
                    style={{ 
                      width: "100%", 
                      height: "160px", 
                      objectFit: "cover", 
                      borderRadius: "var(--radius-md)", 
                      marginBottom: "12px",
                      background: "#f1f5f9"
                    }}
                    onError={(e) => {
                      // إذا فشل تحميل الصورة، اعرض placeholder
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      const placeholder = document.createElement('div');
                      placeholder.style.cssText = `
                        width: 100%;
                        height: 160px;
                        background: #f1f5f9;
                        border-radius: var(--radius-md);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #94a3b8;
                        margin-bottom: 12px;
                        font-size: 14px;
                      `;
                      placeholder.textContent = '📷 لا توجد صورة';
                      parent.appendChild(placeholder);
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: "100%", 
                    height: "160px", 
                    background: "#f1f5f9", 
                    borderRadius: "var(--radius-md)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: "#94a3b8", 
                    marginBottom: "12px", 
                    fontSize: "14px" 
                  }}>
                    📷 لا توجد صورة
                  </div>
                )}
                <span style={{ fontSize: "12px", background: "var(--bg-main)", padding: "4px 10px", borderRadius: "6px", color: "var(--text-secondary)", fontWeight: "600" }}>{p.category}</span>
                <h3 style={{ margin: "8px 0 4px 0", fontSize: "16px", color: "var(--text-primary)" }}>{p.name}</h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "var(--accent)" }}>{p.price} نقطة</p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-main)", padding: "6px 12px", borderRadius: "var(--radius-sm)", marginBottom: "12px" }}>
                  <button onClick={() => setQty(p._id, qty(p._id) - 1)} style={{ borderRadius: "6px", border: "1px solid var(--border-color)", background: "white", cursor: "pointer", fontWeight: "bold" }}>➖</button>
                  <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{qty(p._id)}</span>
                  <button onClick={() => setQty(p._id, qty(p._id) + 1)} style={{ borderRadius: "6px", border: "1px solid var(--border-color)", background: "white", cursor: "pointer", fontWeight: "bold" }}>➕</button>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => handleAddToCart(p, qty(p._id))}
                  style={{ width: "100%" }}
                >
                  أضف للسلة
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}