import sharp from "sharp";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { catchAsync } from "./catchAsync.js";
import AppError from "./AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resizeProductImg = catchAsync(async (req, res, next) => {
  console.log("body", req.body);

  if (req.body.images && req.files.length === 0) {
    req.images = [];
    return next();
  }

  if (req.params.id && req.method === "PUT" && req.files.length === 0) {
    req.images = [];
    return next();
  } else if (!req.files || req.files.length === 0)
    return next(
      new AppError(`No Images uploaded , Please Provide Images`, 400)
    );

  const images = [];
  console.log(req.files.length);
  for (let i = 0; i < req.files.length; i++) {
    const filepath = `${__dirname}/../uploads/products/${uuid()}.jpg`;
    // const filepath = `/tmp/${uuid()}.jpg`;
    await sharp(req.files[i].buffer)
      .sharpen({
        sigma: 1,
        m1: 0.8,
        m2: 0.7,
      })
      .toFormat("jpeg", {
        quality: 90, // Keep quality high
        progressive: true,
        chromaSubsampling: "4:4:4", // Retain full color quality
        trellisQuantisation: true,
        overshootDeringing: true,
        optimizeScans: true,
      })
      .toFile(filepath);
    images.push(filepath);
  }

  req.images = images;
  next();
});

export default resizeProductImg;
