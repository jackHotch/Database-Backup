import { fileURLToPath } from 'node:url'
import { uploadFile } from './lib/s3.js'

/**
 * AWS Lambda entry point.
 * Configure the function's handler as "index.handler".
 *
 * @param {object} event - Payload from the invoking source (EventBridge schedule, manual invoke, etc.)
 * @param {import('aws-lambda').Context} context - Runtime info (requestId, remaining time, etc.)
 */
export const handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event))

  try {
    // TODO: database backup logic goes here
    // Resolved relative to this file, so it works locally and in Lambda (test.txt must be in the zip)
    const filePath = fileURLToPath(new URL('./test.txt', import.meta.url))
    const key = `backups/${new Date().toISOString()}.txt`

    const result = await uploadFile(filePath, {
      bucket: process.env.BACKUP_BUCKET,
      key,
      contentType: 'text/plain; charset=utf-8',
    })

    console.log('Uploaded to', result)

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Backup completed', requestId: context?.awsRequestId }),
    }
  } catch (err) {
    console.error('Backup failed:', err)
    // Rethrow so Lambda marks the invocation as failed (triggers retries / alarms)
    throw err
  }
}
