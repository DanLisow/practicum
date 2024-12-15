"use client";

import { useEffect, useState } from "react";

interface Vacancy {
  id: number;
  title: string;
  description: string;
  salary: number;
}

interface Resume {
  id: number;
  content: string;
}

export default function HomePage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/vacancies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setVacancies(data.vacancies || []);
      } catch (error: any) {
        setError(error.message || "Ошибка загрузки вакансий");
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

        const data = await response.json();
        setResumes(data.resumes || []);
      } catch (error: any) {
        setError(error.message || "Ошибка загрузки резюме");
      }
    };

    fetchVacancies();
    fetchResumes();
  }, []);

  const handleApply = async (vacancyId: number) => {
    if (!selectedResume) {
      alert("Выберите резюме для подачи заявки.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vacancyId,
          resumeId: selectedResume,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка подачи заявки");
      }

      alert("Заявка успешно подана!");
    } catch (error: any) {
      setError(error.message || "Ошибка при подаче заявки");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Главная страница</h1>

      <div className="my-4">
        <h2 className="text-xl font-semibold">Список вакансий</h2>
        {vacancies.length === 0 ? (
          <p>Вакансий пока нет</p>
        ) : (
          <ul>
            {vacancies.map((vacancy) => (
              <li key={vacancy.id} className="border p-2 my-2">
                <h3 className="font-bold">{vacancy.title}</h3>
                <p>{vacancy.description}</p>
                <p>Зарплата: {vacancy.salary} руб.</p>
                <div className="my-2">
                  <select
                    value={selectedResume || ""}
                    onChange={(e) => setSelectedResume(Number(e.target.value))}
                    className="border p-2 w-full"
                  >
                    <option value="">Выберите резюме</option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        Резюме #{resume.id}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={() => handleApply(vacancy.id)} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Подать заявку
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
