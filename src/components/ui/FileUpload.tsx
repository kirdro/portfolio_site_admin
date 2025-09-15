'use client';

import React, { useState, useRef } from 'react';
import { api } from '../../utils/api';
import { FaUpload, FaTrash, FaImage, FaFile } from 'react-icons/fa';
import { NeonIcon } from './NeonIcon';
import { ProgressLoader } from './loaders';

interface FileUploadProps {
	onFileUploaded: (fileUrl: string) => void;
	onFileDeleted?: () => void;
	currentFileUrl?: string;
	category: 'project' | 'skill' | 'blog' | 'chat' | 'main_photo';
	acceptedTypes?: string;
	maxSize?: number;
	preview?: boolean;
	className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
	onFileUploaded,
	onFileDeleted,
	currentFileUrl,
	category,
	acceptedTypes = 'image/*',
	maxSize = 10 * 1024 * 1024,
	preview = true,
	className = '',
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [dragOver, setDragOver] = useState(false);
	const [error, setError] = useState<string>('');

	const uploadMutation = api.files.upload.useMutation({
		onSuccess: (data) => {
			onFileUploaded(data.url);
			setUploading(false);
			setUploadProgress(0);
			setError('');
		},
		onError: (error) => {
			console.error('Ошибка загрузки:', error);
			setError(error.message || 'Ошибка загрузки файла');
			setUploading(false);
			setUploadProgress(0);
		},
	});

	const handleFileSelect = async (file: File) => {
		if (file.size > maxSize) {
			setError(
				`Файл слишком большой. Максимум: ${maxSize / 1024 / 1024}MB`,
			);
			return;
		}

		setUploading(true);
		setUploadProgress(0);
		setError('');

		// Симуляция прогресса загрузки
		const progressInterval = setInterval(() => {
			setUploadProgress((prev) => {
				if (prev >= 90) {
					clearInterval(progressInterval);
					return 90; // Оставляем 90% до завершения API вызова
				}
				return prev + Math.random() * 15;
			});
		}, 200);

		// Конвертация файла в base64
		const reader = new FileReader();
		reader.onload = () => {
			const base64 = (reader.result as string).split(',')[1]!;

			// Финализируем прогресс при отправке
			setUploadProgress(95);

			uploadMutation.mutate({
				file: base64,
				fileName: file.name,
				mimeType: file.type,
				category,
				maxSize,
			});
		};
		reader.readAsDataURL(file);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileSelect(files[0]!);
		}
	};

	const isImage = (url: string) => {
		return (
			url &&
			(url.includes('.jpg') ||
				url.includes('.jpeg') ||
				url.includes('.png') ||
				url.includes('.webp') ||
				url.includes('.gif'))
		);
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Превью текущего файла */}
			{currentFileUrl && preview && (
				<div className='relative cyber-card p-4'>
					{isImage(currentFileUrl) ?
						<img
							src={currentFileUrl}
							alt='Предпросмотр'
							className='w-full h-48 object-cover rounded bevel'
						/>
					:	<div className='w-full h-48 bg-gradient-to-br from-bg-subtle to-bg flex items-center justify-center rounded bevel'>
							<div className='text-center'>
								<NeonIcon
									Icon={FaFile}
									size={48}
									variant='intense'
									className='mb-2'
								/>
								<p
									className='text-sm font-mono'
									style={{ color: '#B8C5C0' }}
								>
									Загруженный файл
								</p>
							</div>
						</div>
					}
					{onFileDeleted && (
						<button
							onClick={onFileDeleted}
							className='absolute top-2 right-2 p-2 bg-red-500/20 border border-red-500 text-red-500 rounded hover:bg-red-500/30 transition-colors'
						>
							<FaTrash size={14} />
						</button>
					)}
				</div>
			)}

			{/* Ошибки */}
			{error && (
				<div className='cyber-card p-3 bg-red-500/10 border-red-500/50'>
					<p className='text-red-400 text-sm font-mono'>{error}</p>
				</div>
			)}

			{/* Зона загрузки */}
			<div
				className={`cyber-card border-2 border-dashed rounded p-8 text-center transition-all cursor-pointer ${
					dragOver ?
						'border-neon bg-neon/5 glow'
					:	'border-line hover:border-neon/50'
				}`}
				onClick={() => !uploading && fileInputRef.current?.click()}
				onDrop={handleDrop}
				onDragOver={(e) => {
					e.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
			>
				{uploading ?
					<ProgressLoader
						progress={uploadProgress}
						label='Загрузка файла'
						subLabel='Обработка и сохранение...'
						size='medium'
						variant='inline'
						showPercentage
					/>
				:	<div className='space-y-4'>
						<NeonIcon
							Icon={FaUpload}
							size={48}
							variant='intense'
						/>
						<div>
							<p
								className='text-lg font-mono font-bold glyph-glow'
								style={{ color: '#00FF99' }}
							>
								ПЕРЕТАЩИТЕ ФАЙЛ СЮДА
							</p>
							<p
								className='text-sm font-mono mt-2'
								style={{ color: '#B8C5C0' }}
							>
								или нажмите для выбора
							</p>
						</div>
						<div
							className='text-xs font-mono space-y-1'
							style={{ color: '#B8C5C0' }}
						>
							<p>
								Макс. размер:{' '}
								{Math.round(maxSize / 1024 / 1024)}MB
							</p>
							<p>Форматы: {acceptedTypes}</p>
						</div>
					</div>
				}
			</div>

			<input
				ref={fileInputRef}
				type='file'
				accept={acceptedTypes}
				onChange={(e) => {
					if (e.target.files?.[0]) {
						handleFileSelect(e.target.files[0]);
					}
				}}
				className='hidden'
			/>
		</div>
	);
};
