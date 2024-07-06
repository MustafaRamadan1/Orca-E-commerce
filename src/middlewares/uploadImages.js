import multer from "multer";
import AppError from "../utils/AppError.js";

const storage = multer.memoryStorage();


const upload = multer({
    storage,
    fileFilter: (req, file, cb)=>{
        if(file.mimetype.startsWith('image')){
            cb(null, true)
        }
        else{
            cb(new AppError(`Not Image , Please provide images with valid format`, 400))
        }
    }
});

export default upload;