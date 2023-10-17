const db = require("../models");
// const model = db.model;
const jwt = require("jsonwebtoken");
const secretKey = "dummysecretkey"

function readToken(token) {
  return jwt.verify(token, secretKey);
}

exports.authentication = async (req, res, next) => {
  // Middleware untuk membatasi API, harus menggunakan token
  try {
    const { authorization } = req.headers;
    const accessToken = authorization.split(" ")[1];
    const token = readToken(accessToken);
    const user = await db.users.findOne({ where: { id: token.id } });
    if (!user) {
      res.status(401).json({message: "Unauthorized"})
    }
    req.user = { role: user.role }
  } catch (error) {
    next(error);
  }
}

exports.authUser = async (req, res, next) => {
  // Middleware untuk membatasi user berdasarkan role, contoh: admin
  try {
    if (req.user.role !== "admin") {
      res.status(401).json({message: "Unauthorized"})
    }
    next();
  } catch (error) {
    next(error);
  }
};

