import jwt  from 'jsonwebtoken'
export const signToken = (payload)=>{
    return jwt.sign(payload, process.env.SECERT_KEY,{
        expiresIn: process.env.EXPIRES_IN
    })
};

export const filterObject = (object, ...allowedFields)=>{

    const obj = {};

    allowedFields.forEach((field)=>{

        if(object[field]) return obj[field] = object[field]
    });

    return obj;
}
