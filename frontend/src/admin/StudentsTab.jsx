import { useState, useEffect } from "react";
import { api } from "../api.js";
import * as XLSX from "xlsx";

const generate5DigitPassword = () => Math.floor(10000 + Math.random() * 90000).toString();

export default function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // حالة نموذج الإضافة اليدوية
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [points, setPoints] = useState(0);
  const [password, setPassword] = useState(generate5DigitPassword());

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setFetching(true);
      const data = await api.getStudents();
      setStudents(data || []);
    } catch (err) {
      console.error("خطأ في جلب بيانات الطلاب:", err);
    } finally {
      setFetching(false);
    }
  }

  // إضافة طالب يدوياً
  async function handleAddManual(e) {
    e.preventDefault();
    if (!name.trim()) return alert("يرجى كتابة اسم الطالب");

    try {
      await api.addStudent({ name, phone, points, password });
      alert("تمت إضافة الطالب بنجاح!");
      setName("");
      setPhone("");
      setPoints(0);
      setPassword(generate5DigitPassword());
      loadStudents();
    } catch (err) {
      alert("خطأ: " + err.message);
    }
  }

  // حذف طالب
  async function handleDelete(id) {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;
    try {
      await api.deleteStudent(id);
      loadStudents();
    } catch (err) {
      alert(err.message);
    }
  }

  // استيراد من ملف Excel
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
          name: item["اسم الطالب"] || item["الاسم"] || item["name"] || "بدون اسم",
          phone: String(item["رقم الواتس"] || item["الواتس"] || item["الهاتف"] || item["phone"] || ""),
          points: Number(item["عدد النقاط"] || item["النقاط"] || item["points"] || 0),
          password: item["كلمة السر"] || item["password"] ? String(item["كلمة السر"] || item["password"]) : generate5DigitPassword(),
        }));

        await api.bulkCreateStudents(formattedStudents);
        alert(`تمت إضافة ${formattedStudents.length} طالب بنجاح! 🎉`);
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

  function exportStudentsToExcel() {
    if (!students.length) return alert("لا توجد بيانات طلاب للتصدير حالياً.");

    const headers = ["اسم الطالب", "رقم الواتس", "كلمة السر (صريحة)", "النقاط"];
    const rows = students.map((s) => [
      `"${s.name}"`,
      `"${s.phone || ""}"`,
      `"${s.password}"`,
      s.points,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `قائمة_الطلاب_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* 1. نموذج إضافة طالب جديد */}
      <div
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}
      >
        <h4 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "16px", fontWeight: "700" }}>
          ➕ إضافة طالب جديد
        </h4>

        <form onSubmit={handleAddManual} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "2", minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
              اسم الطالب
            </label>
            <input
              type="text"
              placeholder="اسم الطالب"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div style={{ flex: "1.5", minWidth: "140px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
              رقم الواتس
            </label>
            <input
              type="text"
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ flex: "1", minWidth: "90px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
              النقاط
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ flex: "1.5", minWidth: "170px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
              كلمة السر (تلقائية)
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "6px 12px",
                height: "43px",
                boxSizing: "border-box"
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: "700", color: "#1e293b", letterSpacing: "2px" }}>
                {password}
              </span>
              <button
                type="button"
                onClick={() => setPassword(generate5DigitPassword())}
                title="توليد رقم جديد"
                style={{
                  background: "#e2e8f0",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#334155",
                  transition: "all 0.2s ease"
                }}
              >
                🔄
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: "#2DAFBB",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              height: "43px",
              boxShadow: "0 2px 6px rgba(45, 175, 187, 0.25)",
              transition: "all 0.2s ease"
            }}
          >
            حفظ الطالب
          </button>
        </form>
      </div>

      {/* 2. شريط الأدوات وجدول عرض الطلاب */}
      <div
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px"
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b", fontWeight: "700" }}>
            👥 قائمة الطلاب ({students.length})
          </h3>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                onChange={handleFileUpload}
                style={{ display: "none" }}
                disabled={loading}
              />
            </label>

            <button
              onClick={exportStudentsToExcel}
              disabled={students.length === 0}
              style={{
                background: students.length === 0 ? "#cbd5e1" : "#f0fdf4",
                color: students.length === 0 ? "#94a3b8" : "#16a34a",
                border: students.length === 0 ? "1px solid #cbd5e1" : "1px solid #bbf7d0",
                padding: "8px 16px",
                borderRadius: "10px",
                cursor: students.length === 0 ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              📥 تصدير الطلاب إلى Excel
            </button>
          </div>
        </div>

        {/* 3. حالة التحميل والتفرغ والجدول */}
        {fetching ? (
          <div style={{ textAlign: "center", color: "#64748b", padding: "40px 0", fontSize: "14px" }}>
            ⏳ جاري جلب قائمة الطلاب...
          </div>
        ) : students.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#94a3b8",
              background: "#f8fafc",
              borderRadius: "12px",
              border: "1px dashed #cbd5e1",
              fontSize: "14px"
            }}
          >
            👥 لا يوجد طلاب مسجلون حالياً
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", textAlign: "right" }}>
              <thead>
                <tr style={{ background: "#f8fafc", fontSize: "13px", color: "#475569" }}>
                  <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>🧑‍🦰 اسم الطالب</th>
                  <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>☎️ رقم الواتس</th>
                  <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>🔑 كلمة السر</th>
                  <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>💯 النقاط</th>
                  <th style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>📃 الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td style={{ padding: "12px 16px", fontWeight: "600", color: "#1e293b", borderBottom: "1px solid #f1f5f9" }}>
                      {s.name}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#2563eb", direction: "ltr", textAlign: "right", borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                      {s.phone || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      <span
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                          fontSize: "13px",
                          fontWeight: "700",
                          border: "1px solid #e2e8f0",
                          letterSpacing: "1px"
                        }}
                      >
                        {s.password}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#2DAFBB", fontWeight: "700", borderBottom: "1px solid #f1f5f9" }}>
                      {s.points} نقطة
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
                      <button
                        onClick={() => handleDelete(s._id)}
                        style={{
                          background: "#fef2f2",
                          color: "#ef4444",
                          border: "1px solid #fecaca",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          transition: "all 0.2s ease"
                        }}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}