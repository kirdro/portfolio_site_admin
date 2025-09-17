import React from 'react';
import {
	FaReact,
	FaNodeJs,
	FaDocker,
	FaAws,
	FaJs,
	FaHtml5,
	FaCss3Alt,
	FaGitAlt,
	FaGithub,
	FaLinux,
	FaWindows,
	FaApple,
	FaDatabase,
	FaServer,
	FaCode,
	FaCog,
	FaRocket,
	FaBolt,
	FaTools,
	FaLaptopCode,
	FaMobile,
	FaTabletAlt,
	FaDesktop,
	FaCloud,
	FaShieldAlt,
	FaFileCode,
	FaTerminal,
	FaBug,
	FaSearch,
	FaEdit,
	FaSave,
	FaDownload,
	FaUpload,
	FaSync,
	FaCheck,
	FaTimes,
	FaPlus,
	FaMinus,
	FaArrowUp,
	FaArrowDown,
	FaArrowLeft,
	FaArrowRight,
	FaEye,
	FaEyeSlash,
	FaHeart,
	FaStar,
	FaFlag,
	FaPlay,
	FaPause,
	FaStop,
	FaTrash,
} from 'react-icons/fa';
import {
	SiTypescript,
	SiJavascript,
	SiReact,
	SiNodedotjs,
	SiPostgresql,
	SiMongodb,
	SiRedis,
	SiDocker,
	SiKubernetes,
	SiGooglecloud,
	SiGit,
	SiNginx,
	SiApache,
	SiLinux,
	SiUbuntu,
	SiCentos,
	SiDebian,
	SiMacos,
	SiNextdotjs,
	SiExpress,
	SiNestjs,
	SiFastapi,
	SiDjango,
	SiFlask,
	SiTailwindcss,
	SiBootstrap,
	SiSass,
	SiPrisma,
	SiSequelize,
	SiGraphql,
	SiJest,
	SiCypress,
	SiWebpack,
	SiVite,
	SiEslint,
	SiPrettier,
	SiFigma,
	SiSketch,
	SiNotion,
	SiSlack,
	SiTrello,
	SiJira,
	SiChrome,
	SiFirefox,
	SiSafari,
	SiAuth0,
	SiSupabase,
	SiFirebase,
	SiStrapi,
	SiContentful,
	SiDiscord,
	SiTelegram,
	SiZoom,
} from 'react-icons/si';
import {
	TbApi,
	TbApiApp,
	TbApiOff,
	TbNetwork,
	TbPlugConnected,
	TbCloudComputing,
	TbWebhook,
	TbCloudData,
	TbServer2,
	TbDatabase,
	TbBrandGraphql,
	TbMessageCircle,
	TbMessageDots,
	TbMessages,
	TbMail,
	TbMailbox,
	TbPhone,
	TbPhoneCall,
	TbVideo,
	TbVideoCameraOff,
	TbBroadcast,
	TbWifi,
	TbDeviceDesktopAnalytics,
	TbChartLine,
	TbChartBar,
	TbReportAnalytics,
	TbBrandRedux,
	TbBrandNextjs,
	TbBrandVite,
	TbBrandWebpack,
	TbBrandNpm,
	TbBrandYarn,
	TbPackage,
	TbPackages,
} from 'react-icons/tb';
import {
	MdHttp,
	MdHttps,
	MdApi,
	MdWebSocket,
	MdCloud,
	MdCloudSync,
	MdSync,
	MdSyncAlt,
	MdNetworkCheck,
	MdRouter,
	MdStorage,
	MdDataUsage,
	MdSpeed,
	MdSecurity,
	MdVpnKey,
	MdLock,
	MdLockOpen,
	MdVerifiedUser,
	MdAccountBox,
	MdNotifications,
	MdNotificationsActive,
	MdEmail,
	MdMessage,
	MdChat,
	MdForum,
	MdQuestionAnswer,
	MdSms,
	MdCall,
	MdVideoCall,
	MdScreenShare,
	MdCast,
	MdSignalWifi4Bar,
	MdSignalCellular4Bar,
	MdBluetooth,
	MdUsb,
	MdCable,
	MdSettingsEthernet,
	MdDns,
	MdPublic,
	MdLanguage,
	MdTranslate,
	MdPayment,
	MdShoppingCart,
	MdMonetizationOn,
	MdAccountBalanceWallet,
	MdCreditCard,
	MdReceipt,
	MdQrCode,
	MdQrCodeScanner,
	MdNfc,
	MdContactless,
	MdFingerprint,
	MdFaceRetouchingNatural,
	MdPassword,
	MdKey,
	MdToken,
	MdVpnLock,
	MdShield,
	MdPrivacyTip,
	MdGppGood,
	MdVerified,
	MdBugReport,
	MdErrorOutline,
	MdWarning,
	MdInfo,
	MdCheckCircle,
	MdCancel,
	MdHelpOutline,
	MdLightbulb,
	MdTips,
	MdEmojiObjects,
} from 'react-icons/md';

