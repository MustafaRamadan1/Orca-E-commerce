import Joi from 'joi';
import JoiObjectId from 'joi-objectid';

Joi.objectId = JoiObjectId(Joi);

 const createSubCategory = {

    body: Joi.object({
        name: Joi.string().required().min(3).messages({
            'any.required': 'Name is Required' ,
            'string.base': 'Name must be a string',
            'string.empty': 'Name not allowed to be empty',
            'string.min': 'N0ame must be at least 3 characters',
         
        }),

        description: Joi.string().required().messages({
            'any.required': 'Description is Required',
            'string.base': 'Description must be a string',
            'string.empty': 'Description not allowed to be empty'
        }),
        category: Joi.objectId().required().messages({
            'string.base': 'Category ID must be a string',
            'string.empty': 'Category ID can not be Empty',
            'any.required': 'Category ID is required',
            'string.pattern.name': 'Category ID must be a valid MongoDB ObjectId'
        })
    })
};


const getSubCategory = {
    params: Joi.object({
        id: Joi.objectId().required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
            'string.pattern.name': 'ID must be a valid MongoDB ObjectId'
        })
    })
}


const updateSubCategory = {
    params: Joi.object({
        id: Joi.objectId().required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
            'string.pattern.name': 'ID must be a valid MongoDB ObjectId'
        })
    }),

    body:Joi.object({
        name: Joi.string().min(3).messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name not allowed to be empty',
            'string.min': 'Name must be at least 3 characters',
        }),
        description: Joi.string().messages({
            'string.base': 'Description must be a string',
            'string.empty': 'Description not allowed to be empty'
        }),
        category: Joi.objectId().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
            'string.pattern.name': 'ID must be a valid MongoDB ObjectId'
        })
    })
}


const deleteSubCategory ={
    params: Joi.object({
        id: Joi.objectId().required().messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID is required',
            'any.required': 'ID is required',
            'string.pattern.name': 'ID must be a valid MongoDB ObjectId'
        })
    })
}


export default {createSubCategory, deleteSubCategory, updateSubCategory , getSubCategory}