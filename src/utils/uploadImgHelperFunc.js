import fs from 'fs'
import { cloudinaryUploadImg } from "./cloudinary.js";
import AppError from './AppError.js';

export const deletePhotoFromServer = async (filePath) => {
    await fs.unlink(filePath, (err) => {
      if (err) {
        throw new AppError(
          `Couldn't Remove photo from server , Error: ${err.message}`,
          400
        );
      } else {
        console.log(`Photo Removed Successfully`);
      }
    });
  };

export const uploadToCloudinary = async (imagesPath) => {
    const cloudinaryImgUrl = [];
  
    for (let i = 0; i < imagesPath.length; i++) {
      const result = await cloudinaryUploadImg(imagesPath[i]);
      cloudinaryImgUrl.push(result);
    }
  
    return cloudinaryImgUrl;
  };