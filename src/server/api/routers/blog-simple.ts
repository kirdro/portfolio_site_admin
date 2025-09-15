import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const blogRouter = createTRPCRouter({
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return {
				id: input.id,
				title: 'Test Post',
				slug: 'test-post',
				content: [],
				excerpt: null,
				coverImage: null,
				published: false,
				publishedAt: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				authorId: 'test-author',
				author: {
					id: 'test-author',
					name: 'Test Author',
					email: 'test@example.com',
					image: null,
				},
				tags: [
					{
						id: 'test-tag',
						name: 'Test Tag',
						slug: 'test-tag',
						color: '#00FF99',
					},
				],
			};
		}),

	getAllTags: protectedProcedure.query(async ({ ctx }) => {
		return [
			{
				id: 'test-tag',
				name: 'Test Tag',
				slug: 'test-tag',
				color: '#00FF99',
			},
		];
	}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: z.object({
					title: z.string().optional(),
					slug: z.string().optional(),
					content: z.any().optional(),
					excerpt: z.string().optional(),
					coverImage: z.string().optional(),
					published: z.boolean().optional(),
					tags: z.array(z.string()).optional(),
				}),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return {
				id: input.id,
				title: 'Updated Post',
				slug: 'updated-post',
				content: [],
				excerpt: null,
				coverImage: null,
				published: false,
				publishedAt: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				authorId: 'test-author',
				author: {
					id: 'test-author',
					name: 'Test Author',
					email: 'test@example.com',
					image: null,
				},
				tags: [
					{
						id: 'test-tag',
						name: 'Test Tag',
						slug: 'test-tag',
						color: '#00FF99',
					},
				],
			};
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return { success: true };
		}),

	togglePublished: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return { id: input.id, published: true };
		}),

	getAll: protectedProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(50).default(10),
				published: z.boolean().optional(),
				tag: z.string().optional(),
				search: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return {
				posts: [
					{
						id: 'test-post',
						title: 'Test Post',
						slug: 'test-post',
						content: [],
						excerpt: null,
						coverImage: null,
						published: false,
						publishedAt: null,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						authorId: 'test-author',
						author: {
							id: 'test-author',
							name: 'Test Author',
							email: 'test@example.com',
							image: null,
						},
						tags: [
							{
								id: 'test-tag',
								name: 'Test Tag',
								slug: 'test-tag',
								color: '#00FF99',
							},
						],
					},
				],
				totalCount: 1,
				totalPages: 1,
				currentPage: input.page,
			};
		}),

	create: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				slug: z.string(),
				content: z.any(),
				excerpt: z.string().optional(),
				coverImage: z.string().optional(),
				published: z.boolean().default(false),
				tags: z.array(z.string()).default([]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return { id: 'new-post', title: input.title };
		}),

	getStats: protectedProcedure.query(async ({ ctx }) => {
		return {
			totalPosts: 0,
			publishedPosts: 0,
			draftPosts: 0,
			totalTags: 0,
			recentPosts: [],
		};
	}),
});
