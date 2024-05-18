const Gemstone = require("../model/gemstoneModel");

class gemstoneController {
  getGemstonesList_Api(req, res, next) {
    try {
      return new Promise((resolve, reject) => {
        Gemstone.find({}).then((gemstones) => {
          if (gemstones.length > 0) {
            return resolve(res.status(200).json(gemstones));
          } else {
            return resolve(res.status(200).json("Không có gemstone nào!"));
          }
        });
      }).catch((err) => {
        return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
      });
    } catch (err) {
      return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
    }
  }

  getGemstoneById_Api(req, res, next) {
    try {
      Gemstone.findById({ _id: req.params.id })
        .then((gemstone) => {
          if (gemstone) {
            return res.status(200).json(gemstone);
          } else {
            return res.json("Gemstone không tồn tại!");
          }
        })
        .catch((err) => {
          return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
        });
    } catch (err) {
      return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
    }
  }

  createGemstone_Api(req, res, next) {
    try {
      let newName = req.body.name?.trim();
      let newWeight = req.body.weight;
      let newSize = req.body.size?.trim();
      if (!newName || newName === "") {
        return res.json("Vui lòng nhập name để tạo mới");
      }
      if (!newWeight || newWeight === "") {
        return res.json("Vui lòng nhập weight để tạo mới");
      }
      if (!newSize || newSize === "") {
        return res.json("Vui lòng nhập size để tạo mới");
      }
      Gemstone.findOne({ name: newName })
        .then((gemstones) => {
          if (gemstones) {
            return res.json("Gemstone này đã tồn tại. Vui lòng nhập name khác!");
          }
          Gemstone.create({ name: newName, weight: newWeight, size: newSize })
            .then((result) => {
              return res.status(201).json(result);
            })
            .catch((err) => {
              return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
            });
        })
        .catch((err) => {
          return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
        });
    } catch (err) {
      return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
    }
  }

  deleteGemstoneById_Api(req, res, next) {
    try {
      Gemstone.findById({ _id: req.params.id })
        .then((gemstones) => {
          if (!gemstones) {
            return res.json("Gemstone không tồn tại!");
          }
          Gemstone.deleteOne({ _id: req.params.id })
            .then((result) => {
              if (result.deletedCount === 1) {
                return res.status(200).json("Xóa dữ liệu thành công!");
              } else {
                return res.json("Không có dữ liệu nào được xóa!");
              }
            })
            .catch((err) => {
              return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
            });
        })
        .catch((err) => {
          return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
        });
    } catch (err) {
      return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
    }
  }
  updateGemstoneById_Api(req, res, next) {
    try {
      let updateName = req.body.name?.trim();
      let updateWeight = req.body.weight;
      let updateSize = req.body.size?.trim();
      if (!updateName) {
        return res.json("Vui lòng không để trống name!");
      }
      if (!updateWeight) {
        return res.json("Vui lòng không để trống weight!");
      }
      if (!updateSize) {
        return res.json("Vui lòng không để trống size!");
      }
      Gemstone.findByIdAndUpdate(req.params.id, { name: updateName, weight: updateWeight, size: updateSize }, { new: true })
        .then((gemstone) => {
          if (!gemstone) {
            return res.json("Gemstone không tồn tại!");
          }
          return res.json(gemstone);
        })
        .catch((err) => {
          return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
        });
    } catch (err) {
      return res.status(err.status || 500).json(err.message || "Lỗi chưa xác định!");
    }
  }
}
module.exports = new gemstoneController();