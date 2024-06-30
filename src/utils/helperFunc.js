import jwt  from 'jsonwebtoken'
export const signToken = (payload)=>{
    return jwt.sign(payload, process.env.SECERT_KEY,{
        expiresIn: process.env.EXPIRES_IN
    })
};
