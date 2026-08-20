import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { api } from "../api.js";

export default function QuantitiesTab() {
  const [quantities, setQuantities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuantitiesData();
  }, []);

  async function loadQuantitiesData() {
    try {
      setLoading(true);
      let data = null;

      // 1. جلب الكميات المجمعة مباشرة من السيرفر
      try {
        if (typeof api.getOrderQuantities === "function") {
          data = await api.getOrderQuantities();
        }
      } catch (e) {
        console.warn("تعذر جلب الكميات المجمعة، جاري محاولة جلب قائمة الطلبات الخام...");
      }

      // 2. المحاولة الثانية: جلب قائمة الطلبات إذا لم تتوفر دالة التجميع المباشر
      if (!data || (Array.isArray(data) && data.length === 0)) {
        if (typeof api.getOrders === "function") {
          data = await api.getOrders();
        } else if (typeof api.getStudentSelections === "function") {
          data = await api.getStudentSelections();
        }
      }

      const result = aggregateProductQuantities(data);
      setQuantities(result);
    } catch (err) {
      console.error("خطأ أثناء تحميل كميات المنتجات:", err);
    } finally {
      setLoading(false);
    }
  }

  function aggregateProductQuantities(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    const firstItem = data[0];

    // حالة 1: البيانات قادمة مجمعة من السيرفر
    if (firstItem.totalQuantity !== undefined || firstItem.totalRequested !== undefined || firstItem._id) {
      return data.map((item) => ({
        name: item.name || item._id || "منتج غير معنون",
        totalQuantity: Number(item.totalQuantity || item.totalRequested || 0),
      }));
    }

    // حالة 2: تجميع الطلبات التفصيلية من جهة العميل
    const countsMap = {};
    data.forEach((order) => {
      const items = order.items || order.products || order.cart || [];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          const productName = item.name || item.product?.name || "منتج غير معنون";
          const qty = Number(item.quantity || 1);
          countsMap[productName] = (countsMap[productName] || 0) + qty;
        });
      }
    });

    return Object.keys(countsMap)
      .map((name) => ({
        name,
        totalQuantity: countsMap[name],
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }

  function exportToExcel() {
    if (!quantities.length) return alert("لا توجد بيانات كميات للتصدير حالياً.");

    const exportData = quantities.map((q, idx) => ({
      "م": idx + 1,
      "اسم المنتج": q.name,
      "إجمالي الكمية المطلوبة": q.totalQuantity,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الكميات المطلوبة");
    XLSX.writeFile(wb, `كميات_المنتجات_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}>📊 ملخص كميات المنتجات المطلوبة</h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            حصر تلقائي شامِل لجميع المنتجات المطلوبة في النظام
          </p>
        </div>

        <button
          onClick={exportToExcel}
          disabled={quantities.length === 0}
          style={{
            background: quantities.length === 0 ? "#cbd5e1" : "#16a34a",
            color: "white",
            border: "none",
            padding: "9px 16px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: quantities.length === 0 ? "not-allowed" : "pointer",
            fontSize: "13px",
          }}
        >
          📥 تصدير الكميات إلى Excel
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#64748b", padding: "30px 0" }}>جاري جلب وحساب الكميات...</p>
      ) : quantities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
          لا توجد أي طلبات مسجلة في النظام حتى الآن
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569", fontSize: "13px" }}>
                <th style={{ padding: "12px" }}>اسم المنتج</th>
                <th style={{ padding: "12px", textAlign: "center" }}>إجمالي الكمية المطلوبة</th>
              </tr>
            </thead>
            <tbody>
              {quantities.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: "600", color: "#1e293b" }}>{item.name}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 14px", borderRadius: "20px", fontWeight: "bold", fontSize: "13px" }}>
                      {item.totalQuantity} قطعة
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}