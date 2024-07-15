const cloudinary = require("../config/cloudinaryConfig");
const Product = require('../model/productModel');
const Material = require('../model/materialModel');
const Gemstone = require('../model/gemstoneModel');
const ProcessingFee = require('../model/processingFeeModel');
const ProductType = require('../model/productTypeModel');
const Image = require('../model/imageModel');

class ProductController {
    async uploadImage_Api(req, res) {
        try {
            const { name, size, weight, description, color, materialID, gemstoneID, productTypeID, quantity, materialWeight } = req.body;

            // Kiểm tra các ID liên quan
            const material = await Material.findById(materialID);
            if (!material) {
                return res.status(400).json({
                    success: false,
                    message: "Material không tồn tại!"
                });
            }

            const gemstone = await Gemstone.findById(gemstoneID);
            if (!gemstone) {
                return res.status(400).json({
                    success: false,
                    message: "Gemstone không tồn tại!"
                });
            }

            if (!await ProductType.findById(productTypeID)) {
                return res.status(400).json({
                    success: false,
                    message: "ProductType không tồn tại!"
                });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No files uploaded"
                });
            }

            // Tính toán giá gốc của sản phẩm
            const materialFee = await ProcessingFee.findById(material.processingFeeId);
            const gemstoneFee = await ProcessingFee.findById(gemstone.processingFeeId);
            const basePrice = (gemstone.priceOfGem * (1 + gemstoneFee.feeRate)) + ((material.pricePerGram * materialWeight) * (1 + materialFee.feeRate));

            // Tính toán giá cuối cùng và tiền lời
            let price;
            let profit;
            if (basePrice < 5000000) {
                price = basePrice * 1.2;
            } else if (basePrice >= 5000000 && basePrice < 20000000) {
                price = basePrice * 1.35;
            } else {
                price = basePrice * 1.45;
            }
            profit = price - basePrice;

            // Create new product
            const newProduct = await Product.create({
                name, size, weight, description, basePrice, price, profit, color, materialID, gemstoneID, productTypeID, quantity, materialWeight
            });

