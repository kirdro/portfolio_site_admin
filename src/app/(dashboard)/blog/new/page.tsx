'use client';

import React, { useState } from 'react';
import { api } from '../../../../utils/api';
import { useRouter } from 'next/navigation';
import { BlogEditor } from '../../../../components/admin/blog/BlogEditor';
import { FileUpload } from '../../../../components/ui/FileUpload';
import type { PartialBlock } from '@blocknote/core';

export default function NewBlogPostPage() {
	const router = useRouter();
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [coverImage, setCoverImage] = useState('');
	const [content, setContent] = useState<PartialBlock[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [published, setPublished] = useState(false);

	const { data: tags } = api.blog.getAllTags.useQuery();

	const createPostMutation = api.blog.create.useMutation({
		onSuccess: (post) => {
			router.push(`/blog/${post.id}`);
		},
	});

	const generateSlugFromTitle = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[а-я]/g, (char) => {
				const translitMap: Record<string, string> = {
					а: 'a',
					б: 'b',
					в: 'v',
					г: 'g',
					д: 'd',
					е: 'e',
					ё: 'yo',
					ж: 'zh',
					з: 'z',
					и: 'i',
					й: 'y',
					к: 'k',
					л: 'l',
					м: 'm',
					н: 'n',
					о: 'o',
					п: 'p',
					р: 'r',
					с: 's',
					т: 't',
					у: 'u',
					ф: 'f',
					х: 'h',
					ц: 'ts',
					ч: 'ch',
					ш: 'sh',
					щ: 'sch',
					ъ: '',
					ы: 'y',
					ь: '',
					э: 'e',
					ю: 'yu',
					я: 'ya',
				};
				return translitMap[char] || char;
			})
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	};

	const handleTitleChange = (newTitle: string) => {
		setTitle(newTitle);
		if (!slug || slug === generateSlugFromTitle(title)) {
			setSlug(generateSlugFromTitle(newTitle));
		}
	};

	const handleSubmit = (e: React.FormEvent, shouldPublish?: boolean) => {
		e.preventDefault();

		if (!title.trim() || !slug.trim()) {
			alert('Заголовок и слаг обязательны');
			return;
		}

		const finalPublished =
			shouldPublish !== undefined ? shouldPublish : published;

		createPostMutation.mutate({
			title: title.trim(),
			slug: slug.trim(),
			content,
			excerpt: excerpt.trim() || undefined,
			coverImage: coverImage.trim() || undefined,
			tags: selectedTags,
			published: finalPublished,
		});
	};

	const handleTagToggle = (tagSlug: string) => {
		setSelectedTags((prev) =>
			prev.includes(tagSlug) ?
				prev.filter((slug) => slug !== tagSlug)
			:	[...prev, tagSlug],
		);
	};

	return (
		<div className=''>
			<div className=''>
				{/* Заголовок */}
				<div className='mb-8'>
					<h1 className='text-4xl font-bold mb-4 bg-gradient-to-r from-neon to-cyan bg-clip-text text-transparent'>
						Новый пост
					</h1>
					<p className='text-soft'>Создайте новую статью для блога</p>
				</div>

				<form
					onSubmit={(e) => handleSubmit(e)}
					className='space-y-8'
				>
					{/* Основные поля */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						<div className='lg:col-span-2 space-y-6'>
							{/* Заголовок */}
							<div>
								<label className='block text-sm font-medium mb-2'>
									Заголовок{' '}
									<span className='text-red-400'>*</span>
								</label>
								<input
									type='text'
									value={title}
									onChange={(e) =>
										handleTitleChange(e.target.value)
									}
									placeholder='Введите заголовок статьи'
									className='w-full px-4 py-3 bg-panel border border-line rounded-lg focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all text-lg'
									required
								/>
							</div>

							{/* Слаг */}
							<div>
								<label className='block text-sm font-medium mb-2'>
									URL слаг{' '}
									<span className='text-red-400'>*</span>
								</label>
								<input
									type='text'
									value={slug}
									onChange={(e) => setSlug(e.target.value)}
									placeholder='url-slug-for-post'
									className='w-full px-4 py-3 bg-panel border border-line rounded-lg focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all font-mono'
									required
								/>
								<p className='text-xs text-soft mt-1'>
									URL для статьи: /blog/{slug || 'url-slug'}
								</p>
							</div>

							{/* Краткое описание */}
							<div>
								<label className='block text-sm font-medium mb-2'>
									Краткое описание
								</label>
								<textarea
									value={excerpt}
									onChange={(e) => setExcerpt(e.target.value)}
									placeholder='Краткое описание статьи для превью'
									rows={3}
									className='w-full px-4 py-3 bg-panel border border-line rounded-lg focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all resize-none'
								/>
							</div>

							{/* Обложка */}
							<div>
								<label className='block text-sm font-medium mb-2'>
									Обложка статьи
								</label>
								<FileUpload
									currentFileUrl={coverImage}
									onFileUploaded={setCoverImage}
									onFileDeleted={() => setCoverImage('')}
									category='blog'
									acceptedTypes='image/*'
									maxSize={10 * 1024 * 1024}
									preview={true}
								/>
							</div>
						</div>

						{/* Боковая панель */}
						<div className='space-y-6'>
							{/* Статус публикации */}
							<div className='bg-panel border border-line rounded-lg p-4 bevel'>
								<h3 className='font-semibold mb-4 text-neon'>
									Публикация
								</h3>
								<div className='space-y-4'>
									<label className='flex items-center gap-2'>
										<input
											type='checkbox'
											checked={published}
											onChange={(e) =>
												setPublished(e.target.checked)
											}
											className='rounded border-line bg-panel text-neon focus:ring-neon/50'
										/>
										<span>Опубликовать сразу</span>
									</label>
								</div>
							</div>

							{/* Теги */}
							<div className='bg-panel border border-line rounded-lg p-4 bevel'>
								<h3 className='font-semibold mb-4 text-cyan'>
									Теги
								</h3>
								<div className='space-y-2 max-h-64 overflow-y-auto'>
									{tags?.map((tag) => (
										<label
											key={tag.id}
											className='flex items-center gap-2 cursor-pointer'
										>
											<input
												type='checkbox'
												checked={selectedTags.includes(
													tag.slug,
												)}
												onChange={() =>
													handleTagToggle(tag.slug)
												}
												className='rounded border-line bg-panel text-neon focus:ring-neon/50'
											/>
											<span
												className='text-sm'
												style={{ color: tag.color }}
											>
												{tag.name}
											</span>
										</label>
									))}
								</div>
								{tags?.length === 0 && (
									<p className='text-soft text-sm'>
										Теги не созданы. Создайте теги в
										настройках блога.
									</p>
								)}
							</div>

							{/* Действия */}
							<div className='bg-panel border border-line rounded-lg p-4 bevel space-y-3'>
								<button
									type='submit'
									disabled={createPostMutation.isPending}
									className='w-full px-4 py-3 bg-neon text-bg rounded-lg font-semibold hover:bg-neon/90 transition-all bevel disabled:opacity-50'
								>
									{createPostMutation.isPending ?
										'Сохраняю...'
									: published ?
										'Опубликовать'
									:	'Сохранить черновик'}
								</button>

								{!published && (
									<button
										type='button'
										onClick={(e) => handleSubmit(e, true)}
										disabled={createPostMutation.isPending}
										className='w-full px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-500/90 transition-all bevel disabled:opacity-50'
									>
										Опубликовать сейчас
									</button>
								)}

								<button
									type='button'
									onClick={() => router.push('/blog')}
									className='w-full px-4 py-3 bg-panel border border-line rounded-lg font-medium hover:border-neon transition-all'
								>
									Отменить
								</button>
							</div>
						</div>
					</div>

					{/* Редактор контента */}
					<div>
						<label className='block text-sm font-medium mb-4'>
							Содержание статьи
						</label>
						<BlogEditor
							initialContent={content}
							onContentChange={setContent}
							placeholder='Начните писать статью...'
							editable={true}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}
