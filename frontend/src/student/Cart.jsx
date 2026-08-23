import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Cart({ 
  student, 
  setStudent, 
  cart = [], 
  removeFromCart, 
  clearCart, 
  updateQuantity 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastOrder, setLastOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // حالة الإشعار الاحترافي (Toast)
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  // اعتماد السلة المزامنة من بيانات الطالب بالداتابيز أولاً، ثم الـ Prop
  const currentCart = student?.cart || cart || [];
  const totalPoints = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // جلب تاريخ الطلبات عند تحميل الصفحة
  useEffect(() => {
    fetchOrderHistory();
  }, [student?._id, student?.id]);

  // إخفاء الإشعار تلقائياً بعد 3.5 ثانية
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  async function fetchOrderHistory() {
    const studentId = student?._id || student?.id;
    if (!studentId) return;
    
    setLoadingHistory(true);
    try {
      const orders = await api.getStudentOrders(studentId);
      setOrderHistory(orders || []);
    } catch (err) {
      console.error("خطأ في جلب تاريخ الطلبات:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleQuantityChange(productId, currentQty, delta) {
    const newQty = currentQty + delta;
    const studentId = student?._id || student?.id;

    if (newQty <= 0) {
      await handleRemoveItem(productId);
      return;
    }

    try {
      if (api.updateCartQuantity && studentId) {
        const res = await api.updateCartQuantity(studentId, productId, newQty);
        if (res?.student) {
          setStudent(res.student);
          localStorage.setItem("mosque_student", JSON.stringify(res.student));
        }
      } else if (updateQuantity) {
        updateQuantity(productId, newQty);
      }
    } catch (err) {
      showToast("حدث خطأ أثناء تعديل الكمية", "warning");
    }
  }

  async function handleRemoveItem(productId) {
    const studentId = student?._id || student?.id;
    try {
      if (api.removeFromCart && studentId) {
        const res = await api.removeFromCart(studentId, productId);
        if (res?.student) {
          setStudent(res.student);
          localStorage.setItem("mosque_student", JSON.stringify(res.student));
        }
      } else if (removeFromCart) {
        removeFromCart(productId);
      }
      showToast("تمت إزالة المنتج من السلة", "success");
    } catch (err) {
      showToast("حدث خطأ أثناء إزالة المنتج", "warning");
    }
  }

  async function handleCheckout() {
    if (currentCart.length === 0) return;

    if ((student?.points || 0) < totalPoints) {
      showToast("نقاطك الحالية لا تكفي لإتمام هذا الطلب!", "warning");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const studentId = student?._id || student?.id;
      const res = await api.submitOrder(studentId, currentCart);

      if (res && res.student) {
        setStudent(res.student);
        localStorage.setItem("mosque_student", JSON.stringify(res.student));
      }

      const newOrder = {
        items: [...currentCart],
        total: totalPoints,
        date: new Date().toLocaleString("ar-EG", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        orderId: res?.order?._id || Date.now()
      };

      setLastOrder(newOrder);
      setOrderHistory(prev => [newOrder, ...prev]);

      if (clearCart) clearCart();

      showToast("تم تأكيد الطلب وخصم النقاط بنجاح! 🎉", "success");
    } catch (err) {
      const errMsg = err?.message || "حدث خطأ أثناء الشراء";
      setError(errMsg);
      showToast(errMsg, "warning");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px", position: "relative" }}>
      
      {/* 🔔 الإشعار الاحترافي العائم (Toast Notification) */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 22px",
          borderRadius: "14px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          background: toast.type === "success" ? "#059669" : "#dc2626",
          color: "#ffffff",
          fontWeight: "600",
          fontSize: "15px",
          animation: "toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          minWidth: "300px",
          maxWidth: "90%",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>
              {toast.type === "success" ? "✅" : "⚠️"}
            </span>
            <span>{toast.message}</span>
          </div>

          <button
            onClick={() => setToast(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: "1",
              opacity: 0.8
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* حركة أنيميشن الإشعار */}
      <style>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translate(-50%, -20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        background: "var(--surface)",
        padding: "16px 20px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)"
      }}>
        <h2 style={{ margin: 0, fontSize: "20px", color: "var(--text-primary)" }}>🛒 سلة التسوق</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {student && (
            <span style={{ fontSize: "14px", color: "var(--accent)", fontWeight: "600" }}>
              النقاط المتبقية: {student.points || 0}
            </span>
          )}
          <Link to="/store" style={{ textDecoration: "none" }}>
            <button style={{
              background: "var(--bg-main)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-color)",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              fontWeight: "600",
              cursor: "pointer"
            }}>
              العودة للسوق
            </button>
          </Link>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{
          color: "#dc2626",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          padding: "12px 16px",
          borderRadius: "var(--radius-md)",
          marginBottom: "20px",
          fontWeight: "600",
          textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Cart Content */}
      {currentCart.length === 0 ? (
        <div style={{
          background: "var(--surface)",
          padding: "40px 24px",
          borderRadius: "var(--radius-lg)",
          textAlign: "center",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "24px"
        }}>
          <p style={{ fontSize: "40px", margin: "0 0 12px 0" }}>🛍️</p>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "16px", fontWeight: "600" }}>
            السلة فارغة حالياً
          </p>
        </div>
      ) : (
        <div style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          padding: "20px",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "24px"
        }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>الصنف</th>
                <th style={{ textAlign: "center" }}>الكمية</th>
                <th>الإجمالي</th>
                <th style={{ textAlign: "center" }}>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {currentCart.map((item) => (
                <tr key={item.productId || item._id}>
                  <td style={{ fontWeight: "600" }}>{item.name}</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--bg-main)", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                      <button onClick={() => handleQuantityChange(item.productId || item._id, item.quantity, -1)} style={{ borderRadius: "4px", border: "1px solid var(--border-color)", background: "white", cursor: "pointer", padding: "2px 6px", fontWeight: "bold" }}>➖</button>
                      <span style={{ fontWeight: "700" }}>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.productId || item._id, item.quantity, 1)} style={{ borderRadius: "4px", border: "1px solid var(--border-color)", background: "white", cursor: "pointer", padding: "2px 6px", fontWeight: "bold" }}>➕</button>
                    </div>
                  </td>
                  <td style={{ color: "var(--accent)", fontWeight: "700" }}>
                    {item.price * item.quantity} نقطة
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleRemoveItem(item.productId || item._id)}
                      style={{
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        padding: "6px 12px",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px"
                      }}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-color)",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>الإجمالي الكلي:</span>
              <h3 style={{ margin: "4px 0 0 0", color: "var(--accent)", fontSize: "22px" }}>
                {totalPoints} نقطة
              </h3>
            </div>

            <button
              className="btn-primary"
              onClick={handleCheckout}
              disabled={loading}
              style={{
                padding: "12px 24px",
                fontSize: "15px",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "جاري الإرسال..." : "تأكيد وإرسال الطلب ✨"}
            </button>
          </div>
        </div>
      )}

      {/* قسم المشتريات الأخيرة */}
      {(lastOrder || orderHistory.length > 0) && (
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ 
            color: "var(--text-primary)", 
            fontSize: "18px", 
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            📋 تاريخ المشتريات
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "normal" }}>
              ({orderHistory.length} طلب)
            </span>
          </h3>

          {loadingHistory && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              جاري تحميل تاريخ المشتريات...
            </div>
          )}

          {orderHistory.map((order, index) => (
            <div
              key={order.orderId || order._id || index}
              style={{
                background: index === 0 && lastOrder ? "#f0fdf4" : "var(--surface)",
                border: index === 0 && lastOrder ? "2px solid #bbf7d0" : "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 20px",
                marginBottom: "12px",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "12px",
                flexWrap: "wrap",
                gap: "8px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {index === 0 && lastOrder && (
                    <span style={{
                      background: "#22c55e",
                      color: "white",
                      padding: "2px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}>
                      ✔ تم الآن
                    </span>
                  )}
                  <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                    طلب #{orderHistory.length - index}
                  </span>
                </div>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "8px",
                marginBottom: "8px"
              }}>
                {order.items?.map((item, idx) => (
                  <div
                    key={item.productId || idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 12px",
                      background: "var(--bg-main)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)"
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>{item.name}</span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {item.quantity} × {item.price}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginTop: "10px",
                paddingTop: "10px",
                borderTop: "1px dashed var(--border-color)"
              }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  إجمالي الطلب
                </span>
                <span style={{ fontWeight: "700", color: "var(--accent)", fontSize: "16px" }}>
                  {order.total || order.items?.reduce((sum, i) => sum + i.price * i.quantity, 0)} نقطة
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}