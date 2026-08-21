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

  function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('/uploads')) {
      return `https://manaralmoslhen-store.onrender.com${imageUrl}`;
    }
    return imageUrl;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Header / Topbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, #2DAFBB 0%, #1C9BBB 100%)",
        padding: "16px 24px",
        borderRadius: "16px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
        borderBottom: "4px solid #EBC250",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "12px",
        position: "relative"
      }}>
        {/* القسم الأيسر: ترحيب + رصيد */}
        <div style={{ flex: "1", minWidth: "150px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", color: "white" }}>
            أهلاً بك، {student.name} 👋
          </h2>
          <span style={{ fontSize: "14px", color: "#f8fafc" }}>
            الرصيد المتاح: <strong style={{ fontSize: "18px", color: "#EBC250" }}>{remainingPoints} نقطة</strong>
          </span>
        </div>

        {/* القسم الأوسط: الشعار */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 1 auto"
        }}>
          <img
            src="/logo3.png"
            alt="شعار نادي سمو الصيفي"
            style={{
              height: "55px",
              width: "auto",
              objectFit: "contain",
              borderRadius: "12px",
              background: "white",
              padding: "6px 12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "2px solid #EBC250"
            }}
          />
        </div>

        {/* القسم الأيمن: السلة + خروج */}
        <div style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flex: "1",
          justifyContent: "flex-end",
          minWidth: "150px"
        }}>
          <Link to="/store/cart" style={{ textDecoration: "none" }}>
            <button style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "#EBC250",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(235, 194, 80, 0.3)"
            }}>
              🛒 السلة
              <span style={{
                // background: "#2DAFBB",
                color: "#2DAFBB",
                padding: "2px 10px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "bold"
              }}>
                {cartCount}
              </span>
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
              background: "white",
              color: "#dc2626",
              border: "1px solid #fecaca",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
             تسجيل الخروج
          </button>
        </div>
      </div>

      {warning && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "14px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #fecaca", fontWeight: "600" }}>
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
              padding: "10px 22px",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: category === c ? "#EBC250" : "#cbd5e1",
              background: category === c ? "#EBC250" : "#ffffff",
              color: category === c ? "white" : "#64748b",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.25s ease",
              boxShadow: category === c ? "0 4px 14px rgba(235, 194, 80, 0.35)" : "none"
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
            <div key={p._id} style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #f1f5f9",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)"
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
                      borderRadius: "10px",
                      marginBottom: "12px",
                      background: "#f8fafc"
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      const placeholder = document.createElement('div');
                      placeholder.style.cssText = `
                        width: 100%;
                        height: 160px;
                        background: #f8fafc;
                        border-radius: 10px;
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
                    background: "#f8fafc",
                    borderRadius: "10px",
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
                <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", color: "#64748b", fontWeight: "600" }}>{p.category}</span>
                <h3 style={{ margin: "8px 0 4px 0", fontSize: "16px", color: "#1e293b" }}>{p.name}</h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#2DAFBB" }}>{p.price} نقطة</p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "6px 12px", borderRadius: "8px", marginBottom: "12px", border: "1px solid #f1f5f9" }}>
                  <button onClick={() => setQty(p._id, qty(p._id) - 1)} style={{ borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "bold", padding: "2px 8px" }}>➖</button>
                  <span style={{ fontWeight: "700", color: "#1e293b" }}>{qty(p._id)}</span>
                  <button onClick={() => setQty(p._id, qty(p._id) + 1)} style={{ borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "bold", padding: "2px 8px" }}>➕</button>
                </div>

                <button
                  onClick={() => handleAddToCart(p, qty(p._id))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#2DAFBB",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(45, 175, 187, 0.2)"
                  }}
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