"use client";

import { useState, useEffect } from "react";

interface Profile {
  name: string;
  phone: string;
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const profileFetch = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Ошибка загрузки профиля");
        }

        const data = await response.json();
        setEmail(data.email);
        setProfile(data.profile);
      } catch (error: any) {
        setError(error.message || "Что-то пошло не так");
      }
    };

    profileFetch();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!profile) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Личный кабинет студента</h1>
      <p>Email: {email}</p>
      <p>Имя: {profile.name}</p>
      <p>Телефон: {profile.phone}</p>
    </div>
  );
}
