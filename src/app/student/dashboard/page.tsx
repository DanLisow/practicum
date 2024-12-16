"use client";

import React, { useState, useEffect } from "react";
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

interface Application {
  id: number;
  vacancyTitle: string;
  status: string;
  createdAt: string;
}

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/student/applications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Ошибка загрузки заявок");
        }

        const data = await response.json();
        setApplications(data.applications || []);
      } catch (error: any) {
        setError(error.message || "Не удалось загрузить заявки");
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/student/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Ошибка загрузки уведомлений");
        }

        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error: any) {
        setError(error.message || "Не удалось загрузить уведомления");
      }
    };

    profileFetch();
    fetchResumes();
    fetchApplications();
    fetchNotifications();
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

  const handleResumeUpload = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedResume) {
      alert("Выберите файл для загрузки резюме!");
      return;
    }

    if (!resumeName) {
      alert("Введите название резюме");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedResume);
    formData.append("resumeName", resumeName);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/resume/upload", {
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
      <div className="w-3/4 flex py-8 mx-auto space-x-4">
        <div className="student__info w-4/6">
          <h1 className="text-2xl mb-3 font-bold">Личный кабинет студента</h1>
          <div className="student__info-content flex">
            <div className="student__img w-4/6">
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
            <div className="student__name w-5/12">
              <p>Email: {email}</p>
              <p>Имя: {profile.name}</p>
              <p>Телефон: {profile.phone}</p>
            </div>
          </div>

          <form className="my-4" onSubmit={handleResumeUpload}>
            <h2 className="text-xl font-semibold">Добавить резюме</h2>
            <div className="resume__block flex space-x-2 my-2">
              <input
                type="text"
                placeholder="Название резюме"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                className="border p-2 w-full"
              />
              <input
                type="file"
                onChange={(e) => setSelectedResume(e.target.files ? e.target.files[0] : null)}
                className="border p-2 w-full"
              />
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Загрузить резюме</button>
          </form>

          <div className="my-8">
            <h2 className="text-xl font-semibold">Ваши резюме</h2>
            {resumes.length === 0 ? (
              <p>У вас пока нет резюме.</p>
            ) : (
              <ul>
                {resumes.map((resume) => (
                  <li key={resume.id} className="border p-2 my-2">
                    <p>Резюме: {resume.resumeName}</p>
                    <p>Загружено: {new Date(resume.createdAt).toLocaleDateString()}</p>
                    <a href={`${resume.content}`} className="text-blue-600" target="_blank">
                      Посмотреть резюме
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="student__aside w-5/12">
          <div className="my-4">
            <h2 className="text-xl font-semibold">Ваши заявки</h2>
            {applications.length === 0 ? (
              <p>У вас пока нет заявок.</p>
            ) : (
              <ul>
                {applications.map((application) => (
                  <li key={application.id} className="border p-2 my-2">
                    <p>Вакансия: {application.vacancyTitle}</p>
                    <p>Статус: {application.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="my-4">
            <h2 className="text-xl font-semibold">Ваши уведомления</h2>
            {notifications.length === 0 ? (
              <p>У вас пока нет уведомлений.</p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id} className="border p-2 my-2">
                    <p>{notification.message}</p>
                    <p>Получено: {new Date(notification.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
