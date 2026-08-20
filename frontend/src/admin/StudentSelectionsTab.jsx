import { useState, useEffect } from "react";
import { api } from "../api.js";

export default function StudentSelectionsTab() {
  const [selections, setSelections] = useState([]);

  useEffect(() => {
    loadSelections();
  }, []);

  async function loadSelections() {
    if (api.getStudentSelections) {
      const data = await api.getStudentSelections();
      setSelections(data);
    }
  }


  async function toggleStrike(orderId, currentStatus) {
    const newStatus = !currentStatus;
    if (api.updateOrderStatus) {
      await api.updateOrderStatus(orderId, newStatus);
    }
    setSelections((prev) =>
      prev.map((item) =>
        item._id === orderId ? { ...item, isStruck: newStatus } : item
      )
    );
  }

  return (
    <div>
      <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: "16px" }}>📋 قائمة طلبات الطلاب التفصيلية</h3>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <thead>
          <tr style={{ background: "#f1f5f9", textAlign: "right", borderBottom: "2px solid #cbd5e1" }}>
            <th style={{ padding: "12px"  }}>اسم الطالب</th>
            <th style={{ padding: "12px"  }}>المنتجات المطلوبة</th>
            <th style={{ padding: "12px"  }}>إجمالي النقاط</th>
            <th style={{ padding: "12px"  }}>حالة الطلب</th>
            <th style={{ padding: "12px"  }}>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {selections.map((sel) => {
            const isStruck = sel.isStruck || false;
            return (
              <tr
                key={sel._id}
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  background: isStruck ? "#f8fafc" : "white",
                  opacity: isStruck ? 0.75 : 1,
                }}
              >
                <td style={{ padding: "12px", fontWeight: "600", textDecoration: isStruck ? "line-through" : "none" }}>
                  👤 {sel.studentName}
                </td>
                <td style={{ padding: "12px", textDecoration: isStruck ? "line-through" : "none" }}>
                  {sel.items?.map((item, idx) => (
                    <span key={idx} style={{ display: "inline-block", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", margin: "2px", fontSize: "13px" }}>
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </td>
                <td style={{ padding: "12px", color: "#2d6a4f", fontWeight: "bold", textDecoration: isStruck ? "line-through" : "none" }}>
                  {sel.totalPoints} نقطة
                </td>
                <td style={{ padding: "12px" }}>
                  {isStruck ? (
                    <span style={{ color: "#ef4444", fontWeight: "bold", background: "#fef2f2", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}>
                      مكتمِل / مشطوب
                    </span>
                  ) : (
                    <span style={{ color: "#2563eb", fontWeight: "bold", background: "#eff6ff", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}>
                      قيد الانتظار
                    </span>
                  )}
                </td>
                <td style={{ padding: "12px" }}>
                  {isStruck ? (
                    <button
                      onClick={() => toggleStrike(sel._id, isStruck)}
                      style={{
                        background: "#059669",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px"
                      }}
                    >
                      ↩️ إلغاء الشطب
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleStrike(sel._id, isStruck)}
                      style={{
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px"
                      }}
                    >
                      ✂️ شطب الطلب
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}