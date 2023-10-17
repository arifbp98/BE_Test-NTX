const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const routes = require("./app/routes/exampleRoutes");
const controllers = require("./app/controllers/exampleController")
const PORT = process.env.PORT || 7878;

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require("./app/models");

db.sequelize.sync();

// never enable the code below in production
// force: true will drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and Resync Database with { force: true }");
//   // initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});

// routes
app.use("/api", routes);

// set port, listen for requests
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

controllers.callmeWebSocket(server)

module.exports = app