// Карта иконок с поддержкой как строковых названий, так и эмодзи
const iconMap: Record<string, React.ComponentType<any>> = {
	// React Icons - Fa
	'FaReact': FaReact,
	'FaNodeJs': FaNodeJs,
	'FaDocker': FaDocker,
	'FaAws': FaAws,
	'FaJs': FaJs,
	'FaHtml5': FaHtml5,
	'FaCss3Alt': FaCss3Alt,
	'FaGitAlt': FaGitAlt,
	'FaGithub': FaGithub,
	'FaLinux': FaLinux,
	'FaWindows': FaWindows,
	'FaApple': FaApple,
	'FaDatabase': FaDatabase,
	'FaServer': FaServer,
	'FaCode': FaCode,
	'FaCog': FaCog,
	'FaRocket': FaRocket,
	'FaBolt': FaBolt,
	'FaTools': FaTools,
	'FaLaptopCode': FaLaptopCode,
	'FaMobile': FaMobile,
	'FaTabletAlt': FaTabletAlt,
	'FaDesktop': FaDesktop,
	'FaCloud': FaCloud,
	'FaShieldAlt': FaShieldAlt,
	'FaFileCode': FaFileCode,
	'FaTerminal': FaTerminal,
	'FaBug': FaBug,
	'FaSearch': FaSearch,

	// React Icons - Si (Simple Icons)
	'SiTypescript': SiTypescript,
	'SiJavascript': SiJavascript,
	'SiReact': SiReact,
	'SiNodedotjs': SiNodedotjs,
	'SiPostgresql': SiPostgresql,
	'SiMongodb': SiMongodb,
	'SiRedis': SiRedis,
	'SiDocker': SiDocker,
	'SiKubernetes': SiKubernetes,
	'SiGooglecloud': SiGooglecloud,
	'SiGit': SiGit,
	'SiNginx': SiNginx,
	'SiApache': SiApache,
	'SiLinux': SiLinux,
	'SiUbuntu': SiUbuntu,
	'SiCentos': SiCentos,
	'SiDebian': SiDebian,
	'SiMacos': SiMacos,
	'SiNextdotjs': SiNextdotjs,
	'SiExpress': SiExpress,
	'SiNestjs': SiNestjs,
	'SiFastapi': SiFastapi,
	'SiDjango': SiDjango,
	'SiFlask': SiFlask,
	'SiTailwindcss': SiTailwindcss,
	'SiBootstrap': SiBootstrap,
	'SiSass': SiSass,
	'SiPrisma': SiPrisma,
	'SiSequelize': SiSequelize,
	'SiGraphql': SiGraphql,
	'SiJest': SiJest,
	'SiCypress': SiCypress,
	'SiWebpack': SiWebpack,
	'SiVite': SiVite,
	'SiEslint': SiEslint,
	'SiPrettier': SiPrettier,
	'SiFigma': SiFigma,
	'SiSketch': SiSketch,
	'SiNotion': SiNotion,
	'SiSlack': SiSlack,
	'SiTrello': SiTrello,
	'SiJira': SiJira,
	'SiChrome': SiChrome,
	'SiFirefox': SiFirefox,
	'SiSafari': SiSafari,
	'SiAuth0': SiAuth0,
	'SiSupabase': SiSupabase,
	'SiFirebase': SiFirebase,
	'SiStrapi': SiStrapi,
	'SiContentful': SiContentful,
	'SiDiscord': SiDiscord,
	'SiTelegram': SiTelegram,
	'SiZoom': SiZoom,

	// Tabler Icons
	'TbApi': TbApi,
	'TbApiApp': TbApiApp,
	'TbApiOff': TbApiOff,
	'TbNetwork': TbNetwork,
	'TbPlugConnected': TbPlugConnected,
	'TbCloudComputing': TbCloudComputing,
	'TbWebhook': TbWebhook,
	'TbCloudData': TbCloudData,
	'TbServer2': TbServer2,
	'TbDatabase': TbDatabase,
	'TbBrandGraphql': TbBrandGraphql,
	'TbMessageCircle': TbMessageCircle,
	'TbMessageDots': TbMessageDots,
	'TbMessages': TbMessages,
	'TbMail': TbMail,
	'TbMailbox': TbMailbox,
	'TbPhone': TbPhone,
	'TbPhoneCall': TbPhoneCall,
	'TbVideo': TbVideo,
	'TbVideoCameraOff': TbVideoCameraOff,
	'TbBroadcast': TbBroadcast,
	'TbWifi': TbWifi,
	'TbDeviceDesktopAnalytics': TbDeviceDesktopAnalytics,
	'TbChartLine': TbChartLine,
	'TbChartBar': TbChartBar,
	'TbReportAnalytics': TbReportAnalytics,
	'TbBrandRedux': TbBrandRedux,
	'TbBrandNextjs': TbBrandNextjs,
	'TbBrandVite': TbBrandVite,
	'TbBrandWebpack': TbBrandWebpack,
	'TbBrandNpm': TbBrandNpm,
	'TbBrandYarn': TbBrandYarn,
	'TbPackage': TbPackage,
	'TbPackages': TbPackages,

	// Material Design Icons
	'MdHttp': MdHttp,
	'MdHttps': MdHttps,
	'MdApi': MdApi,
	'MdWebSocket': MdWebSocket,
	'MdCloud': MdCloud,
	'MdCloudSync': MdCloudSync,
	'MdSync': MdSync,
	'MdSyncAlt': MdSyncAlt,
	'MdNetworkCheck': MdNetworkCheck,
	'MdRouter': MdRouter,
	'MdStorage': MdStorage,
	'MdDataUsage': MdDataUsage,
	'MdSpeed': MdSpeed,
	'MdSecurity': MdSecurity,
	'MdVpnKey': MdVpnKey,
	'MdLock': MdLock,
	'MdLockOpen': MdLockOpen,
	'MdVerifiedUser': MdVerifiedUser,
	'MdAccountBox': MdAccountBox,
	'MdNotifications': MdNotifications,
	'MdNotificationsActive': MdNotificationsActive,
	'MdEmail': MdEmail,
	'MdMessage': MdMessage,
	'MdChat': MdChat,
	'MdForum': MdForum,
	'MdQuestionAnswer': MdQuestionAnswer,
	'MdSms': MdSms,
	'MdCall': MdCall,
	'MdVideoCall': MdVideoCall,
	'MdScreenShare': MdScreenShare,
	'MdCast': MdCast,
	'MdSignalWifi4Bar': MdSignalWifi4Bar,
	'MdSignalCellular4Bar': MdSignalCellular4Bar,
	'MdBluetooth': MdBluetooth,
	'MdUsb': MdUsb,
	'MdCable': MdCable,
	'MdSettingsEthernet': MdSettingsEthernet,
	'MdDns': MdDns,
	'MdPublic': MdPublic,
	'MdLanguage': MdLanguage,
	'MdTranslate': MdTranslate,
	'MdPayment': MdPayment,
	'MdShoppingCart': MdShoppingCart,
	'MdMonetizationOn': MdMonetizationOn,
	'MdAccountBalanceWallet': MdAccountBalanceWallet,
	'MdCreditCard': MdCreditCard,
	'MdReceipt': MdReceipt,
	'MdQrCode': MdQrCode,
	'MdQrCodeScanner': MdQrCodeScanner,
	'MdNfc': MdNfc,
	'MdContactless': MdContactless,
	'MdFingerprint': MdFingerprint,
	'MdFaceRetouchingNatural': MdFaceRetouchingNatural,
	'MdPassword': MdPassword,
	'MdKey': MdKey,
	'MdToken': MdToken,
	'MdVpnLock': MdVpnLock,
	'MdShield': MdShield,
	'MdPrivacyTip': MdPrivacyTip,
	'MdGppGood': MdGppGood,
	'MdVerified': MdVerified,
	'MdBugReport': MdBugReport,
	'MdErrorOutline': MdErrorOutline,
	'MdWarning': MdWarning,
	'MdInfo': MdInfo,
	'MdCheckCircle': MdCheckCircle,
	'MdCancel': MdCancel,
	'MdHelpOutline': MdHelpOutline,
	'MdLightbulb': MdLightbulb,
	'MdTips': MdTips,
	'MdEmojiObjects': MdEmojiObjects,

	// Маппинг эмодзи и названий на иконки
	'⚛️': SiReact,
	'react': SiReact,
	'React': SiReact,

	'📘': SiTypescript,
	'typescript': SiTypescript,
	'TypeScript': SiTypescript,

	'🟢': SiNodedotjs,
	'nodejs': SiNodedotjs,
	'Node.js': SiNodedotjs,
	'node': SiNodedotjs,

	'🐘': SiPostgresql,
	'postgresql': SiPostgresql,
	'PostgreSQL': SiPostgresql,
	'postgres': SiPostgresql,

	'🐳': SiDocker,
	'docker': SiDocker,
	'Docker': SiDocker,

	'☁️': FaCloud,
	'aws': FaAws,
	'AWS': FaAws,

	'📜': SiJavascript,
	'javascript': SiJavascript,
	'JavaScript': SiJavascript,
	'js': SiJavascript,

	'🔥': SiNextdotjs,
	'nextjs': SiNextdotjs,
	'Next.js': SiNextdotjs,
	'next': SiNextdotjs,

	'🎨': SiTailwindcss,
	'tailwind': SiTailwindcss,
	'TailwindCSS': SiTailwindcss,
	'tailwindcss': SiTailwindcss,

	'⚡': SiVite,
	'vite': SiVite,
	'Vite': SiVite,

	'🛠️': FaTools,
	'tools': FaTools,
	'Tools': FaTools,

	// Протоколы связи и API
	'grpc': TbApi,
	'gRPC': TbApi,
	'GRPC': TbApi,
	'protobuf': TbApi,
	'protocol buffers': TbApi,

	'graphql': SiGraphql,
	'GraphQL': SiGraphql,
	'GRAPHQL': SiGraphql,
	'apollo': TbBrandGraphql,
	'Apollo': TbBrandGraphql,
	'apollo graphql': TbBrandGraphql,

	'rest': TbApi,
	'REST': TbApi,
	'restful': TbApi,
	'RESTful': TbApi,
	'rest api': TbApi,
	'REST API': TbApi,
	'api': TbApi,
	'API': TbApi,

	'🔌': MdWebSocket,
	'websocket': MdWebSocket,
	'WebSocket': MdWebSocket,
	'WebSockets': MdWebSocket,
	'ws': MdWebSocket,

	'⚡🔌': TbPlugConnected,
	'🚀🔌': TbPlugConnected,
	'socket.io': TbPlugConnected,
	'socketio': TbPlugConnected,
	'socket io': TbPlugConnected,
	'Socket.IO': TbPlugConnected,
	'socket-io': TbPlugConnected,

	'http': MdHttp,
	'HTTP': MdHttp,
	'https': MdHttps,
	'HTTPS': MdHttps,
	'http/2': MdHttps,
	'HTTP/2': MdHttps,
	'http2': MdHttps,

	'webhook': TbWebhook,
	'webhooks': TbWebhook,
	'Webhook': TbWebhook,
	'Webhooks': TbWebhook,

	// React API библиотеки
	'react query': TbCloudData,
	'React Query': TbCloudData,
	'ReactQuery': TbCloudData,
	'tanstack query': TbCloudData,
	'TanStack Query': TbCloudData,

	'swr': TbCloudData,
	'SWR': TbCloudData,
	'useSWR': TbCloudData,

	'react router': FaCode,
	'React Router': FaCode,
	'ReactRouter': FaCode,
	'router': FaCode,

	'react hook form': FaCode,
	'React Hook Form': FaCode,
	'ReactHookForm': FaCode,
	'rhf': FaCode,

	'redux': TbBrandRedux,
	'Redux': TbBrandRedux,
	'redux toolkit': TbBrandRedux,
	'Redux Toolkit': TbBrandRedux,
	'rtk': TbBrandRedux,

	'zustand': FaCode,
	'Zustand': FaCode,
	'jotai': FaCode,
	'Jotai': FaCode,
	'recoil': FaCode,
	'Recoil': FaCode,

	// Аутентификация и авторизация
	'jwt': MdKey,
	'JWT': MdKey,
	'json web token': MdKey,
	'JSON Web Token': MdKey,

	'auth0': SiAuth0,
	'Auth0': SiAuth0,
	'passport': MdLock,
	'Passport': MdLock,
	'passportjs': MdLock,
	'Passport.js': MdLock,

	'nextauth': MdLock,
	'NextAuth': MdLock,
	'next-auth': MdLock,
	'NextAuth.js': MdLock,

	'oauth': MdVerifiedUser,
	'OAuth': MdVerifiedUser,
	'oauth2': MdVerifiedUser,
	'OAuth2': MdVerifiedUser,

	// Backend as a Service
	'supabase': SiSupabase,
	'Supabase': SiSupabase,
	'firebase': SiFirebase,
	'Firebase': SiFirebase,
	'firebase auth': SiFirebase,
	'Firebase Auth': SiFirebase,

	// CMS и Headless CMS
	'strapi': SiStrapi,
	'Strapi': SiStrapi,
	'contentful': SiContentful,
	'Contentful': SiContentful,

	// Уведомления и Push
	'push notifications': MdNotifications,
	'Push Notifications': MdNotifications,
	'notifications': MdNotifications,
	'Notifications': MdNotifications,

	// WebRTC и видеосвязь
	'webrtc': MdVideoCall,
	'WebRTC': MdVideoCall,
	'zoom': SiZoom,
	'Zoom': SiZoom,

	// Мессенджеры и чаты
	'discord': SiDiscord,
	'Discord': SiDiscord,
	'telegram': SiTelegram,
	'Telegram': SiTelegram,
	'slack': SiSlack,
	'Slack': SiSlack,

	// Платежи и E-commerce
	'stripe': MdPayment,
	'Stripe': MdPayment,
	'paypal': MdPayment,
	'PayPal': MdPayment,
	'payment': MdPayment,
	'payments': MdPayment,
	'e-commerce': MdShoppingCart,
	'ecommerce': MdShoppingCart,
	'E-commerce': MdShoppingCart,

	// Мониторинг и аналитика
	'analytics': TbDeviceDesktopAnalytics,
	'Analytics': TbDeviceDesktopAnalytics,
	'google analytics': TbDeviceDesktopAnalytics,
	'Google Analytics': TbDeviceDesktopAnalytics,
	'ga': TbDeviceDesktopAnalytics,

	// Тестирование API
	'api testing': TbApiApp,
	'API Testing': TbApiApp,

	// Архитектурные паттерны
	'microservices': TbServer2,
	'Microservices': TbServer2,
	'monolith': TbServer2,
	'Monolith': TbServer2,
	'serverless': MdCloud,
	'Serverless': MdCloud,
	'lambda': MdCloud,
	'Lambda': MdCloud,

	'🐍': SiDjango, // Python/Django
	'python': SiDjango,
	'Python': SiDjango,

	'🔧': FaCog,
	'config': FaCog,
	'configuration': FaCog,

	'💻': FaLaptopCode,
	'code': FaCode,
	'coding': FaCode,

	'🚀': FaRocket,
	'deploy': FaRocket,
	'deployment': FaRocket,

	'🔒': FaShieldAlt,
	'security': FaShieldAlt,
	'auth': FaShieldAlt,

	'📊': FaDatabase,
	'database': FaDatabase,
	'db': FaDatabase,

	'🖥️': FaDesktop,
	'desktop': FaDesktop,

	'📱': FaMobile,
	'mobile': FaMobile,

	'🌐': FaCloud,
	'web': FaCloud,
	'website': FaCloud,

	'📋': FaFileCode,
	'file': FaFileCode,
	'document': FaFileCode,

	'🔍': FaSearch,
	'search': FaSearch,

	'⚙️': FaCog,
	'settings': FaCog,

	'💾': FaSave,
	'save': FaSave,
	'storage': FaSave,

	'🔄': FaSync,
	'sync': FaSync,
	'refresh': FaSync,

	'✅': FaCheck,
	'check': FaCheck,
	'done': FaCheck,

	'❌': FaTimes,
	'close': FaTimes,
	'cancel': FaTimes,

	'➕': FaPlus,
	'add': FaPlus,
	'plus': FaPlus,

	'➖': FaMinus,
	'minus': FaMinus,
	'remove': FaMinus,

	'👁️': FaEye,
	'view': FaEye,
	'show': FaEye,

	'❤️': FaHeart,
	'heart': FaHeart,
	'like': FaHeart,

	'⭐': FaStar,
	'star': FaStar,
	'favorite': FaStar,

	'🚩': FaFlag,
	'flag': FaFlag,

	'▶️': FaPlay,
	'play': FaPlay,

	'⏸️': FaPause,
	'pause': FaPause,

	'⏹️': FaStop,
	'stop': FaStop,
};

