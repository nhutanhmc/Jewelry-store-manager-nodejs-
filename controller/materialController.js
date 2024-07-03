const Material = require("../model/materialModel");
const ProcessingFee = require("../model/processingFeeModel");

class materialController {
  getMaterialsList_Api(req, res, next) {
    try {
      Material.find({}).populate('processingFeeId')
        .then((materials) => {
          if (materials.length > 0) {
            return res.status(200).json({ success: true, materials });
          } else {
            return res.status(200).json({ success: false, message: "Không có material nào!" });
          }
        })
        .catch((err) => {
          return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
        });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  getMaterialById_Api(req, res, next) {
    try {
      Material.findById({ _id: req.params.id }).populate('processingFeeId')
        .then((material) => {
          if (material) {
            return res.status(200).json({ success: true, material });
          } else {
            return res.json({ success: false, message: "Material không tồn tại!" });
          }
        })
        .catch((err) => {
          return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
        });
    } catch (err) {
      return res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  createMaterial_Api(req, res, next) {
    try {
      let newName = req.body.name?.trim();
      let newProcessingFeeId = req.body.processingFeeId;
      let newPricePerGram = req.body.pricePerGram;

      if (!newName || newName === "") {
        return res.json({ success: false, message: "Vui lòng nhập name để tạo mới" });
      }
      if (!newProcessingFeeId) {
        return res.json({ success: false, message: "Vui lòng nhập processingFeeId để tạo mới" });
      }
      if (!newPricePerGram || newPricePerGram === "") {
        return res.json({ success: false, message: "Vui lòng nhập pricePerGram để tạo mới" });
      }

      ProcessingFee.findById(newProcessingFeeId)
        .then((fee) => {
          if (!fee) {
            return res.json({ success: false, message: "processingFeeId không tồn tại!" });
          }

          Material.findOne({ name: newName })
            .then((material) => {
              if (material) {
                return res.json({ success: false, message: "Material này đã tồn tại. Vui lòng nhập name khác!" });
              }
              Material.create({ name: newName, processingFeeId: newProcessingFeeId, pricePerGram: newPricePerGram })
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

  deleteMaterialById_Api(req, res, next) {
    try {
      Material.findById({ _id: req.params.id })
        .then((material) => {
          if (!material) {
            return res.json({ success: false, message: "Material không tồn tại!" });
          }
          Material.deleteOne({ _id: req.params.id })
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

  updateMaterialById_Api(req, res, next) {
    try {
      let updateName = req.body.name?.trim();
      let updateProcessingFeeId = req.body.processingFeeId;
      let updatePricePerGram = req.body.pricePerGram;

      if (!updateName) {
        return res.json({ success: false, message: "Vui lòng không để trống name!" });
      }
      if (!updateProcessingFeeId) {
        return res.json({ success: false, message: "Vui lòng không để trống processingFeeId!" });
      }
      if (!updatePricePerGram) {
        return res.json({ success: false, message: "Vui lòng không để trống pricePerGram!" });
      }

      ProcessingFee.findById(updateProcessingFeeId)
        .then((fee) => {
          if (!fee) {
            return res.json({ success: false, message: "processingFeeId không tồn tại!" });
          }

          Material.findByIdAndUpdate(
            req.params.id,
            { name: updateName, processingFeeId: updateProcessingFeeId, pricePerGram: updatePricePerGram },
            { new: true }
          )
            .then((material) => {
              if (!material) {
                return res.json({ success: false, message: "Material không tồn tại!" });
              }
              return res.json({ success: true, material });
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

module.exports = new materialController();
