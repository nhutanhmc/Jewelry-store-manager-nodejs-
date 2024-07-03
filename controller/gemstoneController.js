const Gemstone = require("../model/gemstoneModel");
const ProcessingFee = require("../model/processingFeeModel");

class gemstoneController {
  getGemstonesList_Api(req, res, next) {
    try {
      Gemstone.find({}).populate('processingFeeId')
        .then((gemstones) => {
          if (gemstones.length > 0) {
            return res.status(200).json({ success: true, gemstones });
          } else {
            return res.status(200).json({ success: false, message: "Không có gemstone nào!" });
          }
        })
        .catch((err) => {
          return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
        });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  getGemstoneById_Api(req, res, next) {
    try {
      Gemstone.findById(req.params.id).populate('processingFeeId')
        .then((gemstone) => {
          if (gemstone) {
            return res.status(200).json({ success: true, gemstone });
          } else {
            return res.json({ success: false, message: "Gemstone không tồn tại!" });
          }
        })
        .catch((err) => {
          return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
        });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  createGemstone_Api(req, res, next) {
    try {
      const { name, size, processingFeeId, priceOfGem } = req.body;

      if (!name || name.trim() === "") {
        return res.json({ success: false, message: "Vui lòng nhập name để tạo mới" });
      }
      if (!size || size.trim() === "") {
        return res.json({ success: false, message: "Vui lòng nhập size để tạo mới" });
      }
      if (!processingFeeId) {
        return res.json({ success: false, message: "Vui lòng nhập processingFeeId để tạo mới" });
      }
      if (!priceOfGem || priceOfGem === "") {
        return res.json({ success: false, message: "Vui lòng nhập priceOfGem để tạo mới" });
      }

      ProcessingFee.findById(processingFeeId)
        .then((fee) => {
          if (!fee) {
            return res.json({ success: false, message: "processingFeeId không tồn tại!" });
          }

          Gemstone.findOne({ name: name.trim() })
            .then((gemstone) => {
              if (gemstone) {
                return res.json({ success: false, message: "Gemstone này đã tồn tại. Vui lòng nhập name khác!" });
              }
              Gemstone.create({ name: name.trim(), size: size.trim(), processingFeeId, priceOfGem })
                .then((result) => {
                  return res.status(201).json({ success: true, result });
                })
                .catch((err) => {
                  return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
                });
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

  deleteGemstoneById_Api(req, res, next) {
    try {
      Gemstone.findById(req.params.id)
        .then((gemstone) => {
          if (!gemstone) {
            return res.json({ success: false, message: "Gemstone không tồn tại!" });
          }
          Gemstone.deleteOne({ _id: req.params.id })
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

  updateGemstoneById_Api(req, res, next) {
    try {
      const { name, size, processingFeeId, priceOfGem } = req.body;

      if (!name || name.trim() === "") {
        return res.json({ success: false, message: "Vui lòng không để trống name!" });
      }
      if (!size || size.trim() === "") {
        return res.json({ success: false, message: "Vui lòng không để trống size!" });
      }
      if (!processingFeeId) {
        return res.json({ success: false, message: "Vui lòng không để trống processingFeeId!" });
      }
      if (!priceOfGem) {
        return res.json({ success: false, message: "Vui lòng không để trống priceOfGem!" });
      }

      ProcessingFee.findById(processingFeeId)
        .then((fee) => {
          if (!fee) {
            return res.json({ success: false, message: "processingFeeId không tồn tại!" });
          }

          Gemstone.findByIdAndUpdate(
            req.params.id,
            { name: name.trim(), size: size.trim(), processingFeeId, priceOfGem },
            { new: true }
          )
            .then((gemstone) => {
              if (!gemstone) {
                return res.json({ success: false, message: "Gemstone không tồn tại!" });
              }
              return res.json({ success: true, gemstone });
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
}

module.exports = new gemstoneController();
