import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const Authorization = (...roles) => (req, res , next)=>{

    if(!roles.includes(req.user.role)){
        
        logger.error(`User trying to access route he's not allowed to `,{
            userId: req.user._id
        })
        return next(new AppError(`You are not allowed to access this route`, 403));
    }


    logger.info(`User Authorized to access the route `,{
        userId: req.user._id,
        url: `${req.originalUrl}`
    })

    return next();
};

export default Authorization;