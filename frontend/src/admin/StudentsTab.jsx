import { useState, useEffect } from "react";
import { api } from "../api.js";
import * as XLSX from "xlsx";

const generate5DigitPassword = () => Math.floor(10000 + Math.random() * 90000).toString();

export default function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // حالة نموذج الإضافة اليدوية
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [points, setPoints] = useState(0);
  const [password, setPassword] = useState(generate5DigitPassword());

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    const data = await api.getStudents();
    setStudents(data);
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
    if (!confirm("هل أنت تأكد من حذف هذا الطالب؟")) return;
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h4 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "16px", fontWeight: "700" }}>➕ إضافة طالب جديد </h4>
        
        <form onSubmit={handleAddManual} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "2", minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>اسم الطالب</label>
            <input
              type="text"
              placeholder="اسم الطالب"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
              required
            />
          </div>

          <div style={{ flex: "1.5", minWidth: "140px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>رقم الواتس</label>
            <input
              type="text"
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
            />
          </div>

          <div style={{ flex: "1", minWidth: "90px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>النقاط</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
            />
          </div>

          <div style={{ flex: "1.5", minWidth: "170px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>كلمة السر (تلقائية)</label>
            <div style={{
              display: "flex",
              alignItems: "center",
              justify: "space-between",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "6px 10px"
            }}>
              <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: "#1e293b", letterSpacing: "2px" }}>
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
                  margin:"0 120px", 
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#334155"
                }}
              >
                🔄
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: "#2d6a4f",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              height: "42px"
            }}
          >
            حفظ الطالب
          </button>
        </form>
      </div>

      {/* 2. شريط الأدوات والجدول */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>👥 قائمة الطلاب ({students.length})</h3>

          <div style={{ display: "flex", gap: "10px" }}>
            <label style={{ background: "#2563eb", color: "white", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
              {loading ? "جاري الاستيراد..." : "📤 استيراد من Excel"}
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: "none" }} disabled={loading} />
            </label>

            <button
              onClick={exportStudentsToExcel}
              style={{ background: "#16a34a", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}
            >
              📥 تصدير الطلاب إلى Excel
            </button>
          </div>
        </div>

        {/* 3. جدول العرض وبداخله عمود كلمة السر الصريح */}
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569", fontSize: "13px" }}>
              <th style={{ padding: "12px" }}>🧑‍🦰 اسم الطالب</th>
              <th style={{ padding: "12px" }}>☎️ رقم الواتس</th>
              <th style={{ padding: "12px" }}>🔑 كلمة السر </th>
              <th style={{ padding: "12px" }}>💯 النقاط</th>
              <th style={{ padding: "12px", textAlign: "center" }}>📃إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px", fontWeight: "600", color: "#1e293b" }}>{s.name}</td>
                <td style={{ padding: "12px", color: "#2563eb", direction: "ltr", textAlign: "right" }}>{s.phone || "—"}</td>
                
                {/* عامود كلمة السر النصية */}
                <td style={{ padding: "12px" }}>
                  <span style={{
                    background: "#f1f5f9",
                    color: "#0f172a",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: "700",
                    border: "1px solid #cbd5e1",
                    letterSpacing: "1px"
                  }}>
                    {s.password}
                  </span>
                </td>

                <td style={{ padding: "12px", color: "#d97706", fontWeight: "bold" }}>{s.points}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => handleDelete(s._id)}
                    style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}