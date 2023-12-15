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
const randomCountryFact = async function (req, res) {
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

const newBird = async function (req, res) {
  const prev_names =
    req.query.prevNames === undefined ? "" : req.query.prevNames;
  const prev_countries =
    req.query.prevCountries === undefined ? "" : req.query.prevCountries;
  const random_offset = Math.floor(Math.random() * 697610);
  connection.query(
    `
    SELECT scientificName, accessURI
    FROM birdData
    WHERE scientificName NOT IN ('${prev_names}')
        AND country NOT IN ('${prev_countries}')
    ORDER BY RAND()
    LIMIT 1
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

const birdAndFactsByRegion = async function (req, res) {
  const region = req.query.region;
  const key_facts = tuple(req.params.key_facts);
  const year = req.params.year;
  connection.query(
    `
    WITH tmp1(country_name) AS (
        SELECT countryName
        FROM countryRegion
        WHERE region = '${region}'
    ),
        raw_birds(bird_name, country, bird_freq) AS (
          SELECT scientificName, b.country, COUNT(1) as birdFreq
          FROM birdData b JOIN tmp1 t ON t.country_name = b.country AND b.scientificName != 'Mystery mystery'
          GROUP BY scientificName
        ),
        birds(bird_name, country, bird_freq, rnk) AS (
            SELECT bird_name, country, bird_freq, ROW_NUMBER() over (PARTITION BY country order by bird_freq DESC)
            FROM raw_birds
        ),
        tmp2(indicator_code, unitOfMeasure) AS (
            SELECT indicatorCode, unitOfMeasure
            FROM worldBankIndicators
            WHERE indicatorName IN ${key_facts}
        )
    SELECT bird_name, countryName, value, indicatorCode, bird_freq, rnk
    FROM worldBankData w
        JOIN tmp1 t1 ON w.countryName = t1.country_name
        JOIN tmp2 t2 ON w.indicatorCode = t2.indicator_code
        JOIN birds b ON b.country = t1.country_name
    WHERE year = ${year} AND rnk = 1
    `,
    (err, data) => {
      if (err || data.length == 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

//Given a genus, return species, location, and number of times
const getSpeciesLocation = async function (req, res) {
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

module.exports = {
  newBird,
  birdAndFactsByRegion,
  randomCountryFact,
};

//Out of all countries the user has seen/guessed right, rank the countries by those with the most bird sounds
