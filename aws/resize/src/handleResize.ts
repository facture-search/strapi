// Resize an image from the bucket and then upload it

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

    const image = await sharp(Buffer.from(uploaded.Body?.toString() as string))
        .resize(dimensions.width, dimensions.height)
        .toFormat("jpg")
        .toBuffer();

    S3.putObject({
        Body: image,
        Bucket: resizedBucket,
        ContentType: "image/jpg",
        Key: key,
    }).promise();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/jpg",
            "Content-Disposition": `attachment; filename=${key}`,
        },
        body: uploaded.Body?.toString("base64"),
        isBase64Encoded: true,
    };
};
