"use client";

import { useState, useEffect } from "react";

interface Profile {
  name: string;
  phone: string;
  photoUrl?: string;
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

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

  const handlePhotoUpload = async () => {
    if (!photo) return;

    const formData = new FormData();
    formData.append("file", photo);

    try {
      const uploadResponse = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const { fileUrl } = await uploadResponse.json();

      const token = localStorage.getItem("token");

      const updateResponse = await fetch("/api/profile/photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoUrl: fileUrl }),
      });

      if (!updateResponse.ok) {
        throw new Error("Ошибка сохранения фото");
      }

      setProfile((prevProfile) => (prevProfile ? { ...prevProfile, photoUrl: fileUrl } : null));
    } catch (error: any) {
      setError(error.message || "Не удалось загрузить фото");
    }
  };

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

      {profile.photoUrl ? (
        <div className="my-4">
          <img src={profile.photoUrl} className="w-32 h-32 rounded-full object-cover" />
          <p>Изменить фото:</p>
          <input type="file" onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)} />
          <button onClick={handlePhotoUpload} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">
            Загрузить новое фото
          </button>
        </div>
      ) : (
        <div className="my-4">
          <p>Фото не добавлено</p>
          <input type="file" onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)} />
          <button onClick={handlePhotoUpload} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">
            Добавить фото
          </button>
        </div>
      )}
    </div>
  );
}
