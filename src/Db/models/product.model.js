import mongoose from "mongoose";
import slug from "slug";
import logger from "../../utils/logger.js";
export const productSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, "name is Required"],
        trim: true,
        minLength: [3, "name must be at least 3 character"],
      },
      ar: {
        type: String,
        required: [true, "name is Required"],
        trim: true,
        minLength: [3, "name must be at least 3 character"],
      },
    },

    description: {
      en: {
        type: String,
        required: [true, "description is Required"],
        trim: true,
      },
      ar: {
        type: String,
        required: [true, "description is Required"],
        trim: true,
      },
    },

    slug: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "price is Required"],
      min: [1, "price must be at least 1"],
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
    },
    subCategory: [
      {
        type: mongoose.Types.ObjectId,
        ref: "SubCategory",
        // unique: true
      },
    ],
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity can not be negative"],
    },
    discount: {
      type: Number,
      default: 0.0,
    },
    images: [Object],
    size: {
      value: { type: String, required: [true, "Size value is required"] },
      label: { type: String, required: [true, "Size label is required"] },
      color: { type: String, required: [true, "size Color is required"] },
    },
    colors: [
      {
        value: { type: String, required: [true, "Color value is required"] },
        label: { type: String, required: [true, "Color label is required"] },
        color: { type: String, required: [true, "Color is required"] },
        quantity: {
          type: Number,
          min: [0, "Quantity can not be negative"],
          required: [true, "Color quantity is required"],
	  min: [0, "Quantity can not be negative"],
        },
      },
    ],

    ratingAverage: {
      type: Number,
      default: 1,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be max 5"],
    },

    ratingQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    id: false,
  }
);

productSchema.index({ name: 1, "size.value": 1 }, { unique: true });
// productSchema.index({ name: 1, size: 1 }, { unique: true });
productSchema.virtual("saleProduct").get(function () {
  return this.price - this.price * (this.discount / 100);
});

productSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("name")) {
    this.slug = slug(this.name.en, "_");
  }
  return next();
});

// productSchema.pre("save", async function (next) {
//   // 'this' refers to the current document being saved

//   if (this.colors.length > 0) {
//     this.colors = this.colors.filter((color) => color.quantity > 0);
//   }
// });

productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.name) {
    this.slug = slug(update.name.en, "_");
  }

  return next();
});

export default mongoose.model("Product", productSchema);
