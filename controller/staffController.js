const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Staff = require("../model/staffModel");

class staffController {
  constructor() {
    this.generateTokens = this.generateTokens.bind(this);
    this.loginWithJWT = this.loginWithJWT.bind(this);
    this.googleAuthCallback = this.googleAuthCallback.bind(this);
    this.refreshAccessToken = this.refreshAccessToken.bind(this);
    this.getUserById = this.getUserById.bind(this); // Thêm hàm này
  }

  generateTokens(user) {
    const payload = { userId: user._id, role: user.role };
    const accessToken = jwt.sign(payload, "SE161473", { expiresIn: "1d" });
    const refreshToken = jwt.sign(payload, "SE161473_REFRESH", { expiresIn: "7d" });
    return { accessToken, refreshToken };
  }

  async loginWithJWT(req, res, next) {
    try {
      let { username, password } = req.body;
      if (!username || !password) {
        return res.json({ success: false, message: "Vui lòng nhập đủ thông tin đăng nhập!" });
      }
      const user = await Staff.findOne({ username: username });
      if (!user) {
        return res.json({ success: false, message: "Username không tồn tại" });
      }
      const result = await bcrypt.compare(password, user.password);
      if (!result) {
        return res.json({ success: false, message: "Sai mật khẩu!" });
      }
      // Xoá access token cũ
      res.clearCookie("token");
      const { accessToken, refreshToken } = this.generateTokens(user);
      res.cookie("token", accessToken);
      return res.json({ success: true, message: "Đăng nhập thành công!", accessToken, refreshToken, role: user.role });
    } catch (err) {
      return res.json({ success: false, message: err.message || "Lỗi" });
    }
  }

  async googleAuthCallback(req, res) {
    try {
      const user = req.user;
      // Xoá access token cũ
      res.clearCookie("token");
      const { accessToken, refreshToken } = this.generateTokens(user);
      const frontendURL = process.env.NODE_ENV === 'production'
        ? 'http://localhost:3000/authGoogle'
        : 'http://localhost:3000/authGoogle'; // URL của frontend

      // Chuyển hướng người dùng trở lại frontend với token qua query
      res.redirect(`${frontendURL}?accessToken=${accessToken}&refreshToken=${refreshToken}&role=${user.role}&name=${user.name}`);
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Lỗi xử lý xác thực Google' });
    }
  }

  async refreshAccessToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Vui lòng cung cấp refresh token!" });
      }
      jwt.verify(refreshToken, "SE161473_REFRESH", (err, user) => {
        if (err) {
          return res.status(403).json({ success: false, message: "Refresh token không hợp lệ!" });
        }
        // Xoá access token cũ
        res.clearCookie("token");
        const { accessToken } = this.generateTokens(user);
        res.cookie("token", accessToken);
        return res.json({ success: true, accessToken });
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Lỗi" });
    }
  }

  async signUp(req, res, next) {
    try {
      let { username, password, name, age, role } = req.body;
  
      if (!username || !password || !name || !role) {
        return res.json({ success: false, message: "Vui lòng nhập đủ thông tin đăng ký!" });
      }
    
      const existingUser = await Staff.findOne({ username });
      if (existingUser) {
        return res.json({ success: false, message: "Username đã tồn tại. Vui lòng chọn username khác!" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await Staff.create({
        username,
        password: hashedPassword,
        name,
        age,
        role
      });

      return res.status(201).json({ success: true, message: "Đăng ký thành công!", user: newUser });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await Staff.find({});
      return res.status(200).json({ success: true, users: users });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await Staff.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User không tồn tại!" });
      }
      return res.status(200).json({ success: true, user });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Lỗi chưa xác định!" });
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params; // Lấy id của user cần cập nhật từ URL params
      const { username, password, name, age, role } = req.body; // Dữ liệu mới từ request body
  
      // Thêm log để kiểm tra các giá trị đầu vào
      console.log("Received data:", { id, username, password, name, age, role });
  
      // Kiểm tra dữ liệu đầu vào
      if (!username || !name || !role) {
        console.log("Missing required fields");
        return res.json({ success: false, message: "Vui lòng nhập đủ thông tin cập nhật!" });
      }
  
      // Tạo đối tượng cập nhật
      const updateData = {
        username,
        name,
        age,
        role
      };
  
      // Hash lại password nếu có thay đổi
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
  
      // Thêm log để kiểm tra đối tượng cập nhật
      console.log("Update data:", updateData);
  
      // Tìm và cập nhật user trong database
      const updatedUser = await Staff.findByIdAndUpdate(id, updateData, { new: true }); // Trả về user đã được cập nhật
  
      if (!updatedUser) {
        console.log("User not found");
        return res.json({ success: false, message: "Không tìm thấy user để cập nhật!" });
      }
  
      console.log("Update successful:", updatedUser);
      return res.json({ success: true, message: "Cập nhật thành công!", user: updatedUser });
    } catch (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ success: false, message: err.message || "Lỗi cập nhật user!" });
    }
  }
  

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params; // Lấy id của user cần xoá từ URL params
  
      // Xoá user từ database
      const deletedUser = await Staff.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.json({ success: false, message: "Không tìm thấy user để xoá!" });
      }
  
      return res.json({ success: true, message: "Xoá user thành công!", user: deletedUser });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Lỗi xoá user!" });
    }
  }
}

module.exports = new staffController();
