const mysql = require("mysql");
const config = require("./config.json");

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
});

connection.connect((err) => err && console.log(err));

// Route 3: GET /countryfact/:countryName
const birdcountryfact = async function (req, res) {
  // Given a country name, return a random associated fact for that country
  const song_id = req.params.bird;
  connection.query(
    `
    SELECT wbd.indicatorCode, countryName, year, value, indicatorName
    FROM worldBankData wbd JOIN worldBankIndicators wbi ON wbd.indicatorCode = wbi.indicatorCode
    WHERE countryName = '${countryName}'
    ORDER BY RAND()
    LIMIT 1
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log("I am actually here");
        console.log("this is the error" + err);
        res.json({});
      } else {
        console.log("I am here");
        res.json(data[0]);
      }
    }
  );
};

//Out of all countries the user has seen/guessed right, rank the countries by those with the most bird sounds
