const AWS = require('aws-sdk');
const uuid = require('uuid');

const s3 = new AWS.S3()

const { BUCKET_NAME } = process.env

const createPreSignedMusicUploadUrl = () => {
  return s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: `uploads/${uuid.v4()}.mp3`,
    ContentType: 'audio/mpeg'
  });
}

const getSignedUrlsForBucket = async(prefix) => {
  const { BUCKET_NAME } = process.env

  const objectsInBucket = await s3.listObjects({
    Bucket: BUCKET_NAME,
    Prefix: prefix
  }).promise()

  const preSignedUrls = []
  for (processedFile of objectsInBucket.Contents) {
    const presignedUrl = s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: processedFile.Key
    })
    preSignedUrls.push(presignedUrl)
  }

  return preSignedUrls
}

module.exports = { getSignedUrlsForBucket, createPreSignedMusicUploadUrl}
