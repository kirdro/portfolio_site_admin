import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';

interface FileUploadDeferredProps {
	onFileSelected: (file: File | null, previewUrl: string | null) => void;
	currentFileUrl?: string;
	category: 'project' | 'skill' | 'blog' | 'chat' | 'main_photo';
	acceptedTypes?: string;
	maxSize?: number;
	preview?: boolean;
	className?: string;
}

/**
 * Компонент загрузки файлов с отложенной загрузкой в S3
 * Показывает предпросмотр локально, загружает файл только при сохранении формы
 */
export const FileUploadDeferred: React.FC<FileUploadDeferredProps> = ({
	onFileSelected,
	currentFileUrl,
	category,
	acceptedTypes = 'image/*',
	maxSize = 10 * 1024 * 1024,
	preview = true,
	className = '',
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const handleFileSelect = (file: File) => {
		if (file.size > maxSize) {
			alert(`Файл слишком большой. Максимум: ${maxSize / 1024 / 1024}MB`);
			return;
		}

		// Создаем локальный URL для предпросмотра
		const objectUrl = URL.createObjectURL(file);
		setSelectedFile(file);
		setPreviewUrl(objectUrl);
		onFileSelected(file, objectUrl);
	};

	const handleFileDelete = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		setSelectedFile(null);
		setPreviewUrl(null);
		onFileSelected(null, null);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileSelect(files[0]!);
		}
	};

	const displayUrl = previewUrl || currentFileUrl;

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Превью файла */}
			{displayUrl && preview && (
				<div className='relative'>
					<img
						src={displayUrl}
						alt='Предпросмотр'
						className='w-full h-48 object-cover rounded-lg border border-line'
					/>
					<button
						type='button'
						onClick={handleFileDelete}
						className='absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors'
					>
						<FaTrash size={14} />
					</button>
					{selectedFile && (
						<div className='absolute bottom-2 left-2 bg-bg/80 text-xs px-2 py-1 rounded text-neon'>
							📁 {selectedFile.name} (
							{(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
						</div>
					)}
				</div>
			)}

			{/* Зона загрузки */}
			<div
				className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
					dragOver ?
						'border-neon bg-neon/5'
					:	'border-line hover:border-neon/50'
				}`}
				onDrop={handleDrop}
				onDragOver={(e) => {
					e.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
			>
				<div className='space-y-4'>
					<FaImage className='mx-auto text-4xl text-soft' />
					<div>
						<p className='text-base font-medium'>
							{selectedFile ?
								`Файл выбран: ${selectedFile.name}`
							:	'Перетащите файл сюда'}
						</p>
						<p className='text-soft text-sm mt-1'>или</p>
					</div>
					<button
						type='button'
						onClick={() => fileInputRef.current?.click()}
						className='px-4 py-2 bg-neon/20 border border-neon text-neon rounded hover:bg-neon/30 transition-colors'
					>
						{selectedFile ? 'Выбрать другой файл' : 'Выберите файл'}
					</button>
					<p className='text-xs text-soft'>
						Макс. размер: {maxSize / 1024 / 1024}MB
					</p>
					{selectedFile && (
						<p className='text-xs text-yellow-400'>
							⚠️ Файл будет загружен при сохранении формы
						</p>
					)}
				</div>
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
