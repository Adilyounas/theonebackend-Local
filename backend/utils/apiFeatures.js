class ApiFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    search() {
      const keyword = this.queryStr.keyword
        ? {
            name: {
              $regex: this.queryStr.keyword,
              $options: "i",
            },
          }
        : {};
      this.query = this.query.find(keyword);
      return this;
    }
  
    filter() {
      const queryStrCopy = { ...this.queryStr };
      const removeFields = ["keyword", "page", "limit"];
      removeFields.forEach((key) => delete queryStrCopy[key]);
  
      let addDollar = JSON.stringify(queryStrCopy);
  
      addDollar = addDollar.replace(
        /\b(gt|gte|lt|lte|eq)\b/g,
        (key) => `$${key}`
      );
      this.query = this.query.find(JSON.parse(addDollar));
      return this;
    }
  
    pagination(resultPerPage) {
      const curruntPage = (this.queryStr.page) || 1;
      const skip = (curruntPage - 1) * resultPerPage;
  
      this.query = this.query.limit(resultPerPage).skip(skip);
      return this;
    }
  }
  
  module.exports = ApiFeatures;
  