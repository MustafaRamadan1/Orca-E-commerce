import axios from "axios";

function stringifyObjectProperties(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            result[key] = stringifyObjectProperties(value);
        } else {
            result[key] = JSON.stringify(value);
        }
    }
    return result;
}
export const createPaymentIntentMultiMethod = async (amount, integrationIds, items, user)=>{


        console.log(integrationIds)
    try {
        const response = await axios.post('https://accept.paymob.com/v1/intention/', {
            amount,
            currency: "EGP",
            payment_methods: integrationIds,
            items,
            billing_data: {
                apartment: "NA",
                first_name: "Mustafa",
                last_name:'Ramadan',
                street: "NA",
                building: "NA",
                phone_number: "+201125773493",
                city: "NA",
                country: "EG",
                email: "mustafa123@gmail.com",
                floor: "NA",
                state: "NA"
            },
            customer: {
                first_name: "Mustafa",
                email: "mustafa123@gmail.com",
                extras: {
                    re: "22"
                }
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token egy_sk_test_0b96476ff18a0ff3e49c59b9023e7b4f2cf25408f5f976dc9d20d3fb2c3a1b4c'
            }
        });

        return response;
        
    } catch (error) {
       
        console.log(error)
}
}





export const formatBilling_Data = (data)=>{
    return {
      firstName: data.first_name,
      lastName: data.last_name,
      apartment:data.apartment,
      street:data.street,
      building:data.building,
      city: data.city,
      country: data.country,
      floor:data.floor,
      phoneNumber: data.phone_number,
    }
}