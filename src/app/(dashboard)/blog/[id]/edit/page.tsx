'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../../utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlogEditor } from '../../../../../components/admin/blog/BlogEditor';
import { FileUpload } from '../../../../../components/ui/FileUpload';
import type { PartialBlock } from '@blocknote/core';

interface EditBlogPostPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
	const router = useRouter();
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [coverImage, setCoverImage] = useState('');
	const [content, setContent] = useState<PartialBlock[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [published, setPublished] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [paramId, setParamId] = useState<string | null>(null);

	// Resolve params Promise в useEffect
	useEffect(() => {
		params.then((resolvedParams) => {
			setParamId(resolvedParams.id);
		});
	}, [params]);

	const { data: post, isLoading: postLoading } = api.blog.getById.useQuery(
		{ id: paramId! },
		{ enabled: !!paramId },
	);
	const { data: tags } = api.blog.getAllTags.useQuery();

	const updatePostMutation = api.blog.update.useMutation({
		onSuccess: (updatedPost) => {
			router.push(`/blog/${updatedPost.id}`);
		},
	});

	// Загружаем данные поста в форму
	useEffect(() => {
		if (post && !isLoaded) {
			setTitle(post.title);
			setSlug(post.slug);
			setExcerpt(post.excerpt || '');
			setCoverImage(post.coverImage || '');
			setContent(post.content as PartialBlock[]);
			setSelectedTags(post.tags.map((tag) => tag.slug));
			setPublished(post.published);
			setIsLoaded(true);
		}
	}, [post, isLoaded]);

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
		// Автоматически обновляем слаг только если пользователь не менял его вручную
		if (
			post &&
			(slug === post.slug || slug === generateSlugFromTitle(title))
		) {
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

		updatePostMutation.mutate({
			id: paramId!,
			data: {
				title: title.trim(),
				slug: slug.trim(),
				content,
				excerpt: excerpt.trim() || undefined,
				coverImage: coverImage.trim() || undefined,
				tags: selectedTags,
				published: finalPublished,
			},
		});
	};

	const handleTagToggle = (tagSlug: string) => {
		setSelectedTags((prev) =>
			prev.includes(tagSlug) ?
				prev.filter((slug) => slug !== tagSlug)
			:	[...prev, tagSlug],
		);
	};

	if (postLoading) {
		return (
			<div className=' flex items-center justify-center'>
				<div className='text-neon text-lg'>⏳ Загрузка поста...</div>
			</div>
		);
	}

	if (!post) {
		return (
			<div className=' flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-6xl mb-4'>😞</div>
					<h2 className='text-2xl font-bold mb-2'>Пост не найден</h2>
					<p className='text-soft mb-4'>
						Возможно, пост был удален или перемещен
					</p>
					<Link
						href='/blog'
						className='inline-flex items-center gap-2 px-6 py-3 bg-neon text-bg rounded-lg font-semibold hover:bg-neon/90 transition-all bevel'
					>
						← Вернуться к блогу
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className=''>
			<div className=''>
				{/* Навигация */}
				<div className='mb-6 flex items-center gap-4'>
					<Link
						href='/blog'
						className='inline-flex items-center gap-2 text-soft hover:text-neon transition-colors'
					>
						← К блогу
					</Link>
					<span className='text-soft'>•</span>
					<Link
						href={`/blog/${post.id}`}
						className='inline-flex items-center gap-2 text-soft hover:text-cyan transition-colors'
					>
						Просмотр поста
					</Link>
				</div>

				{/* Заголовок */}
				<div className='mb-8'>
					<h1 className='text-4xl font-bold mb-4 bg-gradient-to-r from-neon to-cyan bg-clip-text text-transparent'>
						Редактирование поста
					</h1>
					<p className='text-soft'>Изменение статьи: {post.title}</p>
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
								{slug !== post.slug && (
									<p className='text-xs text-yellow-400 mt-1'>
										⚠️ Изменение слага может нарушить
										существующие ссылки
									</p>
								)}
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
							{/* Информация о посте */}
							<div className='bg-panel border border-line rounded-lg p-4 bevel'>
								<h3 className='font-semibold mb-3 text-soft'>
									Информация
								</h3>
								<div className='space-y-2 text-sm'>
									<div>
										<span className='text-soft'>
											Создан:
										</span>
										<div className='text-xs mt-1'>
											{new Date(
												post.createdAt,
											).toLocaleDateString('ru-RU', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</div>
									</div>
									<div>
										<span className='text-soft'>
											Автор:
										</span>
										<div className='text-xs mt-1'>
											{post.author.name ||
												post.author.email}
										</div>
									</div>
									{post.publishedAt && (
										<div>
											<span className='text-soft'>
												Опубликован:
											</span>
											<div className='text-xs mt-1'>
												{new Date(
													post.publishedAt,
												).toLocaleDateString('ru-RU', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</div>
										</div>
									)}
								</div>
							</div>

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
										<span>Опубликован</span>
									</label>

									{post.published !== published && (
										<div className='text-xs text-yellow-400'>
											{published ?
												'📢 Пост будет опубликован'
											:	'📝 Пост станет черновиком'}
										</div>
									)}
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
									disabled={updatePostMutation.isPending}
									className='w-full px-4 py-3 bg-neon text-bg rounded-lg font-semibold hover:bg-neon/90 transition-all bevel disabled:opacity-50'
								>
									{updatePostMutation.isPending ?
										'Сохраняю...'
									:	'Сохранить изменения'}
								</button>

								{!published && (
									<button
										type='button'
										onClick={(e) => handleSubmit(e, true)}
										disabled={updatePostMutation.isPending}
										className='w-full px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-500/90 transition-all bevel disabled:opacity-50'
									>
										Сохранить и опубликовать
									</button>
								)}

								<Link
									href={`/blog/${post.id}`}
									className='block w-full px-4 py-3 bg-panel border border-line rounded-lg font-medium hover:border-cyan text-center transition-all'
								>
									Отменить
								</Link>
							</div>
						</div>
					</div>

					{/* Редактор контента */}
					<div>
						<label className='block text-sm font-medium mb-4'>
							Содержание статьи
						</label>
						{isLoaded && (
							<BlogEditor
								initialContent={content}
								onContentChange={setContent}
								placeholder='Начните писать статью...'
								editable={true}
							/>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
