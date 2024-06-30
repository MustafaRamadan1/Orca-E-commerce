import AppError from "../utils/AppError.js";

const Authorization = (...roles) => (req, res , next)=>{

    if(!roles.includes(req.user.role)){
        
        return next(new AppError(`You are not allowed to access this route`, 403));
    }

    return next();
};

export default Authorization;