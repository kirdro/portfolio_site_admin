import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export const s3Client = new S3Client({
	endpoint: 'https://s3.twcstorage.ru',
	region: 'ru-1',
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY!,
		secretAccessKey: process.env.S3_SECRET_KEY!,
	},
});

export const BUCKET_NAME = '4509b86b-9c6fee05-61b9-415d-b140-df489303583d';

export async function uploadFileToS3(
	file: Buffer,
	fileName: string,
	mimeType: string,
): Promise<{ s3Key: string; s3Url: string }> {
	const s3Key = `portfolio-admin/${Date.now()}-${uuidv4()}-${fileName}`;

	await s3Client.send(
		new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: s3Key,
			Body: file,
			ContentType: mimeType,
		}),
	);

	return {
		s3Key,
		s3Url: `https://s3.twcstorage.ru/${BUCKET_NAME}/${s3Key}`,
	};
}

export async function deleteFileFromS3(s3Key: string): Promise<void> {
	await s3Client.send(
		new DeleteObjectCommand({
			Bucket: BUCKET_NAME,
			Key: s3Key,
		}),
	);
}
