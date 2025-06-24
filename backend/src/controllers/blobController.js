import containerClient from "../config/azureBlob.js";
import { v4 as uuidv4 } from "uuid";

export const uploadProfilePicture = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Brak obrazu." });
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const blobName = `${uuidv4()}.jpg`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: "image/jpeg" },
    });

    res.status(200).json({ url: blockBlobClient.url });
  } catch (error) {
    console.error("Błąd uploadu:", error.message);
    res.status(500).json({ error: "Upload nie powiódł się." });
  }
};
