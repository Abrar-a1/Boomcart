const Product = require('../models/Product');
const ApiFeatures = require('../utils/apiFeatures');

class ProductService {
  async getPaginatedProducts(queryStr) {
    const features = new ApiFeatures(Product.find({ isActive: true }).select('-__v'), queryStr)
      .search().filter().sort().paginate();
    
    const products = await features.query;
    const total = await Product.countDocuments({ isActive: true, ...features.countFilter });
    
    return {
      products,
      total,
      resultsPerPage: features.resultsPerPage,
      currentPage: features.currentPage,
      totalPages: Math.ceil(total / features.resultsPerPage)
    };
  }

  async validateAndDecrementStock(productId, sizeRequested, quantity, session) {
    if (sizeRequested) {
      const product = await Product.findOneAndUpdate(
        { 
          _id: productId, 
          "sizes": { $elemMatch: { size: sizeRequested, stock: { $gte: quantity } } } 
        },
        { 
          $inc: { 
            "sizes.$.stock": -quantity,
            "stock": -quantity 
          } 
        },
        { session, new: true }
      );
      
      if (!product) {
        throw new Error(`Size ${sizeRequested} is Out of Stock or product missing`);
      }
    } else {
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } }, 
        { $inc: { stock: -quantity } },
        { session, new: true }
      );
      if (!product) throw new Error("Product Out of Stock or missing");
    }
  }

  async restoreStock(productId, sizeRestored, quantity, session) {
     if (sizeRestored) {
       await Product.updateOne(
         { _id: productId, "sizes.size": sizeRestored },
         { $inc: { "sizes.$.stock": quantity, "stock": quantity } },
         { session }
       );
     } else {
       await Product.updateOne({ _id: productId }, { $inc: { stock: quantity } }, { session });
     }
  }
}

module.exports = new ProductService();
