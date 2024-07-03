// app.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");

const flash = require("connect-flash");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const cors = require("cors");
const createError = require("http-errors");

const swaggerSpec = require("./config/swaggerConfig");
const staffsRouter = require("./routes/staffsRouter");
const productTypeRouter = require("./routes/productTypeRouter");
const gemstoneRouter = require("./routes/gemstoneRouter");
const materialRouter = require("./routes/materialRouter");
const imageRouter = require("./routes/productRouter");
const categoryRouter = require("./routes/categoryRouter");
const customerRouter = require('./routes/customerRouter');
const paymentRouter = require('./routes/paymentRouter');
const storeRouter = require('./routes/storeRouter');
const orderRouter = require('./routes/orderRouter');
const orderDetailRouter = require('./routes/orderDetailRouter');
const processingFeeRouter = require('./routes/ProcessingFee');

const swaggerUi = require("swagger-ui-express");
const passport = require('./config/passportConfig');

const app = express();
app.use(cors());
const dotenv = require("dotenv");
dotenv.config();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

require("./config/passport")(passport);
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

const url = `${process.env.DATABASE_TYPE}${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_SERVER}/${process.env.DATABASE_NAME}`;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use("/staffsRouter", staffsRouter);
app.use("/producttype", productTypeRouter);
app.use("/gemstone", gemstoneRouter);
app.use("/material", materialRouter);
app.use("/products", imageRouter);
app.use("/category", categoryRouter);
app.use('/customers', customerRouter);
app.use('/payments', paymentRouter);
app.use('/stores', storeRouter);
app.use('/orders', orderRouter);
app.use('/orderDetails', orderDetailRouter);
app.use('/processingFee', processingFeeRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/errorPage", (req, res) => {
  res.render("error/index");
});


app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  req.flash("error", err.message);
  res.redirect("/errorPage");
});

module.exports = app;
