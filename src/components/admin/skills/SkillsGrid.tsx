"use client";

import React from "react";
import { SkillCard } from "./SkillCard";
import type { SkillData } from "../../../app/(dashboard)/skills/page";

interface SkillsGridProps {
  skills: SkillData[];
  loading: boolean;
  onSkillClick: (skill: SkillData) => void;
  onCreateSkill: () => void;
}

/**
 * Адаптивная CSS Grid сетка навыков с группировкой по категориям
 * Приоритет CSS Grid над Flexbox согласно архитектурным требованиям
 */
export function SkillsGrid({ 
  skills, 
  loading, 
  onSkillClick,
  onCreateSkill 
}: SkillsGridProps) {

  // Loading состояние с скелетонами
  if (loading) {
    return (
      <div className="bg-panel border border-line rounded-lg bevel p-6">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <div className="h-6 bg-subtle rounded w-32 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-24 bg-subtle rounded-lg mb-2" />
                    <div className="h-4 bg-subtle rounded mb-1" />
                    <div className="h-3 bg-subtle rounded w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Группировка навыков по категориям
  const навыкиПоКатегориям = skills.reduce((группы, навык) => {
    if (!группы[навык.category]) {
      группы[навык.category] = [];
    }
    группы[навык.category]?.push(навык);
    return группы;
  }, {} as Record<string, SkillData[]>);

  // Сортировка навыков в каждой категории по уровню (убывание)
  Object.keys(навыкиПоКатегориям).forEach(category => {
    навыкиПоКатегориям[category]?.sort((a, b) => b.level - a.level);
  });

  // Порядок отображения категорий
  const порядокКатегорий = ["Frontend", "Backend", "DevOps", "Tools", "Other"];
  const отсортированныеКатегории = порядокКатегорий.filter(cat => 
    навыкиПоКатегориям[cat] && навыкиПоКатегориям[cat].length > 0
  );

  // Иконки для категорий
  const иконкиКатегорий = {
    Frontend: "🎨",
    Backend: "⚙️", 
    DevOps: "🚀",
    Tools: "🛠️",
    Other: "💡"
  };

  // Цвета для категорий
  const цветаКатегорий = {
    Frontend: "neon",
    Backend: "cyan",
    DevOps: "purple-400",
    Tools: "yellow-400",
    Other: "orange-400"
  };

  // Состояние пустых данных
  if (skills.length === 0) {
    return (
      <div className="bg-panel border border-line rounded-lg bevel p-12 text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h3 className="text-xl font-bold text-base mb-2">
          Навыки не найдены
        </h3>
        <p className="text-soft mb-6">
          Добавьте первый навык в портфолио
        </p>
        <button
          onClick={onCreateSkill}
          className="px-6 py-3 bg-neon/20 border border-neon text-neon
                   hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                   bevel transition-all duration-300"
        >
          ➕ Добавить навык
        </button>
      </div>
    );
  }

  return (
    <div className="bg-panel border border-line rounded-lg bevel p-6">
      <div className="space-y-8">
        {отсортированныеКатегории.map((category) => {
          const навыкиВКатегории = навыкиПоКатегориям[category];
          const цветКатегории = цветаКатегорий[category as keyof typeof цветаКатегорий];
          const иконка = иконкиКатегорий[category as keyof typeof иконкиКатегорий];
          
          if (!навыкиВКатегории || навыкиВКатегории.length === 0) return null;
          
          return (
            <div key={category} className="space-y-4">
              {/* Заголовок категории */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{иконка}</div>
                  <h3 className={`text-lg font-bold text-${цветКатегории} glyph-glow`}>
                    {category}
                  </h3>
                  <div className="text-sm text-soft">
                    ({навыкиВКатегории.length} навык{навыкиВКатегории.length === 1 ? '' : навыкиВКатегории.length < 5 ? 'а' : 'ов'})
                  </div>
                </div>
                
                {/* Средний уровень категории */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-soft">Средний уровень:</span>
                  <span className={`text-sm font-bold text-${цветКатегории}`}>
                    {Math.round(навыкиВКатегории.reduce((sum, s) => sum + s.level, 0) / навыкиВКатегории.length)}%
                  </span>
                </div>
              </div>

              {/* CSS Grid сетка навыков */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {навыкиВКатегории.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onClick={onSkillClick}
                    categoryColor={цветКатегории}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Карточка создания нового навыка */}
        <div className="border-t border-line pt-6">
          <div
            onClick={onCreateSkill}
            className="h-24 bg-subtle/50 border-2 border-dashed border-line
                     hover:border-neon hover:bg-neon/5 rounded-lg
                     flex flex-col items-center justify-center
                     cursor-pointer transition-all duration-300 group"
          >
            <div className="text-2xl mb-2 text-soft group-hover:text-neon transition-colors">
              ➕
            </div>
            <div className="text-sm text-soft group-hover:text-neon transition-colors">
              Добавить навык
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}