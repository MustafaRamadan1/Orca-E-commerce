import jwt from "jsonwebtoken";
import pug from "pug";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Product from "../Db/models/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const signToken = (payload) => {
  return jwt.sign(payload, process.env.SECERT_KEY, {
    expiresIn: process.env.EXPIRES_IN
  });
};

export const filterObject = (object, ...allowedFields) => {
  const obj = {};

  allowedFields.forEach((field) => {
    if (object[field]) return (obj[field] = object[field]);
  });

  return obj;
};

// payment helper function

export const countCartTotalPrice = (cartItemsArray) => {
  return cartItemsArray.reduce(
    (total, item) => total + item.quantity * item.product.saleProduct,
    0
  );
};

export const formatItemsForPayment = (cartItem, locale) => {
  return cartItem.map((item) => {
    return {
      name: item.product.name[locale],
      description: item.product.description[locale],
      amount: item.product.saleProduct * 100,
      quantity: item.quantity
    };
  });
};

export const generatePaymentLink = (payload) => {
  return `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${payload}`;
};

export const compileTemplate = (templatePath, data) => {
  const toHtml = pug.compileFile(`${templatePath}`);
  const html = toHtml(data);

  return html;
};

export const validateCartItemsQuantity = async (cartItems) => {
  const productNExist = [];
  for (let item of cartItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      productNExist.push({ name: item.name });
    } else {
      product.colors.forEach((color) => {
        color;
        if (color.id === item.colorId) {
          color.quantity < item.quantity
            ? productNExist.push({
                name: item.name,
                quantity: product.quantity
              })
            : null;
        }
      });
    }
  }
  return productNExist;
};
