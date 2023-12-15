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
  const countryName = req.params.countryName;
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

//given the previous birds and previous countries, generate a new bird
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

//given a region, a set of indicators, and a year, find the most common birds recorded in each of the countries
//in that region as well as the associated indicator values (as specified)
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

// Given a list of genus, find all genus that have yet to be found
const diffGenus = async function (req, res) {
  const prev_genus = Array.isArray(req.params.prev_genus);
  connection.query(
    `
    SELECT *
    FROM birdSpecies
    WHERE genus NOT IN ('${prev_genus}')
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log("this is the error" + err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

// Given a country, select a random bird from that country as well as a random indicator and its corresponding average value
const randomBirdAndFact = async function (req, res) {
  const countryName = req.params.countryName;
  connection.query(
    `
    WITH countryAverageIndicator AS (
      SELECT countryName, indicatorName, AVG(value) averageValue
      FROM worldBankData wbd JOIN worldBankIndicators wbi ON wbd.indicatorCode = wbi.indicatorCode
      WHERE countryName = ${countryName}
      GROUP BY indicatorName
      ORDER BY RAND()
  ),
  birdNameCountry AS (
      SELECT id, vernacularName, country
      FROM birdData JOIN birdSpecies bS on bS.scientificName = birdData.scientificName
      WHERE country = ${countryName}
      ORDER BY RAND()
      LIMIT 1
  )
  SELECT id, vernacularName, country, indicatorName, averageValue
  FROM birdNameCountry bc JOIN countryAverageIndicator cAI ON bc.country = cAI.countryName
  LIMIT 1;
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log("this is the error" + err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

// Given a list of genus already seen by the player,
// list the genus name and the country with the max average value across metrics in the
// category of 'Environment: Biodiversity & protected areas' for that genus. Order the results by genus name.
const genusToEnvCountry = async function (req, res) {
  const genusesSeen = Array.isArray(req.params.genusesSeen);
  connection.query(
    `
    WITH genusToCountry AS (
      SELECT distinct (country) countryIn, genus
      FROM birdData JOIN birdSpecies bS on bS.scientificName = birdData.scientificName
      WHERE genus in ${genusesSeen}
  
    ),
    countryToAverageValue AS (
        SELECT countryName, AVG(value) averageValue
        FROM worldBankData JOIN worldBankIndicators ON worldBankData.indicatorCode = worldBankIndicators.indicatorCode
        WHERE topic = 'Environment: Biodiversity & protected areas'
        GROUP BY countryName
    ),
    genusToCountryToValue AS (
        SELECT genus, genusToCountry.countryIn country, averageValue
        FROM genusToCountry JOIN countryToAverageValue on genusToCountry.countryIn = countryToAverageValue.countryName
        ORDER BY genus
    )
    SELECT genus, country, MAX(averageValue)
    FROM genusToCountryToValue
    GROUP BY genus;
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log("this is the error" + err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

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

const birdCountriesFacts = async function (req, res) {
  /*
    Given a bird, return countries where bird has been recorded with associated facts
    */
  const region = req.query.bird;
  const key_facts = req.params.key_facts;
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

// # For the bird genuses seen already,
// # record the year in which the countries they were in had the highest values summed values
// # for metrics under the Environment: Biodiversity & protected areas topic
const genusToYear = async function (req, res) {
  const genusesSeen = Array.isArray(req.params.genusesSeen);
  connection.query(
    `
    WITH genusToCountry AS (
      SELECT distinct (country) countryIn, genus
      FROM birdData JOIN birdSpecies bS on bS.scientificName = birdData.scientificName
      WHERE genus in ${genusesSeen}
  ), countryBSTValue AS (
      SELECT countryName, year, SUM(value) totalMetric
      FROM worldBankData JOIN birdGame.worldBankIndicators wBI on wBI.indicatorCode = worldBankData.indicatorCode
      WHERE topic = 'Environment: Biodiversity & protected areas' and year <> 2018
      GROUP BY countryName, year
      ORDER BY countryName
  ), genusToTotalMetric AS (
      SELECT genus, countryName, year, totalMetric
      FROM genusToCountry JOIN countryBSTValue ON genusToCountry.countryIn = countryBSTValue.countryName
      ORDER BY genus
  ), genusToYearToMetric AS (
      SELECT genus, year, SUM(totalMetric) totalMetricByYear, RANK() OVER (PARTITION BY genus ORDER BY SUM(totalMetric) DESC) as rnk
      FROM genusToTotalMetric
      GROUP BY genus, year
      ORDER BY genus
  )
  SELECT genus, year, totalMetricByYear
  FROM genusToYearToMetric
  WHERE rnk = 1;
  `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log("this is the error" + err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

module.exports = {
  newBird,
  birdAndFactsByRegion,
  otherCountries,
  randomCountryFact,
  diffGenus,
  randomBirdAndFact,
  genusToEnvCountry,
  genusToYear,
};

//Out of all countries the user has seen/guessed right, rank the countries by those with the most bird sounds
