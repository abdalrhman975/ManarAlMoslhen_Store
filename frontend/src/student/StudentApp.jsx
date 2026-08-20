import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login.jsx";
import Market from "./Market.jsx";
import Cart from "./Cart.jsx";

export default function StudentApp() {
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem("mosque_student");
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("mosque_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("mosque_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (student) {
      localStorage.setItem("mosque_student", JSON.stringify(student));
    } else {
      localStorage.removeItem("mosque_student");
    }
  }, [student]);

  // دالة تسجيل الخروج وتفريغ البيانات المخزنة
  function handleLogout() {
    setStudent(null);
    setCart([]);
    localStorage.removeItem("mosque_student");
    localStorage.removeItem("mosque_cart");
  }

  function addToCart(product, quantity) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        { productId: product._id, name: product.name, price: product.price, quantity },
      ];
    });
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem("mosque_cart");
  }

  function updateQuantity(productId, newQty) {
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity: newQty } : item));
  }

  if (!student) {
    return <Login onLogin={setStudent} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Market
            student={student}
            setStudent={setStudent}
            onLogout={handleLogout}
            cart={cart}
            addToCart={addToCart}
          />
        }
      />
      <Route
        path="/cart"
        element={
          <Cart
            student={student}
            setStudent={setStudent}
            onLogout={handleLogout}
            cart={cart}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
          />
        }
      />
      <Route path="*" element={<Navigate to="/store" replace />} />
    </Routes>
  );
}