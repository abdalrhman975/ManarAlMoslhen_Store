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
    <div style={{ background: "white", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "#1e293b" }}>📋 طلبات الطلاب (انقر على اسم الطالب للتفاصيل)</h3>
        <button
          onClick={exportOrdersToExcel}
          style={{ background: "#16a34a", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
        >
          📥 تصدير الكل إلى Excel
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Object.entries(groupedOrders).map(([studentId, group]) => {
          const isExpanded = expandedStudentId === studentId;
          return (
            <div key={studentId} style={{ border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden" }}>
              {/* رأس بطاقة الطالب */}
              <div
                onClick={() => toggleStudent(studentId)}
                style={{
                  background: isExpanded ? "#f1f5f9" : "#f8fafc",
                  padding: "14px 18px",
                  cursor: "pointer",
                  display: "flex",
                  justify: "space-between",
                  alignItems: "center",
                  userSelect: "none",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "16px", color: "#0f172a" , margin:"10px"}}>
                  👤 {group.name}

                </div>
              
              </div>

              {isExpanded && (
                <div style={{ padding: "15px", background: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9", fontSize: "13px", color: "#475569" }}>
                        <th style={{ padding: "8px" }}>المنتجات المطلوبة</th>
                        <th style={{ padding: "8px" }}>النقاط</th>
                        <th style={{ padding: "8px" }}>التاريخ</th>
                        <th style={{ padding: "8px" }}>الحالة</th>
                        <th style={{ padding: "8px" }}>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.orders.map((o) => (
                        <tr key={o._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px" }}>
                            {o.items.map((item, idx) => (
                              <span key={idx} style={{ display: "inline-block", background: "#e2e8f0", padding: "2px 8px", borderRadius: "4px", margin: "2px", fontSize: "13px" }}>
                                {item.name} × {item.quantity}
                              </span>
                            ))}
                          </td>
                          <td style={{ padding: "10px", fontWeight: "bold", color: "#d97706" }}>{o.totalPoints}</td>
                          <td style={{ padding: "10px", fontSize: "12px", color: "#64748b" }}>
                            {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                          </td>
                          <td style={{ padding: "10px", fontSize: "13px" }}>
                            {o.status === "delivered" ? "✅ تم التسليم" : "⏳ قيد الانتظار"}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {o.status !== "delivered" && (
                              <button
                                onClick={() => handleToggleDeliver(o._id)}
                                style={{ background: "#2563eb", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}