import axios from "axios";

export const paymobAuthentication = async () => {
  try {
    const response = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      {
        api_key: process.env.PAYMOB_API_KEY,
      },
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    return response.data.token;
  } catch (err) {
    console.log(err);
  }
};

export const registerOrder = async (token, amount, items) => {
  try {
    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: amount * 100,
        currency: "EGP",
        items,
      }
    );

    return response.data.id;
  } catch (err) {
    console.log(err);
  }
};

export const generatePaymentKey = async (token, orderId, user, amount, integration_id) => {
  try {
    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/acceptance/payment_keys",
      {
        auth_token: token,
        amount_cents: amount * 100,
        expiration: 3600,
        order_id: orderId,
        currency: "EGP",
        billing_data: {
          email: user.email || "NA",
          phone_number: user.phone || 'NA',
          apartment: user.address ? user.address.apartment : "NA",
          floor: user.address ? user.address.floor : "NA",
          building: user.address ? user.address.building : "NA",
          street: user.address ? user.address.street : "NA",
          city: user.address ? user.address.city : "NA",
          country: user.address ? user.address.country : "NA",
          first_name:  user.name.split(' ')[0],
          last_name: user.name.split(' ').length === 1? user.name.split(' ')[0] : user.name.split(' ')[1],
          state: user.address ? user.address.state : "NA",
          zip_code: user.address ? user.address.zip_code : "NA",
        },
        integration_id,
        lock_order_when_paid: "false",
      }
    );

    return response.data.token;
  } catch (err) {

    console.log(err)
  }
};



export const createPayment =  async (user, amount, items, integration_id)=> {
    let token = await paymobAuthentication();
    let orderId = await registerOrder(token, amount,items);
    let paymentToken = await generatePaymentKey(token,orderId,user,amount,integration_id);
    return {
        orderId: orderId,
        token: paymentToken
    };
}


export const getPaymentKeyCreditCard = async  (user, amount, items,integration_id)=>{

    let {orderId, token} = await createPayment(user, amount,items,integration_id);
    return {
        paymentId: orderId,
        data: `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${token}`
    }
}

