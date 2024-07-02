import sharp from "sharp";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { catchAsync } from "./catchAsync.js";
import AppError from "./AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resizeProductImg = catchAsync(async (req, res ,next)=>{

    if(!req.files) return next(new AppError(`No Images uploaded , Please Provide Images`, 400));
    const images = [];
 
    for(let i =0;i<req.files.length;i++){

        const filepath = `${__dirname}/../uploads/products/${uuid()}.jpg`
        await sharp(req.files[i].buffer)
        .resize(300, 300)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(filepath);
        images.push(filepath)

    };

    req.images = images;
    next();
})

export default resizeProductImg;