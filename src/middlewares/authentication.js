import{promisify} from 'util'
import jwt from 'jsonwebtoken';
import AppError from "../utils/AppError.js";
import { catchAsync } from '../utils/catchAsync.js';
import User from '../Db/models/user.model.js';

const authentication = catchAsync(async (req, res ,next)=>{
    let token = '';
    if(req.headers.authorization && req.headers.authorization.startsWith('bearer')){

        token = req.headers.authorization.split(' ')[1];
    };

    if(!token) return next(new AppError(`You are not logging in , Please Login `,401));

    const decode = await promisify(jwt.verify)(token, process.env.SECERT_KEY);

    const currentUser = await User.findById(decode.id);

    if(!currentUser) return next(new AppError(`User no Longer Exist`,404));

    
    // under test 

    if(currentUser.checkUpdatePasswordState(decode.iat)) return next(new AppError(`Password Changed , Please Login Again`, 401));


    req.user = currentUser;
    next();
});

export default authentication;