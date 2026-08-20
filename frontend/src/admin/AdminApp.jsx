import { useState } from "react";
import StudentsTab from "./StudentsTab.jsx";
import ProductsTab from "./ProductsTab.jsx";
import QuantitiesTab from "./QuantitiesTab.jsx";
import OrdersTab from "./OrdersTab.jsx";

const TABS = [
  { key: "students", label: "👥 إدارة الطلاب", Comp: StudentsTab },
  { key: "products", label: "📦 محتويات السوق", Comp: ProductsTab },
  { key: "quantities", label: "📊 كميات الطلبات", Comp: QuantitiesTab },
  { key: "orders", label: "📋 قائمة الطلبات", Comp: OrdersTab },
];

export default function AdminApp() {
  const [active, setActive] = useState("students");
  const ActiveComp = TABS.find((t) => t.key === active)?.Comp || StudentsTab;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        color: "white",
        padding: "20px 28px",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        boxShadow: "var(--shadow-md)"
      }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          ⚙️ لوحة التحكم والإدارة
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        background: "var(--surface)",
        padding: "6px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-color)",
        marginBottom: "24px",
        overflowX: "auto"
      }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "14px",
              transition: "all 0.2s ease",
              background: active === t.key ? "var(--primary)" : "transparent",
              color: active === t.key ? "white" : "var(--text-secondary)",
              boxShadow: active === t.key ? "var(--shadow-sm)" : "none",
              whiteSpace: "nowrap"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="admin-content">
        <ActiveComp />
      </div>
    </div>
  );
}