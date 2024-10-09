import mongoose from "mongoose";
import AppError from "./AppError.js";

class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludedFields = ["page", "sort", "limit", "fields"];

    let filterObject = { ...this.queryString };

    console.log(filterObject);

    excludedFields.forEach((el) => delete filterObject[el]);

    if (filterObject.category === "undefined") {
      delete filterObject.category;
    }

    if (
      filterObject.subCategory !== "undefined" &&
      filterObject.subCategory !== ""
    ) {
      const subCategoriesIds = filterObject.subCategory.split(",");
      filterObject = {
        ...filterObject,
        subCategory: { $in: subCategoriesIds },
      };
    } else {
      delete filterObject.subCategory;
    }

    if (filterObject.size !== "undefined") {
      filterObject = { ...filterObject, ["size.value"]: filterObject.size };
      delete filterObject.size;
    } else {
      delete filterObject.size;
    }

    if (filterObject.colors !== "undefined") {
      const colorsArray = filterObject.colors.split(",");
      filterObject = {
        ...filterObject,
        colors: {
          $elemMatch: {
            value: {
              $in: colorsArray,
            },
          },
        },
      };
    } else {
      delete filterObject.colors;
    }

    if (filterObject.min !== "undefined" && filterObject.max !== "undefined") {
      filterObject = {
        ...filterObject,
        price: { $gte: filterObject.min, $lte: filterObject.max },
      };
      delete filterObject.max;

      delete filterObject.min;
    } else {
      delete filterObject.max;

      delete filterObject.min;
    }

    if (filterObject.sale === "true") {
      filterObject.discount = { $gt: 0 };
      delete filterObject.sale;
    } else {
      // filterObject.discount =0;
      delete filterObject.sale;
    }

    console.log(filterObject);
    this.query = this.query.find(filterObject);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");

      this.query = this.query.select(fields);
    }
    return this;
  }

  pagination(totalDocumentCounts) {
    const limit = this.queryString.limit * 1 || 5;
    const page = this.queryString.page * 1 || 1;
    const skip = (page - 1) * limit;

    if (skip >= totalDocumentCounts) {
      this.query = new Promise((resolve) => {
        resolve([]);
      });
    } else {
      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }
}

export default ApiFeature;
