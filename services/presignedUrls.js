const { S3 } = require("aws-sdk");

const s3 = new S3();

async function generatePresignedUrl(bucketName, objectKey) {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
    Expires: 3600,
  };

  try {
    const url = await s3.getSignedUrlPromise("getObject", params);
    return url;
  } catch (err) {
    console.error("Error generating presigned URL", err);
    throw err;
  }
}

module.exports = generatePresignedUrl;
