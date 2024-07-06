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
  
}

module.exports = new staffController();
