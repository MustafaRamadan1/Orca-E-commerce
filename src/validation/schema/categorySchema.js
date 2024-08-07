import Joi from "joi";
import JoiObjectId from "joi-objectid";

Joi.objectId = JoiObjectId(Joi);

const createCategory = {
  body: Joi.object({
    name: Joi.object({
      en: Joi.string().required().min(3).messages({
        "any.required": "Name is Required",
        "string.base": "Name must be a string",
        "string.empty": "Name not allowed to be empty",
        "string.min": "Name must be at least 3 characters",
      }),

      ar: Joi.string().required().min(3).messages({
        "any.required": "Name is Required",
        "string.base": "Name must be a string",
        "string.empty": "Name not allowed to be empty",
        "string.min": "Name must be at least 3 characters",
      }),
    }),

    description: Joi.object({
      en: Joi.string().required().messages({
        "any.required": "Description is Required",
        "string.base": "Description must be a string",
        "string.empty": "Description not allowed to be empty",
      }),

      ar: Joi.string().required().messages({
        "any.required": "Description is Required",
        "string.base": "Description must be a string",
        "string.empty": "Description not allowed to be empty",
      }),
    }),
  }),
};

const getCategory = {
  params: Joi.object({
    id: Joi.objectId().required().messages({
      "string.base": "ID must be a string",
      "string.empty": "ID is required",
      "any.required": "ID is required",
      "string.pattern.name": "ID must be a valid MongoDB ObjectId",
    }),
  }),
};

const updateCategory = {
  params: Joi.object({
    id: Joi.objectId().required().messages({
      "string.base": "ID must be a string",
      "string.empty": "ID is required",
      "any.required": "ID is required",
      "string.pattern.name": "ID must be a valid MongoDB ObjectId",
    }),
  }),

  body: Joi.object({
    name: Joi.object({
      en: Joi.string().required().min(3).messages({
        "any.required": "Name is Required",
        "string.base": "Name must be a string",
        "string.empty": "Name not allowed to be empty",
        "string.min": "Name must be at least 3 characters",
      }),

      ar: Joi.string().required().min(3).messages({
        "any.required": "Name is Required",
        "string.base": "Name must be a string",
        "string.empty": "Name not allowed to be empty",
        "string.min": "Name must be at least 3 characters",
      }),
    }),

    description: Joi.object({
      en: Joi.string().required().messages({
        "any.required": "Description is Required",
        "string.base": "Description must be a string",
        "string.empty": "Description not allowed to be empty",
      }),

      ar: Joi.string().required().messages({
        "any.required": "Description is Required",
        "string.base": "Description must be a string",
        "string.empty": "Description not allowed to be empty",
      }),
    }),
  }),
};

const deleteCategory = {
  params: Joi.object({
    id: Joi.objectId().required().messages({
      "string.base": "ID must be a string",
      "string.empty": "ID is required",
      "any.required": "ID is required",
      "string.pattern.name": "ID must be a valid MongoDB ObjectId",
    }),
  }),
};

export default { createCategory, deleteCategory, updateCategory, getCategory };
