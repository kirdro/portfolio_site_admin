module.exports = {
	apps: [
		{
			name: 'admin-kirdro-portfolio', // Уникальное имя процесса для админки
			script: 'bun',
			args: 'start',
			cwd: '/var/www/admin.kirdro.ru',
			instances: 1,
			exec_mode: 'fork',
			env_file: '.env',

			env: {
				NODE_ENV: 'production',
				PORT: 3004, // Порт админки (отдельный от основного сайта)
			},

			env_production: {
				NODE_ENV: 'production',
				PORT: 3004,
			},

			// Логи (отдельные от основного сайта)
			error_file: '/var/log/admin-kirdro/error.log',
			out_file: '/var/log/admin-kirdro/access.log',
			log_file: '/var/log/admin-kirdro/app.log',
			time: true,

			// Настройки перезапуска
			watch: false, // НЕ следим за изменениями файлов в продакшне
			min_uptime: '10s', // Минимальное время работы перед рестартом
			max_restarts: 10, // Максимальное количество рестартов в час
			max_memory_restart: '1G', // Рестарт при превышении 1GB памяти

			// Graceful shutdown
			kill_timeout: 5000, // Таймаут graceful shutdown (5 сек)
			wait_ready: false, // Не ждать ready сигнала от приложения
			listen_timeout: 10000, // Таймаут ожидания запуска (10 сек)

			// Health monitoring
			health_check_url: 'http://localhost:3004/api/health',
			health_check_grace_period: 3000, // Время на запуск перед проверкой здоровья

			// Автоперезапуск при краше
			autorestart: true,

			// Переменные окружения для PM2
			node_args: '--max-old-space-size=1024', // Максимум 1GB для Node.js heap

			// Логирование
			merge_logs: true, // Объединить stdout и stderr
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

			// Дополнительные настройки для Next.js
			source_map_support: true, // Поддержка source maps
			instance_var: 'INSTANCE_ID', // Переменная для идентификации инстанса
		},
	],
};
