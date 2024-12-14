"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role, name, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || "Ошибка регистрации");
      }

      alert("Регистрация успешна!");

      window.location.href = "/auth/login";
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full" />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 w-full">
          <option value="STUDENT">Студент</option>
          <option value="EMPLOYER">Работодатель</option>
        </select>
        <input type="tel" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-2 w-full" />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Зарегистрироваться
        </button>
      </form>
      <p className="text-sm">
        Уже есть аккаунт?{" "}
        <Link href="/auth/login" className="text-blue-500">
          Войти
        </Link>
      </p>
    </div>
  );
}
