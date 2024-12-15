"use client";

import { useEffect, useState } from "react";

interface Vacancy {
  id: number;
  title: string;
  description: string;
  salary: number;
  createdAt: string;
}

export default function employerDashboard() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [newVacancy, setNewVacancy] = useState({
    title: "",
    description: "",
    salary: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/employer/vacancies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setVacancies(data.vacancies);
      } catch (error: any) {
        setError(error.message || "Что-то пошло не так");
      }
    };

    fetchVacancy();
  }, []);

  const handleAddVacancy = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employer/vacancies", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVacancy),
      });

      if (!response.ok) {
        throw new Error("Ошибка добавления вакансии");
      }

      const newVacancyData = await response.json();
      setVacancies((prev) => [...prev, newVacancyData]);
      setNewVacancy({
        title: "",
        description: "",
        salary: "",
      });
    } catch (error: any) {
      setError(error.message || "Не удалось добавить вакансию");
    }
  };

  const handleRemoveVacancy = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employer/vacancies/?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка удаления вакансии");
      }

      setVacancies((prev) => prev.filter((vacancy) => vacancy.id !== id));
    } catch (error: any) {
      setError(error.message || "Вакансия не удалена");
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Личный кабинет работодателя</h1>

      <div className="my-4">
        <h2 className="text-xl font-semibold">Мои вакансии</h2>
        {vacancies.length === 0 ? (
          <p>Вакансий пока нет</p>
        ) : (
          <ul>
            {vacancies.map((vacancy) => (
              <li key={vacancy.id} className="border p-2 my-2">
                <h3 className="font-bold">{vacancy.title}</h3>
                <p>{vacancy.description}</p>
                <p>Зарплата: {vacancy.salary} руб.</p>
                <button onClick={() => handleRemoveVacancy(vacancy.id)} className="bg-red-500 text-white px-4 py-2 rounded mt-2">
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="my-4">
        <h2 className="text-xl font-semibold">Добавить вакансию</h2>
        <input
          type="text"
          placeholder="Название вакансии"
          value={newVacancy.title}
          onChange={(e) => setNewVacancy({ ...newVacancy, title: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <textarea
          placeholder="Описание вакансии"
          value={newVacancy.description}
          onChange={(e) => setNewVacancy({ ...newVacancy, description: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <input
          type="number"
          placeholder="Зарплата"
          value={newVacancy.salary}
          onChange={(e) => setNewVacancy({ ...newVacancy, salary: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <button onClick={handleAddVacancy} className="bg-blue-500 text-white px-4 py-2 rounded">
          Добавить вакансию
        </button>
      </div>
    </div>
  );
}
