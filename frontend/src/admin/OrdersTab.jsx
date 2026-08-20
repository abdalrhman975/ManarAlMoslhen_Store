import { useState, useEffect } from "react";
import { api } from "../api.js";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const data = await api.getStudentSelections();
    setOrders(data);
  }

  // تجميع الطلبات حسب الطالب
  const groupedOrders = orders.reduce((acc, order) => {
    const studentId = order.student?._id || "deleted";
    const studentName = order.student?.name || "طالب محذوف";

    if (!acc[studentId]) {
      acc[studentId] = {
        name: studentName,
        totalSpent: 0,
        orders: [],
      };
    }
    acc[studentId].orders.push(order);
    acc[studentId].totalSpent += order.totalPoints;
    return acc;
  }, {});

  const toggleStudent = (studentId) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  async function handleToggleDeliver(orderId) {
    await api.updateOrderStatus(orderId);
    loadOrders();
  }

  function exportOrdersToExcel() {
    const headers = ["اسم الطالب", "المنتجات", "إجمالي النقاط", "الحالة", "التاريخ"];
    const rows = orders.map((o) => [
      `"${o.student?.name || "طالب محذوف"}"`,
      `"${o.items.map((i) => `${i.name} (${i.quantity})`).join(" + ")}"`,
      o.totalPoints,
      `"${o.status === "delivered" ? "تم التسليم" : "قيد الانتظار"}"`,
      `"${new Date(o.createdAt).toLocaleDateString("ar-EG")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `جدول_الطلبات_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  return (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)" }}>
      {/* رأس التبويب والأزرار */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>
          📋 طلبات الطلاب <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "normal" }}>(انقر على اسم الطالب للتفاصيل)</span>
        </h3>
        <button
          onClick={exportOrdersToExcel}
          style={{
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 6px rgba(22, 163, 74, 0.2)",
            transition: "all 0.2s ease"
          }}
        >
          📥 تصدير الكل إلى Excel
        </button>
      </div>

      {/* قائمة طلبات الطلاب الأكوردبيون */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Object.entries(groupedOrders).map(([studentId, group]) => {
          const isExpanded = expandedStudentId === studentId;
          return (
            <div key={studentId} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", transition: "all 0.2s ease" }}>
              {/* رأس بطاقة الطالب */}
              <div
                onClick={() => toggleStudent(studentId)}
                style={{
                  background: isExpanded ? "#fafbfc" : "#ffffff",
                  padding: "14px 18px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  userSelect: "none",
                  borderRight: isExpanded ? "4px solid #2DAFBB" : "4px solid transparent",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ fontWeight: "700", fontSize: "15px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                  👤 {group.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b", background: "#f8fafc", padding: "4px 12px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                    مجموع النقاط: <strong style={{ color: "#2DAFBB" }}>{group.totalSpent}</strong>
                  </span>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* جدول التفاصيل عند التوسيع */}
              {isExpanded && (
                <div style={{ padding: "16px", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", textAlign: "right" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", fontSize: "13px", color: "#475569" }}>
                          <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>المنتجات المطلوبة</th>
                          <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>النقاط</th>
                          <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>التاريخ</th>
                          <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>الحالة</th>
                          <th style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.orders.map((o) => (
                          <tr key={o._id}>
                            <td style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                              {o.items.map((item, idx) => (
                                <span key={idx} style={{ display: "inline-block", background: "#f1f5f9", color: "#334155", padding: "4px 10px", borderRadius: "6px", margin: "2px", fontSize: "13px", fontWeight: "500" }}>
                                  {item.name} × {item.quantity}
                                </span>
                              ))}
                            </td>
                            <td style={{ padding: "12px 14px", fontWeight: "700", color: "#2DAFBB", borderBottom: "1px solid #f1f5f9" }}>{o.totalPoints}</td>
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>
                              {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: "13px", borderBottom: "1px solid #f1f5f9" }}>
                              {o.status === "delivered" ? (
                                <span style={{ color: "#16a34a", fontWeight: "600", background: "#f0fdf4", padding: "4px 10px", borderRadius: "6px" }}>
                                  ✅ تم التسليم
                                </span>
                              ) : (
                                <span style={{ color: "#d97706", fontWeight: "600", background: "#fffbebe1", padding: "4px 10px", borderRadius: "6px" }}>
                                  ⏳ قيد الانتظار
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                              {o.status !== "delivered" && (
                                <button
                                  onClick={() => handleToggleDeliver(o._id)}
                                  style={{
                                    background: "#2DAFBB",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 14px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    boxShadow: "0 2px 4px rgba(45, 175, 187, 0.2)"
                                  }}
                                >
                                  تم التسليم
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}