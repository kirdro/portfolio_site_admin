"use client";

import React, { useState, useCallback } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { api } from "../../../utils/api";
import { ProjectsGrid } from "../../../components/admin/projects/ProjectsGrid";
import { ProjectForm } from "../../../components/admin/projects/ProjectForm";

// Типы данных для проектов
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Страница управления проектами портфолио
 * Отображает сетку проектов с возможностью создания, редактирования и удаления
 */
export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Подключаем реальные данные из БД
  const { 
    data: projectsData, 
    isLoading,
    refetch: обновитьПроекты
  } = api.admin.projects.getAll.useQuery({
    limit: 20,
    offset: 0,
  });

  // Статистика проектов
  const { data: статистикаПроектов } = api.admin.projects.getStats.useQuery();

  // Обработчики событий (используем useCallback для оптимизации)
  const обработчикВыбораПроекта = useCallback((project: ProjectData) => {
    setSelectedProject(project);
  }, []);

  const обработчикСозданияПроекта = useCallback(() => {
    setIsCreating(true);
  }, []);

  const обработчикЗакрытияФормы = useCallback(() => {
    setSelectedProject(null);
    setIsCreating(false);
  }, []);

  const обработчикСохраненияПроекта = useCallback(() => {
    // Обновляем данные после сохранения
    обновитьПроекты();
    setSelectedProject(null);
    setIsCreating(false);
  }, [обновитьПроекты]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Заголовок страницы */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neon glyph-glow">
              📁 Управление проектами
            </h1>
            <p className="text-soft text-sm mt-1">
              Создание и редактирование проектов портфолио
            </p>
          </div>

          {/* Быстрое создание */}
          <button
            onClick={обработчикСозданияПроекта}
            className="px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md text-sm font-medium
                     bevel transition-all duration-300"
          >
            ➕ Создать проект
          </button>
        </div>

        {/* Статистика проектов */}
        <div className="bg-panel border border-line rounded-lg bevel p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-neon font-mono text-xl glyph-glow">
                {статистикаПроектов?.totalProjects || 0}
              </div>
              <div className="text-soft text-xs">Всего</div>
            </div>
            <div className="text-center">
              <div className="text-cyan font-mono text-xl">
                {статистикаПроектов?.featuredProjects || 0}
              </div>
              <div className="text-soft text-xs">Избранные</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-mono text-xl">
                {статистикаПроектов?.regularProjects || 0}
              </div>
              <div className="text-soft text-xs">Опубликованы</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-mono text-xl">
                {0}
              </div>
              <div className="text-soft text-xs">Черновики</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-mono text-xl">
                {статистикаПроектов?.projectsLast30Days || 0}
              </div>
              <div className="text-soft text-xs">За месяц</div>
            </div>
          </div>
        </div>

        {/* Сетка проектов */}
        <ProjectsGrid
          projects={projectsData?.projects || []}
          loading={isLoading}
          onProjectClick={обработчикВыбораПроекта}
          onCreateProject={обработчикСозданияПроекта}
        />

        {/* Форма редактирования/создания проекта */}
        {(selectedProject || isCreating) && (
          <ProjectForm
            project={selectedProject}
            isCreating={isCreating}
            onClose={обработчикЗакрытияФормы}
            onSave={обработчикСохраненияПроекта}
          />
        )}
      </div>
    </AdminLayout>
  );
}