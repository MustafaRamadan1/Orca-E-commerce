# E-commerce Project 

## Overview
 Backend for an e-commerce platform built with Node.js, Express.js and MongoDB, focusing on user authentication, category management, product handling, shopping carts, and payment processing using Paymob.

## Features
- User Authentication
- Category Management
- Subcategory Management
- Product Management
- Cart Management
- Payment Integration

## Technologies Used
- **Backend Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **File Upload:** Multer for handling file uploads to Cloudinary
- **Authentication:** JWT (JSON Web Tokens), Bcrypt
- **Payment Gateway:** Paymob for card and wallet payments
- **Logging:** Winston for logging
- **Validation:** Joi for input validation
- **Environment Variables:** dotenv for managing environment variables

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MustafaRamadan1/E-commerce.git


## Install dependencies 

    npm i OR npm install

## Set up environment variables

    Create .env file in the root folder and put varible for that 

## PORT
   ## DB_LOCAL
   ## DB_ATLAS
   ## NODE_ENV
   ## SECERT_KEY
   ## EXPIRES_IN
   ## MAIL_TRAP_HOSTNAME
   ## MAIL_TRAP_PORT
   ## MAIL_TRAP_USERNAME
   ## MAIL_TRAP_PASSWORD
   ## MAIL_TRAP_FROM
   ## SENDGRID_USERNAME  
   ## SENDGRID_PASSWORD
   ## SENDGRID_SERVERNAME
   ## SENDGRID_PORT
   ## SENDGRID_FROM
   ## CLOUDINARY_CLOUD_NAME
   ## CLOUDINARY_API_KEY
   ## CLOUDINARY_API_SECRET
   ## PAYMOB_API_KEY
   ## PAYMOB_SECERT_KEY
   ## PAYMOB_PUBLIC_KEY
   ## PAYMOB_IFRAME_ID
   ## PAYMOB_CARD_INTEGRATION
   ## PAYMOB_WALLET_INTEGRATION
   ## PAYMOB_HMAC



## Run the application

    npm start 


## API Routes

## Authentication: 
    /api/v1/auth/login
    /api/v1/auth/signup
    /api/v1/auth/forgotpassword
    /api/v1/auth/resetpassword


## Categories: 
     /api/v1/categories
     /api/v1/categories/:id
     /api/v1/categories/filter/:letter
     /api/v1/categories/:id

## subCategories: 
     /api/v1/subCategories
     /api/v1/subCategories/:id,
     /api/v1/subCategories/filter/:letter,

## Products: 
     /api/v1/products
     /api/v1/products/:id

## Carts
    /api/v1/carts
    /api/v1/carts/:id,
    /api/v1/carts/users/:id

## CartItems
    /api/v1/cartItems
    /api/v1/cartItems/:id,
    /api/v1/cartItems/cart/:id

## Payment
    /api/v1/payment/checkout



## Contributors
    AhmedAbdEl-Nasser
    Mustafa Ramadan