            // Upload images to Cloudinary and save references
            const imageLinks = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                const newImage = await Image.create({ productID: newProduct._id, imageLink: result.secure_url });
                imageLinks.push(newImage._id);
            }

            // Update product with image links
            newProduct.imageIDs = imageLinks;
            await newProduct.save();

            return res.status(201).json({
                success: true,
                message: "Product created successfully",
                product: newProduct
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: err.message || "Unknown error"
            });
        }
    }

    async getAllProduct_Api(req, res) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : null;
            const sl = req.query.sl ? parseInt(req.query.sl) : null;
            const searchQuery = req.query.search || '';
    
            let searchCondition = {};
            if (searchQuery) {
                const searchTerms = searchQuery.split(' ').filter(term => term.trim() !== '');
                searchCondition = {
                    name: { $all: searchTerms.map(term => new RegExp(term, 'i')) }
                };
            }
    
            const sortOrder = req.query.sort === 'asc' ? 1 : req.query.sort === 'desc' ? -1 : null;
            const sortCondition = sortOrder ? { price: sortOrder } : {};
    
            const totalProducts = await Product.countDocuments(searchCondition);
    
            let products;
            if (page !== null && sl !== null) {
                const skip = (page - 1) * sl;
                products = await Product.find(searchCondition)
                    .populate('materialID')
                    .populate('gemstoneID')
                    .populate({
                        path: 'productTypeID',
                        populate: {
                            path: 'categoryID'
                        }
                    })
                    .populate('imageIDs')
                    .skip(skip)
                    .limit(sl)
                    .sort(sortCondition);
            } else {
                products = await Product.find(searchCondition)
                    .populate('materialID')
                    .populate('gemstoneID')
                    .populate({
                        path: 'productTypeID',
                        populate: {
                            path: 'categoryID'
                        }
                    })
                    .populate('imageIDs')
                    .sort(sortCondition);
            }
    
            return res.status(200).json({
                success: true,
                totalFetched: products.length,
                totalProducts,
                products
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: err.message || "Unknown error"
            });
        }
    }

    async deleteProduct_Api(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product không tồn tại!"
                });
            }

            await Product.deleteOne({ _id: req.params.id });

            return res.status(200).json({
                success: true,
                message: "Product deleted successfully"
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: err.message || "Unknown error"
            });
        }
    }

    async updateProduct_Api(req, res) {
        try {
            const { name, size, weight, description, color, materialID, gemstoneID, productTypeID, quantity, materialWeight } = req.body;
            
            // Validate material ID if provided
            if (materialID) {
                const material = await Material.findById(materialID);
                if (!material) {
                    return res.status(400).json({
                        success: false,
                        message: "Material không tồn tại!"
                    });
                }
            }
            
            // Validate gemstone ID if provided
            if (gemstoneID) {
                const gemstone = await Gemstone.findById(gemstoneID);
                if (!gemstone) {
                    return res.status(400).json({
                        success: false,
                        message: "Gemstone không tồn tại!"
                    });
                }
            }
            
            // Validate product type ID if provided
            if (productTypeID && !await ProductType.findById(productTypeID)) {
                return res.status(400).json({
                    success: false,
                    message: "ProductType không tồn tại!"
                });
            }
            
            // Calculate base price, final price, and profit
            const material = materialID ? await Material.findById(materialID) : await Material.findById(req.body.materialID);
            const gemstone = gemstoneID ? await Gemstone.findById(gemstoneID) : await Gemstone.findById(req.body.gemstoneID);
            const materialFee = await ProcessingFee.findById(material.processingFeeId);
            const gemstoneFee = await ProcessingFee.findById(gemstone.processingFeeId);
            const basePrice = (gemstone.priceOfGem * (1 + gemstoneFee.feeRate)) + ((material.pricePerGram * materialWeight) * (1 + materialFee.feeRate));
            
            let price;
            let profit;
            if (basePrice < 5000000) {
                price = basePrice * 1.2;
            } else if (basePrice >= 5000000 && basePrice < 20000000) {
                price = basePrice * 1.35;
            } else {
                price = basePrice * 1.45;
            }
            profit = price - basePrice;
            
            // Update product
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    name, size, weight, description, basePrice, price, profit, color, materialID, gemstoneID, productTypeID, quantity, materialWeight
                },
                { new: true }
            ).populate('materialID').populate('gemstoneID').populate('productTypeID').populate({
                path: 'productTypeID',
                populate: {
                    path: 'categoryID'
                }
            });
            
            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product không tồn tại!"
                });
            }
            
            return res.status(200).json({
                success: true,
                message: "Product updated successfully",
                product: updatedProduct
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: err.message || "Unknown error"
            });
        }
    }

    async getByID_Api(req, res) {
        try {
            const product = await Product.findById(req.params.id)
                .populate('materialID')
                .populate('gemstoneID')
                .populate({
                    path: 'productTypeID',
                    populate: {
                        path: 'categoryID'
                    }
                })
                .populate('imageIDs');
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product không tồn tại!"
                });
            }
            
            return res.status(200).json({
                success: true,
                product
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: err.message || "Unknown error"
            });
        }
    }

    async updateProductImages_Api(req, res) {
        try {
            const { id } = req.params;
    
            // Find product
            const product = await Product.findById(id).populate('imageIDs');
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product không tồn tại!"
                });
            }
    
            // Delete old images from Cloudinary and database
            for (const image of product.imageIDs) {
                await cloudinary.uploader.destroy(image.imageLink.split('/').pop().split('.')[0]);
                await Image.findByIdAndDelete(image._id);
            }
    
            // Upload new images to Cloudinary and save references
            const imageLinks = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                const newImage = await Image.create({ productID: product._id, imageLink: result.secure_url });
                imageLinks.push(newImage._id);
            }
    
            // Update product with new image links
            product.imageIDs = imageLinks;
            await product.save();
    
            return res.status(200).json({
                success: true,
                message: "Product images updated successfully",
                product
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: err.message || "Unknown error"
            });
        }
    }
    

}

module.exports = new ProductController();
