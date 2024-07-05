import Joi from 'joi';
const signUp = {
    body: Joi.object({
        name: Joi.string().required().min(3).pattern(/^[a-zA-Z]+$/).messages({
            'any.required': 'Name is Required' ,
            'string.base': 'Name must be a string',
            'string.empty': 'Name not allowed to be empty',
            'string.min': 'Name must be at least 3 characters',
            'string.pattern.base': 'Name must only contain letters'
        }),
        email: Joi.string().required().email().messages({
            "any.required": "Email is Required",
            'string.base': 'Email must be a string',
            'string.empty': 'Email not allowed to be empty',
            'string.email': 'Email must be a valid email'
        }),
        password: Joi.string().required().min(8).messages({
            "any.required": 'Password is Required',
            'string.base': 'Password must be a string',
            'string.empty': 'Password not allowed to be empty',
            'string.min': 'Password must be at least 8 characters'
        }),
        confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
            'any.only': 'confirmPassword does not match password',
            'any.required': 'confirmPassword is Required',
        })
    })
};

const login = {
    body: Joi.object({
        email: Joi.string().required().email().messages({
            "any.required": "Email is Required",
            'string.base': 'Email must be a string',
            'string.empty': 'Email not allowed to be empty',
            'string.email': 'Email must be a valid email'
        }),
        password: Joi.string().required().min(8).messages({
            "any.required": 'Password is Required',
            'string.base': 'Password must be a string',
            'string.empty': 'Password not allowed to be empty',
            'string.min': 'Password must be at least 8 characters'
        }),
    })
};


const forgetPassword = {
    body: Joi.object({
        email: Joi.string().required().email().messages({
            "any.required": "Email is Required",
            'string.base': 'Email must be a string',
            'string.empty': 'Email not allowed to be empty',
            'string.email': 'Email must be a valid email'
        })
    })
}


const resetPassword = {
    body: Joi.object({
        newPassword: Joi.string().min(8).required().messages({
            'any.required': 'NewPassword Field  is Required',
            'string.base': 'newPassword Field must be a string',
            'string.min': 'NewPassword Field must be at least 8 characters',
            'string.empty': 'newPassword Field not allowed to be empty'
        })
    }),

    params: Joi.object({
        token: Joi.string().required().length(64).pattern(/^[a-fA-F0-9]+$/).messages({
            'string.base': 'Token must be a string',
            'string.empty': 'Token is required',
            'any.required': 'Token is required',
            'string.length': 'Token must be exactly 64 characters long',
            'string.pattern.base': 'Token must be a valid hexadecimal string'
        })
    })
    
}

export default {signUp, login, forgetPassword, resetPassword}