"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка авторизации");
      }

      const { token, role } = await response.json();

      alert(`Вход выполнен, ваша роль: ${role}`);

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "STUDENT") {
        window.location.href = "/student/dashboard";
      } else if (role === "EMPLOYER") {
        window.location.href = "/employer/dashboard";
      } else if (role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Вход</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full" />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Войти
        </button>
      </form>
      <p className="text-sm">
        Нет аккаунта?{" "}
        <Link href="/auth/register" className="text-blue-500">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
