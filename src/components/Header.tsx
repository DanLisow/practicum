"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    if (!token) {
      router.push("/auth/login");
    }
    setRole(userRole);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/auth/login");
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        Главная (Вакансии)
      </Link>

      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href={role === "STUDENT" ? "/student/dashboard" : "/employer/dashboard"} className="hover:underline">
              Личный кабинет
            </Link>
          </li>
        </ul>
      </nav>

      <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
        Выйти
      </button>
    </header>
  );
}
