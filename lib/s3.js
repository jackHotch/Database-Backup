import { createReadStream } from 'node:fs'
import { basename } from 'node:path'
import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { createLogger } from './log.js'

const log = createLogger('s3')

const s3 = new S3Client({ region: process.env.AWS_REGION })

export async function uploadFile(filePath, { bucket, key = basename(filePath), contentType } = {}) {
  if (!bucket) throw new Error('uploadFile: bucket is required')

  log.info('Upload started', { bucket, key })
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: contentType,
    },
  })

  upload.on('httpUploadProgress', ({ loaded, total }) => {
    log.info(`Uploading ${key}: ${loaded}/${total ?? '?'} bytes`)
  })

  const result = await upload.done()
  return { bucket, key, location: result.Location }
}
