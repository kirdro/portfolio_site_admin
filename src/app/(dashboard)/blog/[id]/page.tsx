'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlogEditor } from '../../../../components/admin/blog/BlogEditor';
import type { PartialBlock } from '@blocknote/core';

interface BlogPostPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
	const router = useRouter();
	const [paramId, setParamId] = useState<string | null>(null);

	// Resolve params Promise в useEffect
	useEffect(() => {
		params.then((resolvedParams) => {
			setParamId(resolvedParams.id);
		});
	}, [params]);

	const {
		data: post,
		isLoading,
		refetch,
	} = api.blog.getById.useQuery({ id: paramId! }, { enabled: !!paramId });

	const deletePostMutation = api.blog.delete.useMutation({
		onSuccess: () => {
			router.push('/blog');
		},
	});

	const togglePublishedMutation = api.blog.togglePublished.useMutation({
		onSuccess: () => {
			void refetch();
		},
	});

	const handleDeletePost = () => {
		if (confirm('Вы уверены, что хотите удалить этот пост?')) {
			deletePostMutation.mutate({ id: paramId! });
		}
	};

	const handleTogglePublished = () => {
		togglePublishedMutation.mutate({ id: paramId! });
	};

	if (isLoading) {
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
				<div className='mb-6'>
					<Link
						href='/blog'
						className='inline-flex items-center gap-2 text-soft hover:text-neon transition-colors'
					>
						← Вернуться к блогу
					</Link>
				</div>

				{/* Заголовок и управление */}
				<div className='flex items-start justify-between mb-8'>
					<div className='flex-1'>
						<div className='flex items-center gap-3 mb-2'>
							<h1 className='text-4xl font-bold bg-gradient-to-r from-neon to-cyan bg-clip-text text-transparent'>
								{post.title}
							</h1>
							{post.published ?
								<span className='px-3 py-1 bg-green-400/20 text-green-400 rounded text-sm'>
									Опубликован
								</span>
							:	<span className='px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded text-sm'>
									Черновик
								</span>
							}
						</div>

						<div className='flex items-center gap-4 text-sm text-soft mb-4'>
							<span>
								Автор: {post.author.name || post.author.email}
							</span>
							<span>•</span>
							<span>
								Создан:{' '}
								{new Date(post.createdAt).toLocaleDateString(
									'ru-RU',
									{
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									},
								)}
							</span>
							{post.publishedAt && (
								<>
									<span>•</span>
									<span>
										Опубликован:{' '}
										{new Date(
											post.publishedAt,
										).toLocaleDateString('ru-RU', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</>
							)}
						</div>

						{post.excerpt && (
							<p className='text-lg text-soft mb-4'>
								{post.excerpt}
							</p>
						)}

						{post.tags.length > 0 && (
							<div className='flex flex-wrap gap-2 mb-6'>
								{post.tags.map((tag) => (
									<span
										key={tag.id}
										className='px-3 py-1 rounded-full text-sm border'
										style={{
											color: tag.color,
											borderColor: tag.color + '40',
											backgroundColor: tag.color + '10',
										}}
									>
										{tag.name}
									</span>
								))}
							</div>
						)}
					</div>

					<div className='flex items-center gap-2 ml-6'>
						<button
							onClick={handleTogglePublished}
							disabled={togglePublishedMutation.isPending}
							className={`px-4 py-2 rounded-lg font-medium transition-all ${
								post.published ?
									'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
								:	'bg-green-400/20 text-green-400 hover:bg-green-400/30'
							}`}
						>
							{post.published ?
								'Снять с публикации'
							:	'Опубликовать'}
						</button>

						<Link
							href={`/blog/${post.id}/edit`}
							className='px-4 py-2 bg-cyan/20 text-cyan rounded-lg font-medium hover:bg-cyan/30 transition-all'
						>
							Редактировать
						</Link>

						<button
							onClick={handleDeletePost}
							disabled={deletePostMutation.isPending}
							className='px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-all'
						>
							Удалить
						</button>
					</div>
				</div>

				{/* Обложка */}
				{post.coverImage && (
					<div className='mb-8'>
						<img
							src={post.coverImage}
							alt={post.title}
							className='w-full max-h-96 object-cover rounded-lg border border-line bevel'
						/>
					</div>
				)}

				{/* Содержание */}
				<div className='bg-panel border border-line rounded-lg bevel overflow-hidden'>
					<div className='border-b border-line bg-subtle p-4'>
						<div className='flex items-center gap-2'>
							<span className='text-neon text-lg'>📄</span>
							<span className='font-medium'>
								Содержание статьи
							</span>
						</div>
					</div>

					<div className='p-0'>
						<BlogEditor
							initialContent={post.content as PartialBlock[]}
							onContentChange={() => {}} // Read-only для просмотра
							editable={false}
						/>
					</div>
				</div>

				{/* Метаданные */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
					<div className='bg-panel border border-line rounded-lg p-4 bevel'>
						<h3 className='font-semibold mb-3 text-neon'>
							Метаданные
						</h3>
						<div className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-soft'>ID:</span>
								<span className='font-mono'>{post.id}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-soft'>Слаг:</span>
								<span className='font-mono'>{post.slug}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-soft'>Статус:</span>
								<span
									className={
										post.published ? 'text-green-400' : (
											'text-yellow-400'
										)
									}
								>
									{post.published ?
										'Опубликован'
									:	'Черновик'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-soft'>Обновлен:</span>
								<span>
									{new Date(
										post.updatedAt,
									).toLocaleDateString('ru-RU', {
										year: 'numeric',
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</span>
							</div>
						</div>
					</div>

					<div className='bg-panel border border-line rounded-lg p-4 bevel'>
						<h3 className='font-semibold mb-3 text-cyan'>
							Быстрые действия
						</h3>
						<div className='space-y-2'>
							<Link
								href={`/blog/${post.id}/edit`}
								className='block w-full px-4 py-2 bg-cyan/20 text-cyan rounded-lg font-medium hover:bg-cyan/30 transition-all text-center'
							>
								Редактировать пост
							</Link>

							<button
								onClick={() => {
									navigator.clipboard.writeText(
										`${window.location.origin}/blog/${post.slug}`,
									);
									alert('Ссылка скопирована в буфер обмена!');
								}}
								className='block w-full px-4 py-2 bg-panel border border-line rounded-lg font-medium hover:border-neon transition-all'
							>
								Копировать ссылку
							</button>

							<button
								onClick={() => {
									navigator.clipboard.writeText(post.id);
									alert('ID поста скопирован!');
								}}
								className='block w-full px-4 py-2 bg-panel border border-line rounded-lg font-medium hover:border-neon transition-all'
							>
								Копировать ID
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
