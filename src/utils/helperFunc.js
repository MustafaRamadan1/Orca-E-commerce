import jwt  from 'jsonwebtoken'
export const signToken = (payload)=>{
    return jwt.sign(payload, process.env.SECERT_KEY,{
        expiresIn: process.env.EXPIRES_IN
    })
};

export const filterObject = (object, ...allowedFields)=>{

    const obj = {};

    allowedFields.forEach((field)=>{

        if(object[field]) return obj[field] = object[field]
    });

    return obj;
}



// payment helper function 

export const countCartTotalPrice = (cartItemsArray) =>{

    return cartItemsArray.reduce((total, item)=> total + (item.quantity * item.product.price),0);
}


export const formatItemsForPayment = (cartItem)=>{

    return cartItem.map((item)=>{
        return { product_id: item.product._id,
        name: item.product.name,
        description: item.product.description,
        amount: item.product.price * 100,
        quantity: item.quantity,
      }
    })
}

export const generatePaymentLink = (payload) =>{
    return `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${payload}`;
}