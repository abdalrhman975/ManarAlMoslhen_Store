export const api = {
  // --- تسجيل الدخول ---
  studentLogin: async (name, password) => {
    const res = await fetch("/api/students/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "اسم الطالب أو كلمة المرور غير صحيحة");
    return data;
  },

  adminLogin: async (password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "كلمة المرور غير صحيحة");
    return data;
  },

  // --- إدارة الطلاب ---
  getStudents: async () => {
    const res = await fetch("/api/students");
    return res.json();
  },

  addStudent: async (studentData) => {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشلت إضافة الطالب");
    return data;
  },

  createStudent: async (studentData) => {
    return api.addStudent(studentData);
  },

  bulkCreateStudents: async (studentsArray) => {
    const res = await fetch("/api/students/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentsArray),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشل استيراد الطلاب");
    return data;
  },

  updateStudent: async (id, studentData) => {
    const res = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });
    return res.json();
  },

  deleteStudent: async (id) => {
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشل حذف الطالب");
    return data;
  },

  // --- إدارة المنتجات (مع الصور) ---
  getProducts: async (category = "All") => {
    try {
      const url = category && category !== "All" 
        ? `/api/products?category=${category}`
        : `/api/products`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  createProduct: async (formData) => {
    const res = await fetch("/api/products", { 
      method: "POST", 
      body: formData 
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشلت إضافة المنتج");
    return data;
  },

  updateProduct: async (id, formData) => {
    const res = await fetch(`/api/products/${id}`, { 
      method: "PUT", 
      body: formData 
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشل تعديل المنتج");
    return data;
  },

  deleteProduct: async (id) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشل حذف المنتج");
    return data;
  },

  // --- إدارة الطلبات والتسوق ---
  submitOrder: async (studentId, items) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, items }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشلت عملية إرسال الطلب");
    return data;
  },

  getOrderQuantities: async () => {
    const res = await fetch("/api/orders/quantities");
    return res.json();
  },

  getStudentSelections: async () => {
    const res = await fetch("/api/orders");
    return res.json();
  },

  updateOrderStatus: async (orderId) => {
    const res = await fetch(`/api/orders/${orderId}/deliver`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  async getStudentOrders(studentId) {
    try {
      const response = await fetch(`/api/orders/student/${studentId}`);
      if (!response.ok) throw new Error("فشل في جلب الطلبات");
      return await response.json();
    } catch (err) {
      console.error("خطأ في جلب طلبات الطالب:", err);
      return [];
    }
  },
  
  // --- إدارة الكميات ---
  getQuantities: async () => {
    const res = await fetch("/api/orders/quantities");
    return res.json();
  },

  getAllOrders: async () => {
    const res = await fetch("/api/orders");
    return res.json();
  },

  markDelivered: async (orderId) => {
    const res = await fetch(`/api/orders/${orderId}/deliver`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  }
};