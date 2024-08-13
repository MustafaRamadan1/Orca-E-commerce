import slug from "slug";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
const castId = (err) => {
  return new AppError(` Invalid ID, ${err.value} is not a valid ID`, 404);
};

const duplicateKeyHandler = (err) => {
  const message = Object.keys(err.keyValue).map((key) => {
    if (key === "name") return "";
    return `Key ${key} is Already exist in the Db`;
  });
  return new AppError(message.toString(), 422);
};

const validationError = (err) => {
  const keys = Object.keys(err.errors);
  const values = Object.values(err.errors).map((item) => item.message);
  let errMessage = "";

  for (let i = 0; i < keys.length; i++) {
    errMessage += `${keys[i]} : ${values[i]},`;
  }
  return new AppError(errMessage, 404);
};

const productionHandler = (err, res) => {
  if (err.isOperational) {
    console.log(err.message.toUpperCase());
    logger.error(`Error: ${err.message}`, {
      stack: err.stack,
    });
    res.status(err.statusCode).json({
      status: err.status,
      message: slug(err.message.toUpperCase(), {
        lower: false,
        replacement: "_",
      }),
    });
  } else {
    logger.error(`Something went wrong`, {
      error: err,
      stack: err.stack,
    });
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
const globalErrorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "Development") {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error,
      stack: error.stack,
    });
  } else {
    console.log(error);
    let err = { ...error };

    err.message = error.message;
    if (error.name === "CastError") err = castId(err);
    if (error.code === 11000) err = duplicateKeyHandler(err);
    if (error.name === "ValidationError") err = validationError(err);
    if (error.name === "JsonWebTokenError")
      err = new AppError(`Invalid Token, Please login Again `, 401);
    if (error.name === "TokenExpiredError")
      err = new AppError(`Token Expired, Please login Again`, 401);
    // if(error.message = 'Unexpected field') err = new AppError(`You try to Upload more files, Please Upload Only 3 Files`,400)
    productionHandler(err, res);
  }
};

export default globalErrorHandler;