/**
 * Хук для получения React иконки по строковому идентификатору
 * Поддерживает как названия компонентов React Icons, так и эмодзи
 */
export function useIconMapping() {
	const getIcon = (iconKey: string): React.ComponentType<any> | null => {
		// Проверяем точное совпадение
		if (iconMap[iconKey]) {
			return iconMap[iconKey];
		}

		// Проверяем без учета регистра для строковых названий
		const lowerKey = iconKey.toLowerCase();
		const foundKey = Object.keys(iconMap).find(key => key.toLowerCase() === lowerKey);
		if (foundKey) {
			return iconMap[foundKey];
		}

		// Если ничего не найдено, возвращаем дефолтную иконку
		return FaCode;
	};

	const renderIcon = (iconKey: string, props: any = {}) => {
		const IconComponent = getIcon(iconKey);
		// Всегда возвращаем иконку, если не найдена - используем FaCode как fallback
		const FinalIconComponent = IconComponent || FaCode;

		return React.createElement(FinalIconComponent, props);
	};

	return { getIcon, renderIcon };
}

/**
 * Список доступных иконок для селектора в форме
 */
export const getAvailableIcons = (): Array<{ key: string; name: string; component: React.ComponentType<any> }> => {
	const iconList = [
		// Frontend фреймворки и библиотеки
		{ key: 'SiReact', name: 'React', component: SiReact },
		{ key: 'SiNextdotjs', name: 'Next.js', component: SiNextdotjs },
		{ key: 'SiVite', name: 'Vite', component: SiVite },
		{ key: 'SiWebpack', name: 'Webpack', component: SiWebpack },

		// Языки программирования
		{ key: 'SiTypescript', name: 'TypeScript', component: SiTypescript },
		{ key: 'SiJavascript', name: 'JavaScript', component: SiJavascript },

		// Backend технологии
		{ key: 'SiNodedotjs', name: 'Node.js', component: SiNodedotjs },
		{ key: 'SiExpress', name: 'Express.js', component: SiExpress },
		{ key: 'SiNestjs', name: 'NestJS', component: SiNestjs },
		{ key: 'SiFastapi', name: 'FastAPI', component: SiFastapi },
		{ key: 'SiDjango', name: 'Django', component: SiDjango },
		{ key: 'SiFlask', name: 'Flask', component: SiFlask },

		// Базы данных
		{ key: 'SiPostgresql', name: 'PostgreSQL', component: SiPostgresql },
		{ key: 'SiMongodb', name: 'MongoDB', component: SiMongodb },
		{ key: 'SiRedis', name: 'Redis', component: SiRedis },
		{ key: 'SiPrisma', name: 'Prisma', component: SiPrisma },
		{ key: 'SiSequelize', name: 'Sequelize', component: SiSequelize },

		// Протоколы связи и API
		{ key: 'SiGraphql', name: 'GraphQL', component: SiGraphql },
		{ key: 'TbBrandGraphql', name: 'Apollo GraphQL', component: TbBrandGraphql },
		{ key: 'TbApi', name: 'gRPC / REST API', component: TbApi },
		{ key: 'MdWebSocket', name: 'WebSocket', component: MdWebSocket },
		{ key: 'TbPlugConnected', name: 'Socket.IO', component: TbPlugConnected },
		{ key: 'TbWebhook', name: 'Webhooks', component: TbWebhook },

		// React экосистема
		{ key: 'TbCloudData', name: 'React Query / SWR', component: TbCloudData },
		{ key: 'TbBrandRedux', name: 'Redux', component: TbBrandRedux },

		// Аутентификация и безопасность
		{ key: 'MdKey', name: 'JWT', component: MdKey },
		{ key: 'SiAuth0', name: 'Auth0', component: SiAuth0 },
		{ key: 'MdLock', name: 'NextAuth.js / Passport', component: MdLock },
		{ key: 'MdVerifiedUser', name: 'OAuth', component: MdVerifiedUser },
		{ key: 'FaShieldAlt', name: 'Безопасность', component: FaShieldAlt },

		// Backend as a Service
		{ key: 'SiSupabase', name: 'Supabase', component: SiSupabase },
		{ key: 'SiFirebase', name: 'Firebase', component: SiFirebase },
		{ key: 'SiStrapi', name: 'Strapi', component: SiStrapi },
		{ key: 'SiContentful', name: 'Contentful', component: SiContentful },

		// DevOps и облачные технологии
		{ key: 'SiDocker', name: 'Docker', component: SiDocker },
		{ key: 'SiKubernetes', name: 'Kubernetes', component: SiKubernetes },
		{ key: 'FaAws', name: 'AWS', component: FaAws },
		{ key: 'SiGooglecloud', name: 'Google Cloud', component: SiGooglecloud },
		{ key: 'FaRocket', name: 'DevOps', component: FaRocket },
		{ key: 'MdCloud', name: 'Serverless', component: MdCloud },

		// Стили и UI
		{ key: 'SiTailwindcss', name: 'Tailwind CSS', component: SiTailwindcss },
		{ key: 'SiBootstrap', name: 'Bootstrap', component: SiBootstrap },
		{ key: 'SiSass', name: 'Sass', component: SiSass },

		// Инструменты разработки
		{ key: 'SiGit', name: 'Git', component: SiGit },
		{ key: 'SiFigma', name: 'Figma', component: SiFigma },
		{ key: 'SiSketch', name: 'Sketch', component: SiSketch },

		// Тестирование
		{ key: 'SiJest', name: 'Jest', component: SiJest },
		{ key: 'SiCypress', name: 'Cypress', component: SiCypress },

		// Пакетные менеджеры
		{ key: 'TbBrandNpm', name: 'npm', component: TbBrandNpm },
		{ key: 'TbBrandYarn', name: 'Yarn', component: TbBrandYarn },
		{ key: 'TbPackage', name: 'Package Manager', component: TbPackage },

		// Операционные системы
		{ key: 'SiLinux', name: 'Linux', component: SiLinux },
		{ key: 'SiUbuntu', name: 'Ubuntu', component: SiUbuntu },
		{ key: 'SiMacos', name: 'macOS', component: SiMacos },

		// Браузеры
		{ key: 'SiChrome', name: 'Chrome', component: SiChrome },
		{ key: 'SiFirefox', name: 'Firefox', component: SiFirefox },
		{ key: 'SiSafari', name: 'Safari', component: SiSafari },

		// Коммуникация
		{ key: 'SiSlack', name: 'Slack', component: SiSlack },
		{ key: 'SiDiscord', name: 'Discord', component: SiDiscord },
		{ key: 'SiTelegram', name: 'Telegram', component: SiTelegram },
		{ key: 'SiZoom', name: 'Zoom', component: SiZoom },

		// Общие категории
		{ key: 'FaCode', name: 'Общее (Код)', component: FaCode },
		{ key: 'FaDatabase', name: 'База данных', component: FaDatabase },
		{ key: 'FaServer', name: 'Сервер', component: FaServer },
		{ key: 'FaTools', name: 'Инструменты', component: FaTools },
		{ key: 'FaMobile', name: 'Мобильная разработка', component: FaMobile },
		{ key: 'FaCloud', name: 'Облачные технологии', component: FaCloud },
		{ key: 'TbDeviceDesktopAnalytics', name: 'Аналитика', component: TbDeviceDesktopAnalytics },
		{ key: 'MdPayment', name: 'Платежи', component: MdPayment },
		{ key: 'MdNotifications', name: 'Уведомления', component: MdNotifications },
		{ key: 'TbServer2', name: 'Микросервисы', component: TbServer2 },
	];

	// Фильтруем иконки, чтобы убедиться что компонент существует
	return iconList.filter(icon => {
		try {
			// Проверяем что компонент действительно существует
			return icon.component && typeof icon.component === 'function';
		} catch (error) {
			console.warn(`Иконка ${icon.key} не найдена, пропускаем`);
			return false;
		}
	});
};