import AppError from "./AppError.js";

class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludedFields = ["page", "sort", "limit", "fields"];

    let filterObject = { ...this.queryString };

    excludedFields.forEach((el) => delete filterObject[el]);


    if(filterObject.max && filterObject.min){
      filterObject = {price:{$gte:filterObject.min, $lte:filterObject.max}}
    }
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
    const limit = this.queryString.limit * 1 || 3;
    const page = this.queryString.page * 1 || 1;
    const skip = (page - 1) * limit;

    if (skip >= totalDocumentCounts) {
      throw new AppError(`No Documents in this page`, 404);
    } else {
      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }
}

export default ApiFeature;
