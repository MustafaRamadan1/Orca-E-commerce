import Joi from 'joi';

 const createCategory = {

    body: Joi.object({
        name: Joi.string().required().min(3).messages({
            'any.required': 'Name is Required' ,
            'string.base': 'Name must be a string',
            'string.empty': 'Name not allowed to be empty',
            'string.min': 'Name must be at least 3 characters',
         
        }),

        description: Joi.string().required().messages({
            'any.required': 'Description is Required',
            'string.base': 'Description must be a string',
            'string.empty': 'Description not allowed to be empty'
        })
    })
};


export default {createCategory}