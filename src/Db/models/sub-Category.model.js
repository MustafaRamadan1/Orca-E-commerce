import mongoose from "mongoose";
import slug from "slug";
const subCategorySchema = new mongoose.Schema(
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
      unique: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "SubCategory Must has a parent Category"],
    },
  },
  {
    timestamps: true,
  }
);

subCategorySchema.pre("save", function (next) {
  if (this.isNew || this.isModified("name")) {
    this.slug = slug(this.name.en, "_");
  }

  next();
});

subCategorySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slug(update.name.en, "_");
  }
  next();
});

subCategorySchema.methods.toJSON = function () {
  const subCategory = this;
  const subCategoryObject = subCategory.toObject();
  delete subCategoryObject.__v;
  delete subCategoryObject.createdAt;
  delete subCategoryObject.updatedAt;
  return subCategoryObject;
};

export default mongoose.model("SubCategory", subCategorySchema);
