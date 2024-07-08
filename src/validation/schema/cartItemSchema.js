import Joi from "joi";


 const createCartItem = {
    body:Joi.object({
        product : Joi.objectId().required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
            'string.pattern.name': 'ID must be a valid MongoDB ObjectId'
        }),
        cart: Joi.objectId().required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
            'string.pattern.name': 'ID must be a valid MongoDB ObjectId'
        }),
        quantity:Joi.number().required().min(1).messages({
            'string.base': 'Quantity must be a number',
            'string.empty': 'Quantity is required',
            'any.required': 'Quantity is required',
            'number.min': 'Quantity must be at least 1'
        })
    })
}

export default {createCartItem}