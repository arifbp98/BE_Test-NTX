const express = require("express");
const router = express.Router();
const exampleController = require("../controllers/exampleController");

router.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.get("/data", exampleController.refactoreMe1);
router.post("/data", exampleController.refactoreMe2);
router.get("/attacks", exampleController.getData)

module.exports = router
