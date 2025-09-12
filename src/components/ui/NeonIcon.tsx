import React from 'react';
import { type IconType } from 'react-icons';

interface NeonIconProps {
  Icon: IconType;
  size?: number;
  className?: string;
  variant?: 'default' | 'subtle' | 'intense' | 'pulse' | 'cyan' | 'purple' | 'orange' | 'red';
  onClick?: () => void;
  title?: string;
}

/**
 * Универсальный компонент для отображения иконок с неоновым эффектом
 * Поддерживает все иконки из react-icons с киберпанк стилизацией
 * 
 * @param Icon - Иконка из react-icons (например, FaFolder)
 * @param size - Размер иконки в пикселях (по умолчанию 20)
 * @param variant - Вариант стиля свечения
 * @param className - Дополнительные CSS классы
 * @param onClick - Обработчик клика
 * @param title - Всплывающая подсказка
 */
export const NeonIcon: React.FC<NeonIconProps> = ({
  Icon,
  size = 20,
  className = '',
  variant = 'default',
  onClick,
  title
}) => {
  const variantClass = {
    default: 'neon-icon',
    subtle: 'neon-icon-subtle', 
    intense: 'neon-icon-intense',
    pulse: 'neon-icon neon-icon-pulse',
    cyan: 'neon-icon-cyan',
    purple: 'neon-icon-purple',
    orange: 'neon-icon-orange',
    red: 'neon-icon-red'
  }[variant];

  return (
    <Icon 
      size={size}
      className={`${variantClass} ${className}`}
      onClick={onClick}
      title={title}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
};

// Дополнительные утилитарные компоненты
interface NeonIconButtonProps {
  Icon: IconType;
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'cyan' | 'purple' | 'orange' | 'red';
  disabled?: boolean;
  className?: string;
}

/**
 * Кнопка с неоновой иконкой в киберпанк стиле
 */
export const NeonIconButton: React.FC<NeonIconButtonProps> = ({
  Icon,
  children,
  onClick,
  variant = 'default',
  disabled = false,
  className = ''
}) => {
  const variantClasses = {
    default: 'neon-icon-button',
    cyan: 'neon-icon-button border-[#00FFCC] text-[#00FFCC] hover:border-[#00FF99] hover:text-[#00FF99]',
    purple: 'neon-icon-button border-[#A855F7] text-[#A855F7] hover:border-[#C084FC] hover:text-[#C084FC]',
    orange: 'neon-icon-button border-[#FF8C00] text-[#FF8C00] hover:border-[#FFB84D] hover:text-[#FFB84D]',
    red: 'neon-icon-button border-[#FF4444] text-[#FF4444] hover:border-[#FF6666] hover:text-[#FF6666]'
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <NeonIcon 
        Icon={Icon} 
        variant={variant === 'default' ? 'default' : variant}
        size={16}
      />
      <span>{children}</span>
    </button>
  );
};

// Хуки для часто используемых иконок
export const useCommonIcons = () => ({
  // Административные
  folder: { import: 'FaFolder', from: 'react-icons/fa' },
  clipboard: { import: 'FaClipboardList', from: 'react-icons/fa' },
  settings: { import: 'FaCog', from: 'react-icons/fa' },
  users: { import: 'FaUsers', from: 'react-icons/fa' },
  comments: { import: 'FaComments', from: 'react-icons/fa' },
  robot: { import: 'FaRobot', from: 'react-icons/fa' },
  chart: { import: 'FaChartBar', from: 'react-icons/fa' },
  lock: { import: 'FaLock', from: 'react-icons/fa' },
  
  // Действия
  plus: { import: 'FaPlus', from: 'react-icons/fa' },
  edit: { import: 'FaEdit', from: 'react-icons/fa' },
  trash: { import: 'FaTrash', from: 'react-icons/fa' },
  eye: { import: 'FaEye', from: 'react-icons/fa' },
  save: { import: 'FaSave', from: 'react-icons/fa' },
  sync: { import: 'FaSync', from: 'react-icons/fa' },
  rocket: { import: 'FaRocket', from: 'react-icons/fa' },
  star: { import: 'FaStar', from: 'react-icons/fa' },
  
  // Статусы
  check: { import: 'FaCheck', from: 'react-icons/fa' },
  checkCircle: { import: 'FaCheckCircle', from: 'react-icons/fa' },
  times: { import: 'FaTimes', from: 'react-icons/fa' },
  timesCircle: { import: 'FaTimesCircle', from: 'react-icons/fa' },
  exclamationTriangle: { import: 'FaExclamationTriangle', from: 'react-icons/fa' },
  infoCircle: { import: 'FaInfoCircle', from: 'react-icons/fa' },
  chartLine: { import: 'FaChartLine', from: 'react-icons/fa' },
  fire: { import: 'FaFire', from: 'react-icons/fa' },
  
  // Контент
  file: { import: 'FaFile', from: 'react-icons/fa' },
  image: { import: 'FaImage', from: 'react-icons/fa' },
  camera: { import: 'FaCamera', from: 'react-icons/fa' },
  upload: { import: 'FaUpload', from: 'react-icons/fa' },
  download: { import: 'FaDownload', from: 'react-icons/fa' }
});

export default NeonIcon;