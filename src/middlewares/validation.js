import AppError from "../utils/AppError.js";

const validation = (schema) => (req, res, next) => {
  console.log(req.originalUrl);

  const errorMessages = [];

  const checkParts = ["body", "params", "query"];

  checkParts.forEach((part) => {
    if (schema[part]) {
      if (part === "body") {
        console.log(req.body);
      }
      const { error } = schema[part].validate(req[part]);

      if (error) {
        console.log(error);
        errorMessages.push(error.details[0].message);
      }
    }
  });

  if (errorMessages.length > 0) {
    // console.log(JSON.parse(errorMessages.join(" , ")));
    // return next(new AppError(errorMessages.join(" , "), 400));
    return next(new AppError(errorMessages.join(" , "), 400));
  } else {
    return next();
  }
};

// function errorFormat(error, part) {
//   console.log("error.details[0]", error.details[0]);
//   const object = { error: error.details[0].message };
//   // return `${part}Error : ${error.details[0].message}`
//   return JSON.stringify(object);
// }
export default validation;
