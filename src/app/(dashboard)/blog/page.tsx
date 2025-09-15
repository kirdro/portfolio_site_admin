'use client';

import React, { useState } from 'react';
import { api } from '../../../utils/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NeonIcon } from '../../../components/ui/NeonIcon';
import { Spinner, SkeletonLoader } from '../../../components/ui/loaders';
import { FaPen, FaStar } from 'react-icons/fa';

export default function BlogPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [selectedTag, setSelectedTag] = useState<string | undefined>();
	const [publishedFilter, setPublishedFilter] = useState<
		boolean | undefined
	>();

	const {
		data: postsData,
		isLoading: postsLoading,
		refetch: refetchPosts,
	} = api.blog.getAll.useQuery({
		page,
		limit: 10,
		search: search || undefined,
		tag: selectedTag,
		published: publishedFilter,
	});

	const { data: tags, isLoading: tagsLoading } =
		api.blog.getAllTags.useQuery();
	const { data: stats, isLoading: statsLoading } =
		api.blog.getStats.useQuery();

	const deletePostMutation = api.blog.delete.useMutation({
		onSuccess: () => {
			void refetchPosts();
		},
	});

	const togglePublishedMutation = api.blog.togglePublished.useMutation({
		onSuccess: () => {
			void refetchPosts();
		},
	});

	const handleDeletePost = (id: string) => {
		if (confirm('Вы уверены, что хотите удалить этот пост?')) {
			deletePostMutation.mutate({ id });
		}
	};

	const handleTogglePublished = (id: string) => {
		togglePublishedMutation.mutate({ id });
	};

	return (
		<div>
			{/* Заголовок с кнопкой создания */}
			<div className='mb-8 flex items-start justify-between'>
				<div>
					<h1 className='text-4xl font-bold mb-4 bg-gradient-to-r from-neon to-cyan bg-clip-text text-transparent'>
						Управление блогом
					</h1>
					<p className='text-soft'>
						Создавайте и управляйте статьями для портфолио
					</p>
				</div>
				<Link
					href='/blog/new'
					className='px-6 py-3 bg-neon text-white rounded-lg font-semibold hover:bg-neon/90 transition-all bevel flex items-center gap-2 shadow-neon'
				>
					<NeonIcon
						Icon={FaStar}
						size={20}
						variant='default'
					/>
					<span>Создать пост</span>
				</Link>
			</div>

			{/* Статистика */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
				{statsLoading ?
					// Скелетоны для статистики
					Array.from({ length: 4 }, (_, index) => (
						<div
							key={index}
							className='bg-panel border border-line rounded-lg p-4 bevel'
						>
							<SkeletonLoader
								variant='text'
								width='80px'
								height='2rem'
							/>
							<SkeletonLoader
								variant='text'
								width='100px'
								height='0.875rem'
							/>
						</div>
					))
				: stats ?
					<>
						<div className='bg-panel border border-line rounded-lg p-4 bevel'>
							<div className='text-2xl font-bold text-neon'>
								{stats.totalPosts}
							</div>
							<div className='text-sm text-soft'>
								Всего постов
							</div>
						</div>
						<div className='bg-panel border border-line rounded-lg p-4 bevel'>
							<div className='text-2xl font-bold text-green-400'>
								{stats.publishedPosts}
							</div>
							<div className='text-sm text-soft'>
								Опубликовано
							</div>
						</div>
						<div className='bg-panel border border-line rounded-lg p-4 bevel'>
							<div className='text-2xl font-bold text-yellow-400'>
								{stats.draftPosts}
							</div>
							<div className='text-sm text-soft'>Черновики</div>
						</div>
						<div className='bg-panel border border-line rounded-lg p-4 bevel'>
							<div className='text-2xl font-bold text-cyan'>
								{stats.totalTags}
							</div>
							<div className='text-sm text-soft'>Тегов</div>
						</div>
					</>
				:	null}
			</div>

			{/* Управление */}
			<div className='flex flex-col md:flex-row gap-4 mb-8'>
				<div className='flex-1'>
					<input
						type='text'
						placeholder='Поиск по заголовку или описанию...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='w-full px-4 py-2 bg-panel border border-line rounded-lg focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all'
					/>
				</div>

				<select
					value={selectedTag || ''}
					onChange={(e) =>
						setSelectedTag(e.target.value || undefined)
					}
					className='px-4 py-2 bg-panel border border-line rounded-lg focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all'
				>
					<option value=''>Все теги</option>
					{tags?.map((tag) => (
						<option
							key={tag.id}
							value={tag.slug}
						>
							{tag.name}
						</option>
					))}
				</select>

				<select
					value={
						publishedFilter === undefined ? '' : (
							publishedFilter.toString()
						)
					}
					onChange={(e) => {
						const value = e.target.value;
						setPublishedFilter(
							value === '' ? undefined : value === 'true',
						);
					}}
					className='px-4 py-2 bg-panel border border-line rounded-lg focus:border-neon focus:ring-1 focus:ring-neon/50 transition-all'
				>
					<option value=''>Все посты</option>
					<option value='true'>Опубликованные</option>
					<option value='false'>Черновики</option>
				</select>

				<Link
					href='/blog/new'
					className='px-6 py-2 bg-neon text-white rounded-lg font-semibold hover:bg-neon/90 transition-all bevel flex items-center gap-2'
				>
					<NeonIcon
						Icon={FaStar}
						size={20}
						variant='default'
					/>
					Новый пост
				</Link>
			</div>

			{/* Список постов */}
			{postsLoading ?
				<div className='flex items-center justify-center py-12'>
					<Spinner
						size='large'
						label='Загрузка постов блога...'
						variant='inline'
					/>
				</div>
			: postsData?.posts.length === 0 ?
				<div className='text-center py-12'>
					<NeonIcon
						Icon={FaPen}
						size={64}
						variant='intense'
						className='mb-4'
					/>
					<h3 className='text-xl font-semibold mb-2'>
						Пока нет постов
					</h3>
					<p className='text-soft mb-4'>
						Создайте первый пост для блога
					</p>
					<Link
						href='/blog/new'
						className='inline-flex items-center gap-2 px-6 py-3 bg-neon text-white rounded-lg font-semibold hover:bg-neon/90 transition-all bevel'
					>
						<NeonIcon
							Icon={FaStar}
							size={20}
							variant='default'
						/>
						Создать пост
					</Link>
				</div>
			:	<div className='space-y-4'>
					{postsData?.posts.map((post, index) => (
						<motion.div
							key={post.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className='bg-panel border border-line rounded-lg p-6 bevel hover:border-neon/50 transition-all'
						>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<div className='flex items-center gap-3 mb-3'>
										<h3 className='text-xl font-semibold hover:text-neon transition-colors'>
											<Link href={`/blog/${post.id}`}>
												{post.title}
											</Link>
										</h3>
										{post.published ?
											<span className='px-2 py-1 bg-green-400/20 text-green-400 rounded text-xs'>
												Опубликован
											</span>
										:	<span className='px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs'>
												Черновик
											</span>
										}
									</div>

									{post.excerpt && (
										<p className='text-soft mb-3 line-clamp-2'>
											{post.excerpt}
										</p>
									)}

									<div className='flex flex-wrap gap-2 mb-3'>
										{post.tags.map((tag) => (
											<span
												key={tag.id}
												className='px-2 py-1 rounded text-xs border'
												style={{
													color: tag.color,
													borderColor:
														tag.color + '40',
													backgroundColor:
														tag.color + '10',
												}}
											>
												{tag.name}
											</span>
										))}
									</div>

									<div className='flex items-center gap-4 text-sm text-soft'>
										<span>
											Автор:{' '}
											{post.author.name ||
												post.author.email}
										</span>
										<span>•</span>
										<span>
											Создан:{' '}
											{new Date(
												post.createdAt,
											).toLocaleDateString('ru-RU')}
										</span>
										{post.publishedAt && (
											<>
												<span>•</span>
												<span>
													Опубликован:{' '}
													{new Date(
														post.publishedAt,
													).toLocaleDateString(
														'ru-RU',
													)}
												</span>
											</>
										)}
									</div>
								</div>

								<div className='flex items-center gap-2 ml-4'>
									<button
										onClick={() =>
											handleTogglePublished(post.id)
										}
										disabled={
											togglePublishedMutation.isPending
										}
										className={`px-3 py-1 rounded text-xs font-medium transition-all ${
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
										className='px-3 py-1 bg-cyan/20 text-cyan rounded text-xs font-medium hover:bg-cyan/30 transition-all'
									>
										Редактировать
									</Link>

									<button
										onClick={() =>
											handleDeletePost(post.id)
										}
										disabled={deletePostMutation.isPending}
										className='px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium hover:bg-red-500/30 transition-all'
									>
										Удалить
									</button>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			}

			{/* Пагинация */}
			{postsData && postsData.totalPages > 1 && (
				<div className='flex justify-center items-center gap-2 mt-8'>
					<button
						onClick={() => setPage(page - 1)}
						disabled={page === 1}
						className='px-4 py-2 bg-panel border border-line rounded-lg disabled:opacity-50 hover:border-neon transition-all'
					>
						Назад
					</button>

					<span className='px-4 py-2 text-soft'>
						Страница {page} из {postsData.totalPages}
					</span>

					<button
						onClick={() => setPage(page + 1)}
						disabled={page === postsData.totalPages}
						className='px-4 py-2 bg-panel border border-line rounded-lg disabled:opacity-50 hover:border-neon transition-all'
					>
						Далее
					</button>
				</div>
			)}
		</div>
	);
}
