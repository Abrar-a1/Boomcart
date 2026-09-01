// Whitelisted fields that users are allowed to filter on
const ALLOWED_FILTERS = ['category', 'subCategory', 'isFeatured'];

class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.currentPage = 1;
    this.countFilter = {}; // Accumulates filter conditions for accurate total count
  }

  search() {
    if (this.queryStr.keyword) {
      const searchCond = { $text: { $search: this.queryStr.keyword } };
      this.query = this.query.find(searchCond);
      Object.assign(this.countFilter, searchCond);
    }
    return this;
  }

  filter() {
    // Only pick whitelisted fields from the query string
    const safe = {};
    for (const key of ALLOWED_FILTERS) {
      if (this.queryStr[key] !== undefined) {
        safe[key] = this.queryStr[key];
      }
    }

    // Boolean conversion for isFeatured
    if (safe.isFeatured) safe.isFeatured = safe.isFeatured === 'true';

    // Price range filter (uses whitelisted minPrice/maxPrice params)
    if (this.queryStr.minPrice || this.queryStr.maxPrice) {
      const price = {};
      if (this.queryStr.minPrice) price.$gte = Number(this.queryStr.minPrice);
      if (this.queryStr.maxPrice) price.$lte = Number(this.queryStr.maxPrice);
      safe.$or = [
        { discountPrice: { $gt: 0, ...price } },
        { price, discountPrice: 0 },
      ];
    }

    this.query = this.query.find(safe);
    Object.assign(this.countFilter, safe);
    return this;
  }

  sort() {
    const allowed = ['-createdAt', 'createdAt', 'price', '-price', '-ratings', 'ratings'];
    const sortBy = allowed.includes(this.queryStr.sort) ? this.queryStr.sort : '-createdAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate() {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || 12;
    // Cap limit to prevent excessive data loading
    const finalLimit = limit > 100 ? 100 : limit;
    this.query = this.query.skip(finalLimit * (page - 1)).limit(finalLimit);
    this.currentPage = page;
    this.resultsPerPage = finalLimit;
    return this;
  }
}

module.exports = ApiFeatures;
