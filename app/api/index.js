const serverless = require("serverless-http");
const express = require("express");
const app = express();

const { getSignedUrlsForBucket, createPreSignedMusicUploadUrl } = require('../helpers/s3')

app.get("/upload", async (req, res, next) => {
  const signedUrl = createPreSignedMusicUploadUrl()
  return res.status(200).json({
    url: signedUrl,
  });
});

app.get("/uploads/list", async (req, res, next) => {
  const signedUrls = await getSignedUrlsForBucket('uploads/')
  return res.status(200).json(signedUrls);
});

app.get("/processed/list", async (req, res, next) => {
  const signedUrls = await getSignedUrlsForBucket('processed/')
  return res.status(200).json(signedUrls);
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
