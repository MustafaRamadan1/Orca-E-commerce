import { promisify } from "util";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import User from "../Db/models/user.model.js";
import logger from "../utils/logger.js";

const authentication = catchAsync(async (req, res, next) => {
  let token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }



  if (!token){
    logger.error(`No token in the header to make the user login `,{
      token
    })
    return next(new AppError(`You are not logging in , Please Login `, 401));
  }
    

 
  const decode = await promisify(jwt.verify)(token, process.env.SECERT_KEY);

  const currentUser = await User.findById(decode.id);
  console.log(currentUser)
  if (!currentUser) {
    logger.error(`No user exist with this id , maybe deleted it `,{
      userId: decode.id
    })
    return next(new AppError(`User no Longer Exist`, 404));
  }

  // if(!currentUser.isActive) return next(new AppError(`Please Activate your Account`, 401));
  // under test

  if (currentUser.checkUpdatePasswordState(decode.iat)){

    logger.error(`Password for that user Changed after sending the token to him`,{

      userId: currentUser._id
    })
    return next(new AppError(`Password Changed , Please Login Again`, 401));
  }
   

  if (!currentUser.isActive) {
    logger.error(`This user didn't activate his account`,{

      userId: currentUser._id
    })
    return next(new AppError(` Please Activate your Account`, 401));
  }


  logger.info(`User Authenticated Successfully`)
  req.user = currentUser;

  next();
});

export default authentication;
