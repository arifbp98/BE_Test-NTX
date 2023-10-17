const axios = require("axios");
const db = require("../models");
const WebSocket = require("ws");
const { createClient } = require("redis");
const client = createClient();

exports.refactoreMe1 = async (req, res) => {
  // function ini sebenarnya adalah hasil survey dri beberapa pertnayaan, yang mana nilai dri jawaban tsb akan di store pada array seperti yang ada di dataset
  try {
    const data = await db.sequelize.query(`SELECT * FROM "surveys"`);
    const indexes = Array.from({ length: 10 }, () => []);

    data[0].forEach((e) => {
      e.values.forEach((value, index) => {
        indexes[index].push(value);
      });
    });

    const totalIndex = indexes.map(
      (index) => index.reduce((a, b) => a + b, 0) / 10
    );

    res.status(200).json({
      statusCode: 200,
      success: true,
      data: totalIndex,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.refactoreMe2 = async (req, res) => {
  // function ini untuk menjalakan query sql insert dan mengupdate field "dosurvey" yang ada di table user menjadi true, jika melihat data yang di berikan, salah satu usernnya memiliki dosurvey dengan data false
  try {
    const { userId, values } = req.body;

    const result = await db.sequelize.query(
      `INSERT INTO "surveys" ("userId", "values", "createdAt", "updatedAt") VALUES (${userId}, '${values}', NOW(), 
      NOW())`
    );
    console.log(result);

    await db.sequelize.query(
      `UPDATE "users" SET dosurvey = true WHERE id = ${userId}`
    );

    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Survey sent successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.callmeWebSocket = (server) => {
  try {
    const fetchData = async (ws) => {
      const data = await axios.get(
        "https://livethreatmap.radware.com/api/map/attacks?limit=10"
      );
      const result = await data.data;
      ws.send(JSON.stringify(result));
      console.log(result);
    };

    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
      console.log("Client connected");

      fetchData(ws);
      const fetch3Minutes = setInterval(() => {
        fetchData(ws);
      }, 3 * 60 * 1000);

      ws.on("close", () => {
        console.log("Client disconnected");
        clearInterval(fetch3Minutes);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getData = async (req, res) => {
  try {
    await client.connect();

    const cached = await client.get("cachedData");

    if (cached) {
      const parsed = JSON.parse(cached);
      res.status(200).json(parsed);
    } else {
      const response = await axios.get(
        "https://livethreatmap.radware.com/api/map/attacks?limit=10"
      );
      const attacks = response.data[0];

      for (const attack of attacks) {
        await db.sequelize.query(
          `INSERT INTO "attacks" ("sourcecountry", "destinationcountry", "type") VALUES ('${attack.sourceCountry}', '${attack.destinationCountry}', '${attack.type}')`
        );
      }

      const data = await db.sequelize.query(
        "SELECT sourcecountry, destinationcountry, type, COUNT(*) AS total FROM attacks GROUP BY sourcecountry, destinationcountry, type ORDER BY sourcecountry"
      );

      const responseData = {
        success: true,
        statusCode: 200,
        data: {
          label: data[0].map(
            (row) =>
              `${row.sourcecountry}-${row.destinationcountry}-${row.type}`
          ),
          total: data[0].map((row) => parseInt(row.total)),
        },
      };

      client.setEx("cachedData", 600, JSON.stringify(responseData));

      res.status(200).json(responseData);
    }

    client.quit();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};
