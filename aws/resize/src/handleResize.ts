// Resize an image from the bucket and then upload it

import AWS from "aws-sdk";
import sharp from "sharp";

export default async (
    fileName: string,
    key: string,
    dimensions: { width: number; height: number },
    coldBucket: string,
    resizedBucket: string,
    S3: AWS.S3
) => {
    const uploaded = await S3.getObject({
        Bucket: coldBucket,
        Key: fileName,
    }).promise();

    const image = await sharp(uploaded.Body as Buffer)
        .resize(dimensions.width, dimensions.height)
        .toFormat("jpg")
        .toBuffer();

    await S3.upload({
        Body: image,
        Bucket: resizedBucket,
        Key: key,
    }).promise();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/jpg",
            "Content-Disposition": `attachment; filename=${key}`,
        },
        body: image.toString("base64"),
        isBase64Encoded: true,
    };
};
