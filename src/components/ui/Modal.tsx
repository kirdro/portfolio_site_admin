"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Базовый компонент модального окна с киберпанк дизайном
 * Поддерживает анимации, закрытие по Escape и клику вне
 */
export function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Закрытие по Escape
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Блокировка скролла при открытой модалке
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Обработчик клика по бэкдропу
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Размеры модального окна
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl mx-4",
  };

  // Анимации
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={handleBackdropClick}
        >
          {/* Бэкдроп */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Модальное окно */}
          <motion.div
            ref={modalRef}
            className={`
              relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden
              bg-bg border border-line rounded-lg bevel
              shadow-2xl
              ${className}
            `}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок и кнопка закрытия */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-line bg-subtle">
                {title && (
                  <h3 className="text-xl font-bold text-base flex items-center gap-2">
                    {title}
                  </h3>
                )}
                
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg border border-line bg-panel hover:border-neon hover:shadow-neon
                             text-soft hover:text-base transition-all group"
                    aria-label="Закрыть модальное окно"
                  >
                    <svg
                      className="w-5 h-5 transition-transform group-hover:rotate-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Содержимое */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Вспомогательные компоненты для структурирования содержимого модалки

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalHeader({ children, className = "" }: ModalHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className = "" }: ModalBodyProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 border-t border-line ${className}`}>
      {children}
    </div>
  );
}

// Хук для управления состоянием модалки
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}