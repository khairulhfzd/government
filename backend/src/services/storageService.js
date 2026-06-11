const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';

let blobServiceClient = null;
let containerClient = null;

if (connectionString) {
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
    console.log('🔹 Azure Blob Storage client initialized successfully.');
  } catch (err) {
    console.error('⚠️ Failed to initialize Azure Blob Storage Client:', err.message);
  }
}

/**
 * Uploads a local file to Azure Blob Storage if configured, otherwise returns local path.
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Public URL or local URL path
 */
async function uploadFile(file) {
  // If Azure is not configured, fall back to local upload URL
  if (!blobServiceClient || !containerClient) {
    return `/uploads/${file.filename}`;
  }

  try {
    // Ensure the container exists and has public read access for blobs
    await containerClient.createIfNotExists({ access: 'blob' });

    const blobName = `${Date.now()}-${file.filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log(`[Storage] Uploading ${file.filename} to Azure Blob Storage as ${blobName}...`);
    
    // Upload local file to Azure
    await blockBlobClient.uploadFile(file.path);

    // Delete local file after successful upload to Azure to save disk space
    fs.unlink(file.path, (err) => {
      if (err) console.error('[Storage] Failed to delete local temp file:', err.message);
    });

    // Return the public URL of the blob
    return blockBlobClient.url;
  } catch (err) {
    console.error('[Storage] Azure upload failed, falling back to local file:', err.message);
    return `/uploads/${file.filename}`;
  }
}

module.exports = {
  uploadFile
};
