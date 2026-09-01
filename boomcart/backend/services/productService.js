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

  async validateAndDecrementStock(productId, sizeRequested, quantity) {
    // 1. If size is requested, decrement that specific size's stock
    if (sizeRequested) {
      const product = await Product.findOne({
        _id: productId,
        "sizes": { $elemMatch: { size: sizeRequested, stock: { $gte: quantity } } }
      });
      
      if (!product) {
        throw new Error(`Size ${sizeRequested} is Out of Stock or product missing`);
      }

      await Product.updateOne(
        { _id: productId, "sizes.size": sizeRequested },
        { 
          $inc: { 
            "sizes.$.stock": -quantity,
            "stock": -quantity // Also decrement overall total stock tally
          } 
        }
      );
    } else {
      // 2. Generic product with no specific size
      const product = await Product.findOne({ _id: productId, stock: { $gte: quantity } });
      if (!product) throw new Error("Product Out of Stock");
      
      await Product.updateOne({ _id: productId }, { $inc: { stock: -quantity } });
    }
  }

  async restoreStock(productId, sizeRestored, quantity) {
     if (sizeRestored) {
       await Product.updateOne(
         { _id: productId, "sizes.size": sizeRestored },
         { $inc: { "sizes.$.stock": quantity, "stock": quantity } }
       );
     } else {
       await Product.updateOne({ _id: productId }, { $inc: { stock: quantity } });
     }
  }
}

module.exports = new ProductService();
