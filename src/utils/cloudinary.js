import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploadImg = async (fileToUpload) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      fileToUpload,

      (result) => {
        resolve({
          url: result.url,
          id: result.public_id,
        });
      },
      {
        resource_type: "auto",
      }
    );
  });
};

export const cloudinaryDeleteImg = async (public_id) => {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(public_id, (result) => {
      resolve(result);
    });
  });
};
