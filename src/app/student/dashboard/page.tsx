"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Profile {
  name: string;
  phone: string;
  photoUrl?: string;
}

interface Resume {
  id: number;
  content: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<File | null>(null);

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

    const fetchResumes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/student/resumes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Ошибка загрузки резюме");
        }

        const data = await response.json();
        setResumes(data.resumes || []);
      } catch (error: any) {
        setError(error.message || "Что-то пошло не так при загрузке резюме");
      }
    };

    profileFetch();
    fetchResumes();
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

  const handleResumeUpload = async () => {
    if (!selectedResume) {
      alert("Выберите файл для загрузки резюме!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedResume);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/resumes/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Ошибка загрузки резюме");
      }

      const newResume = await response.json();
      setResumes((prev) => [...prev, newResume]);
      alert("Резюме успешно загружено");
      setSelectedResume(null);
    } catch (error: any) {
      setError(error.message || "Не удалось загрузить резюме");
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!profile) {
    return <p>Загрузка...</p>;
  }

  return (
    <ProtectedRoute>
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

        <div className="my-4">
          <h2 className="text-xl font-semibold">Ваши резюме</h2>
          {resumes.length === 0 ? (
            <p>У вас пока нет резюме.</p>
          ) : (
            <ul>
              {resumes.map((resume) => (
                <li key={resume.id} className="border p-2 my-2">
                  <p>Резюме: {resume.content}</p>
                  <p>Загрузено: {new Date(resume.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="my-4">
          <h2 className="text-xl font-semibold">Добавить резюме</h2>
          <input
            type="file"
            onChange={(e) => setSelectedResume(e.target.files ? e.target.files[0] : null)}
            className="border p-2 w-full mb-2"
          />
          <button onClick={handleResumeUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
            Загрузить резюме
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
