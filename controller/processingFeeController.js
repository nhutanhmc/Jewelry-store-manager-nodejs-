const ProcessingFee = require("../model/processingFeeModel");

class processingFeeController {
  getProcessingFeesList_Api(req, res, next) {
    try {
      ProcessingFee.find({})
        .then((fees) => {
          if (fees.length > 0) {
            return res.status(200).json({ success: true, fees });
          } else {
            return res.status(200).json({ success: false, message: "Không có phí gia công nào!" });
          }
        })
        .catch((err) => {
          return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
        });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  getProcessingFeeById_Api(req, res, next) {
    try {
      ProcessingFee.findById(req.params.id)
        .then((fee) => {
          if (fee) {
            return res.status(200).json({ success: true, fee });
          } else {
            return res.json({ success: false, message: "Phí gia công không tồn tại!" });
          }
        })
        .catch((err) => {
          return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
        });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  createProcessingFee_Api(req, res, next) {
    try {
      const { name, feeRate } = req.body;

      if (!name || name.trim() === "") {
        return res.json({ success: false, message: "Vui lòng nhập name để tạo mới" });
      }
      if (!feeRate || feeRate === "") {
        return res.json({ success: false, message: "Vui lòng nhập feeRate để tạo mới" });
      }

      ProcessingFee.create({ name: name.trim(), feeRate })
        .then((result) => {
          return res.status(201).json({ success: true, result });
        })
        .catch((err) => {
          return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
        });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  deleteProcessingFeeById_Api(req, res, next) {
    try {
      ProcessingFee.findById(req.params.id)
        .then((fee) => {
          if (!fee) {
            return res.json({ success: false, message: "Phí gia công không tồn tại!" });
          }
          ProcessingFee.deleteOne({ _id: req.params.id })
            .then((result) => {
              if (result.deletedCount === 1) {
                return res.status(200).json({ success: true, message: "Xóa dữ liệu thành công!" });
              } else {
                return res.json({ success: false, message: "Không có dữ liệu nào được xóa!" });
              }
            })
            .catch((err) => {
              return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
            });
        })
        .catch((err) => {
          return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
        });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  updateProcessingFeeById_Api(req, res, next) {
    try {
      const { name, feeRate } = req.body;

      if (!name || name.trim() === "") {
        return res.json({ success: false, message: "Vui lòng không để trống name!" });
      }
      if (!feeRate) {
        return res.json({ success: false, message: "Vui lòng không để trống feeRate!" });
      }

      ProcessingFee.findByIdAndUpdate(
        req.params.id,
        { name: name.trim(), feeRate },
        { new: true }
      )
        .then((fee) => {
          if (!fee) {
            return res.json({ success: false, message: "Phí gia công không tồn tại!" });
          }
          return res.json({ success: true, fee });
        })
        .catch((err) => {
          return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
        });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }
}

module.exports = new processingFeeController();
