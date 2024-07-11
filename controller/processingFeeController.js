const ProcessingFee = require("../model/processingFeeModel");

class processingFeeController {
  async getProcessingFeesList_Api(req, res, next) {
    try {
      const fees = await ProcessingFee.find({});
      if (fees.length > 0) {
        return res.status(200).json({ success: true, fees });
      } else {
        return res.status(200).json({ success: false, message: "Không có phí gia công nào!" });
      }
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  async getProcessingFeeById_Api(req, res, next) {
    try {
      const fee = await ProcessingFee.findById(req.params.id);
      if (fee) {
        return res.status(200).json({ success: true, fee });
      } else {
        return res.json({ success: false, message: "Phí gia công không tồn tại!" });
      }
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  async createProcessingFee_Api(req, res, next) {
    try {
      const { name, feeRate } = req.body;

      if (!name || name.trim() === "") {
        return res.json({ success: false, message: "Vui lòng nhập name để tạo mới" });
      }
      if (!feeRate || feeRate === "") {
        return res.json({ success: false, message: "Vui lòng nhập feeRate để tạo mới" });
      }

      // Kiểm tra xem tên phí gia công đã tồn tại hay chưa
      const existingFee = await ProcessingFee.findOne({ name });
      if (existingFee) {
        return res.status(400).json({ success: false, message: 'Tên phí gia công đã tồn tại' });
      }

      const result = await ProcessingFee.create({ name: name.trim(), feeRate });
      return res.status(201).json({ success: true, result });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  async deleteProcessingFeeById_Api(req, res, next) {
    try {
      const fee = await ProcessingFee.findById(req.params.id);
      if (!fee) {
        return res.json({ success: false, message: "Phí gia công không tồn tại!" });
      }
      const result = await ProcessingFee.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 1) {
        return res.status(200).json({ success: true, message: "Xóa dữ liệu thành công!" });
      } else {
        return res.json({ success: false, message: "Không có dữ liệu nào được xóa!" });
      }
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  async updateProcessingFeeById_Api(req, res, next) {
    try {
      const { name, feeRate } = req.body;

      if (!name || name.trim() === "") {
        return res.json({ success: false, message: "Vui lòng không để trống name!" });
      }
      if (!feeRate) {
        return res.json({ success: false, message: "Vui lòng không để trống feeRate!" });
      }

      const fee = await ProcessingFee.findByIdAndUpdate(
        req.params.id,
        { name: name.trim(), feeRate },
        { new: true }
      );
      if (!fee) {
        return res.json({ success: false, message: "Phí gia công không tồn tại!" });
      }
      return res.json({ success: true, fee });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }
}

module.exports = new processingFeeController();
