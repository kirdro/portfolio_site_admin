"use client";

import React from "react";
import type { SkillData } from "../../../app/(dashboard)/skills/page";

interface SkillCardProps {
  skill: SkillData;
  onClick: (skill: SkillData) => void;
  categoryColor: string;
}

/**
 * Карточка навыка с уровнем владения и прогресс-баром
 * Киберпанк дизайн с bevel эффектами
 */
export function SkillCard({ skill, onClick, categoryColor }: SkillCardProps) {
  
  // Обработчик клика
  const обработчикКлика = () => {
    onClick(skill);
  };

  // Определение цвета уровня на основе значения
  const определитьЦветУровня = (level: number) => {
    if (level >= 90) return "text-green-400";
    if (level >= 70) return "text-yellow-400";
    if (level >= 50) return "text-orange-400";
    return "text-red-400";
  };

  // Определение текста уровня владения
  const определитьТекстУровня = (level: number) => {
    if (level >= 90) return "Эксперт";
    if (level >= 70) return "Продвинутый";
    if (level >= 50) return "Средний";
    return "Начинающий";
  };

  // Форматирование даты обновления
  const форматированнаяДата = skill.updatedAt.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });

  // Динамические классы для цвета категории
  const цветнаяГраница = categoryColor === "neon" ? "border-neon" : 
                        categoryColor === "cyan" ? "border-cyan" :
                        `border-${categoryColor}`;

  const цветнойТекст = categoryColor === "neon" ? "text-neon" : 
                      categoryColor === "cyan" ? "text-cyan" :
                      `text-${categoryColor}`;

  const цветнойФон = categoryColor === "neon" ? "bg-neon" : 
                    categoryColor === "cyan" ? "bg-cyan" :
                    `bg-${categoryColor}`;

  return (
    <div
      onClick={обработчикКлика}
      className="bg-subtle border border-line rounded-lg bevel overflow-hidden
                 hover:border-neon hover:shadow-neon transition-all duration-300
                 cursor-pointer group relative"
    >
      {/* Индикатор высокого уровня */}
      {skill.level >= 90 && (
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-400 
                       animate-pulse border border-green-300" 
             title="Экспертный уровень"
        />
      )}

      <div className="p-4">
        {/* Иконка и название */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="text-2xl group-hover:scale-110 transition-transform">
            {skill.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-base group-hover:text-neon transition-colors">
              {skill.name}
            </h4>
            <div className="text-xs text-soft">
              {определитьТекстУровня(skill.level)}
            </div>
          </div>
        </div>

        {/* Уровень владения */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-soft">Уровень владения</span>
            <span className={`text-sm font-bold ${определитьЦветУровня(skill.level)} glyph-glow`}>
              {skill.level}%
            </span>
          </div>

          {/* Прогресс бар */}
          <div className="w-full bg-panel rounded-full h-2 border border-line">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${цветнойФон}`}
              style={{ 
                width: `${skill.level}%`,
                boxShadow: skill.level >= 70 ? `0 0 8px ${categoryColor === "neon" ? "#00FF99" : 
                          categoryColor === "cyan" ? "#00FFCC" : 
                          categoryColor}` : "none"
              }}
            />
          </div>
        </div>

        {/* Метаинформация */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-line text-xs text-soft">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${цветнойФон}`} />
            <span>{skill.category}</span>
          </div>
          <div className="font-mono">
            {форматированнаяДата}
          </div>
        </div>

        {/* Hover эффекты */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon/5 to-transparent
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       pointer-events-none" />
      </div>
    </div>
  );
}