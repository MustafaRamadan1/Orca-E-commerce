import Joi from "joi";

export const createPromoCodeSchema = {
  body: Joi.object({
    code: Joi.string()
      .pattern(/^[a-zA-Z0-9]+$/) // Alphanumeric code (letters and numbers)
      .required()
      .messages({
        "string.pattern.base":
          "Code must be alphanumeric (letters or numbers).",
      }),

    expirationDate: Joi.date()
      .min("now") // Expiration date cannot be in the past
      .required()
      .messages({
        "date.min": "Expiration date must be today or in the future.",
      }),

    discount: Joi.number()
      .min(0)
      .max(100) // Discount between 0 and 100
      .required()
      .messages({
        "number.min": "Discount cannot be lower than 0.",
        "number.max": "Discount cannot be higher than 100.",
      }),
  }),
};

export const updatePromoCodeSchema = Joi.object({
  code: Joi.string()
    .pattern(/^[a-zA-Z0-9]+$/) // Alphanumeric pattern (letters and numbers allowed)
    .messages({
      "string.pattern.base":
        "Code must be alphanumeric (letters and/or numbers).",
    }),

  expirationDate: Joi.date().min("now").messages({
    "date.min": "Expiration date must be today or a future date.",
    "date.base": "Expiration date must be a valid date.",
  }),

  discount: Joi.number()
    .min(0)
    .max(100) // Discount must be between 0 and 100
    .messages({
      "number.min": "Discount cannot be less than 0.",
      "number.max": "Discount cannot be more than 100.",
      "number.base": "Discount must be a valid number.",
    }),
});
