import AppError from "../utils/AppError.js";

const validation = schema=> (req, res ,next)=>{

    const errorMessages = [];

    const checkParts = ['body','params', 'query'];

    checkParts.forEach((part)=>{
        if(schema[part]){

            const {error} = schema[part].validate(req[part]);

            if(error){
                console.log(error);
               errorMessages.push(errorFormat(error, part));
            }
        }
    })

    if(errorMessages.length > 0){
        console.log(JSON.parse(errorMessages.join(' , ')))
        return next(new AppError(errorMessages.join(' , '), 400));
    }
    else{
        return next();
    }
};


function errorFormat(error, part){
    
    const object = {type: part, error:error.details[0].message};
    // return `${part}Error : ${error.details[0].message}`
    return JSON.stringify(object)
}
export default validation;