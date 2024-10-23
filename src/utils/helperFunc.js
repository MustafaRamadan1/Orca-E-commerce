import jwt from "jsonwebtoken";
import pug from "pug";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Product from "../Db/models/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const signToken = (payload) => {
  return jwt.sign(payload, process.env.SECERT_KEY, {
    expiresIn: process.env.EXPIRES_IN,
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

export const countCartTotalPrice = (cartItemsArray , promocodeDiscount) => {
  return cartItemsArray.reduce(
    (total, item) => {
      return total + ((item.quantity * item.product.saleProduct) * promocodeDiscount)
    },
    0
  );
};

export const formatItemsForPayment = (cartItem, locale, promocodeDiscount) => {
  return cartItem.map((item) => {
    return {
      name: item.product.name.en,
      description: "YES" || item.product.description.en,
      amount: item.product.saleProduct * 100 * promocodeDiscount,
      quantity: item.quantity,
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

// export const validateCartItemsQuantity = async (cartItems) => {
//   const productNExist = [];
//   console.log("cartItems", cartItems);
//   for (let item of cartItems) {
//     const product = await Product.findById(item.product);
//     console.log("product", product);
//     if (!product) {
//       productNExist.push({ name: item.name });
//     } else {
//       // cartItems colors [c1, c2, c3]
//       const colors = cartItems.map((c) => c.colorId);

//       const productColors = product.colors.map((c) => c.id);
//       console.log("productColors", productColors);
//       console.log("colors", colors);
//       for (let color of colors) {
//         console.log("color", color);
//         if (productColors.includes(color)) {
//           console.log("1.");
//           const productColor = product.colors.find((c) => c.id === color);
//           console.log("productColor", productColor);
//           if (!(productColor.quantity >= item.quantity)) {
//             console.log("2.");
//             productNExist.push({
//               name: item.name,
//               quantity: product.quantity,
//             });
//           }
//         } else {
//           console.log("200. ELSEE");
//           productNExist.push({ name: item.name });
//         }
//       }
//     }
//   }
//   return productNExist;
// };

export const validateCartItemsQuantity = async (cartItems) => {
  /**
   * 1 - cartItems [cp1, cp2, cp3] =>
   * cp1 is exists in the system ->
   * cp1 {id, colors,} ->
   * cp1.color(blue) p1.colors(blue, red)
   */

  const productNExist = [];

  for (let cartItem of cartItems) {
    console.log(cartItem)
    const product = await Product.findById(cartItem.product);
    if (!product) {
      productNExist.push({ name: cartItem.name });
      continue;
    }
    
    const productColors = product.colors.map((c) => c.id);
    if (productColors.includes(cartItem.colorId)) {
      const cartItemProductColor = product.colors.find(
        (productColor) => productColor.id === cartItem.colorId
      );
      if (cartItemProductColor.quantity >= cartItem.quantity) {
        //
      } else {
        productNExist.push({
          name: cartItem.name,
          quantity: cartItem.quantity,
        });
      }
    } else {
      productNExist.push({ name: cartItem.name, quantity: cartItem.quantity });
    }
  }

  return productNExist;
};

/**
 * FRONT -> cartItems
 * cartItems -> 1 product - 1 color(blue) - quantity 4
 * cartItems colors = [id]
 * 65: (id)
 *    if(id(blue) in product colors)
 *      - {color in product}
 *      - color.quantity(5) >= cartItem.quantity(4)
 *          - DONE
 *    else
 *      -  ERROR
 */
