import React from "react";
import Image from "next/image";
import type { ProjectData } from "../../../app/(dashboard)/projects/page";

interface ProjectCardProps {
  project: ProjectData;
  onClick: (project: ProjectData) => void;
}

/**
 * Карточка проекта с превью изображения и информацией
 * Киберпанк дизайн с bevel эффектами
 */
export function ProjectCard({ project, onClick }: ProjectCardProps) {
  
  // Обработчик клика с useCallback вынесен в родительский компонент
  const обработчикКлика = () => {
    onClick(project);
  };

  // Форматирование даты на русском
  const форматированнаяДата = project.updatedAt.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div
      onClick={обработчикКлика}
      className="bg-subtle border border-line rounded-lg bevel overflow-hidden
                 hover:border-neon hover:shadow-neon transition-all duration-300
                 cursor-pointer group"
    >
      {/* Превью изображения */}
      <div className="aspect-video bg-panel relative overflow-hidden">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-soft">
            <div className="text-center">
              <div className="text-3xl mb-2">📁</div>
              <div className="text-sm">Нет изображения</div>
            </div>
          </div>
        )}
        
        {/* Индикатор избранного проекта */}
        {project.featured && (
          <div className="absolute top-2 right-2 bg-neon/20 border border-neon
                         text-neon px-2 py-1 rounded text-xs font-mono bevel">
            ⭐ Избранный
          </div>
        )}

        {/* Быстрые действия при наведении */}
        <div className="absolute inset-0 bg-bg/80 opacity-0 group-hover:opacity-100
                       transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-neon/20 border border-neon text-neon rounded
                         hover:bg-neon/30 transition-colors"
                title="Открыть демо"
              >
                🌐
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-cyan/20 border border-cyan text-cyan rounded
                         hover:bg-cyan/30 transition-colors"
                title="Открыть репозиторий"
              >
                💻
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Информация о проекте */}
      <div className="p-4">
        {/* Заголовок */}
        <h3 className="font-bold text-base mb-2 truncate group-hover:text-neon
                     transition-colors">
          {project.title}
        </h3>

        {/* Описание */}
        <p className="text-soft text-sm mb-3 line-clamp-2">
          {project.description}
        </p>

        {/* Теги */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-panel border border-line text-xs
                         rounded font-mono"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-soft">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Метаинформация */}
        <div className="flex items-center justify-between text-xs text-soft">
          <div className="font-mono">
            {форматированнаяДата}
          </div>
          <div className="flex items-center space-x-2">
            {project.demoUrl && (
              <div className="w-2 h-2 rounded-full bg-green-400" title="Есть демо" />
            )}
            {project.githubUrl && (
              <div className="w-2 h-2 rounded-full bg-cyan" title="Есть код" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}