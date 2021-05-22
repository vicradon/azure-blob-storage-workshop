import dotenv from "dotenv";
dotenv.config();

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  newPipeline,
} from "@azure/storage-blob";

const containerName1 = "thumbnails";
const containerName2 = "app-uploads";

import getStream from "into-stream";
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };

const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY
);
const pipeline = newPipeline(sharedKeyCredential);

const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  pipeline
);

const getBlobName = (originalName) => {
  // Use a random number to generate a unique file name,
  // removing "0." from the start of the string.
  const identifier = Math.random().toString().replace(/0\./, "");
  return `${identifier}-${originalName}`;
};

const index = async (req, res, next) => {
  let viewData;

  try {
    const containerClient = blobServiceClient.getContainerClient(
      containerName2
    );
    const listBlobsResponse = await containerClient.listBlobFlatSegment();

    for await (const blob of listBlobsResponse.segment.blobItems) {
      console.log(`Blob: ${blob.name}`);
    }

    viewData = {
      title: "Home",
      viewName: "index",
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      containerName: containerName2,
      layout: "layout",
    };

    if (listBlobsResponse.segment.blobItems.length) {
      viewData.thumbnails = listBlobsResponse.segment.blobItems;
    }
  } catch (err) {
    viewData = {
      title: "Error",
      viewName: "error",
      message: "There was an error contacting the blob storage container.",
      error: err,
    };
    res.status(500);
  } finally {
    res.render(viewData.viewName, viewData);
  }
};

const upload = async (req, res) => {
  const blobName = getBlobName(req.file.originalname);
  const stream = getStream(req.file.buffer);
  const containerClient = blobServiceClient.getContainerClient(containerName2);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.uploadStream(
      stream,
      uploadOptions.bufferSize,
      uploadOptions.maxBuffers,
      { blobHTTPHeaders: { blobContentType: "image/jpeg" } }
    );
    res.render("success", { message: "File uploaded to Azure Blob storage." });
  } catch (err) {
    res.render("error", { message: err.message });
  }
};

export default {
  index,
  upload,
};
