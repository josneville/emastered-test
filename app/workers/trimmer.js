const stream = require('stream')
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('/var/task/ffmpeg');

const s3 = new AWS.S3()

module.exports.handler = async event => {
  const bucket = event.Records[0].s3.bucket.name;
  const originalKey = decodeURIComponent(event.Records[0].s3.object.key).replace(/\+/g, " ");

  const params = {
    Bucket: bucket,
    Key: originalKey,
  };

  console.log(params)

  const ogStream = s3.getObject(params).createReadStream()
  const passthroughStream = new stream.PassThrough()

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(ogStream)
        .duration(5)
        .format('mp3')
        .output(passthroughStream, {
          end: true
        })
        .on('start', () => {
          console.log("Started")
        })
        .on('progress', (progress) => {
          console.log(progress);
        })
        .on('end', async () => {
          resolve()
        })
        .on('error', (error) => {
          reject(error)
        })
        .run()
    })
    const trimmedKey = originalKey.replace('uploads/', 'processed/')
    await s3.upload({
      Bucket: bucket,
      Key: trimmedKey,
      Body: passthroughStream
    }).promise()
    await s3.deleteObject({
      Bucket: bucket,
      Key: originalKey
    }).promise()
  } catch (error) {
    console.log("FAILED")
    console.log(error)
  }
}
