  const Category = require("../model/categoriesModel");

  class categoryController {
    
    async getCategoryList_Api(req, res, next) {
      try {
        const categories = await Category.find({});
        if (categories.length > 0) {
          return res.status(200).json({ success: true, categories });
        } else {
          return res.status(200).json({ success: false, message: "Không có category nào!" });
        }
      } catch (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
      }
    }

    async getCategoryById_Api(req, res, next) {
      try {
        const category = await Category.findById(req.params.id);
        if (category) {
          return res.status(200).json({ success: true, category });
        } else {
          return res.status(404).json({ success: false, message: "Category không tồn tại!" });
        }
      } catch (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
      }
    }

    async createCategory_Api(req, res, next) {
      try {
        let newName = req.body.name?.trim();
        let newDescription = req.body.description?.trim();
        if (!newName || newName === "") {
          return res.status(400).json({ success: false, message: "Vui lòng nhập name để tạo mới" });
        }
        if (!newDescription || newDescription === "") {
          return res.status(400).json({ success: false, message: "Vui lòng nhập description để tạo mới" });
        }
        const existingCategory = await Category.findOne({ name: newName });
        if (existingCategory) {
          return res.status(400).json({ success: false, message: "Category này đã tồn tại. Vui lòng nhập name khác!" });
        }
        const newCategory = await Category.create({ name: newName, description: newDescription });
        return res.status(201).json({ success: true, newCategory });
      } catch (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
      }
    }

    async deleteCategoryById_Api(req, res, next) {
      try {
        const category = await Category.findById(req.params.id);
        if (!category) {
          return res.status(404).json({ success: false, message: "Category không tồn tại!" });
        }
        const result = await Category.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 1) {
          return res.status(200).json({ success: true, message: "Xóa dữ liệu thành công!" });
        } else {
          return res.status(400).json({ success: false, message: "Không có dữ liệu nào được xóa!" });
        }
      } catch (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
      }
    }

    async updateCategoryById_Api(req, res, next) {
      try {
        let updateName = req.body.name?.trim();
        let updateDescription = req.body.description?.trim();
        if (!updateName) {
          return res.status(400).json({ success: false, message: "Vui lòng không để trống name!" });
        }
        if (!updateDescription) {
          return res.status(400).json({ success: false, message: "Vui lòng không để trống description!" });
        }
        const updatedCategory = await Category.findByIdAndUpdate(
          req.params.id,
          { name: updateName, description: updateDescription },
          { new: true }
        );
        if (!updatedCategory) {
          return res.status(404).json({ success: false, message: "Category không tồn tại!" });
        }
        return res.status(200).json({ success: true, updatedCategory });
      } catch (err) {
        return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
      }
    }
  }

  module.exports = new categoryController();
