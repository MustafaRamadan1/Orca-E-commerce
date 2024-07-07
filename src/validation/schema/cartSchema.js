import Joi from "joi";

export const createCart = {
    body: Joi.object({
        user: Joi.objectId().required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
            'string.pattern.name': 'ID must be a valid MongoDB ObjectId'
        })
    })
};

