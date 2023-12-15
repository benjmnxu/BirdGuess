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

// START OF ROUND

// Given the previous birds and previous countries, return a new bird
const newBird = async function (req, res) {
  const prev_names =
    req.query.prevNames === undefined ? "" : req.query.prevNames;
  const prev_countries =
    req.query.prevCountries === undefined ? "" : req.query.prevCountries;
  connection.query(
    `
    SELECT vernacularName, genus, bS.scientificName, country, accessURI, id
    FROM birdData join birdGame.birdSpecies bS on bS.scientificName = birdData.scientificName
    WHERE bS.scientificName NOT IN ('${prev_names}')
      AND country NOT IN ('${prev_countries}')
    ORDER BY RAND()
    LIMIT 1
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

// Given a country, return 3 other random countries
const otherCountries = async function (req, res) {
  const country = req.params.country;
  connection.query(
    `
    SELECT DISTINCT country
    FROM birdData
    WHERE country != '${country}'
    ORDER BY RAND()
    LIMIT 3
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

// Given a country name, return a random associated fact for that country
const countryFact = async function (req, res) {
  const country = req.params.country;
  connection.query(
    `
    SELECT countryName, year, value, indicatorName
    FROM worldBankData wbd JOIN worldBankIndicators wbi ON wbd.indicatorCode = wbi.indicatorCode
    WHERE countryName = '${country}'
    ORDER BY RAND()
    LIMIT 1
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

// END OF ROUND

// Given a country, select a random bird from that country as well as a random indicator and its corresponding average value
const randomCountryBirdAndFact = async function (req, res) {
  const country = req.params.country;
  const bird = req.params.bird;
  connection.query(
    `
    WITH countryAverageIndicator AS (
      SELECT countryName, indicatorName, AVG(value) averageValue
      FROM worldBankData wbd JOIN worldBankIndicators wbi ON wbd.indicatorCode = wbi.indicatorCode
      WHERE countryName = '${country}'
      GROUP BY indicatorName
      ORDER BY RAND()
    ),
    birdNameCountry AS (
      SELECT vernacularName, country
      FROM birdData JOIN birdSpecies bS on bS.scientificName = birdData.scientificName
      WHERE country = '${country}' AND vernacularName <> '${bird}'
      ORDER BY RAND()
      LIMIT 1
    )
    SELECT vernacularName, indicatorName, averageValue
    FROM birdNameCountry bc JOIN countryAverageIndicator cAI ON bc.country = cAI.countryName
    LIMIT 1;
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

const birdToCountry = async function (req, res) {
  const bird = req.params.bird;
  connection.query(
    `
    WITH birdToCountry AS (
      SELECT DISTINCT vernacularName, country
      FROM birdData JOIN birdGame.birdSpecies bS on bS.scientificName = birdData.scientificName
      WHERE vernacularName = '${bird}'
    ),
    countryToAverageValue AS (
        SELECT countryName, AVG(value) averageValue
        FROM worldBankData JOIN worldBankIndicators ON worldBankData.indicatorCode = worldBankIndicators.indicatorCode
        WHERE topic = 'Environment: Biodiversity & protected areas'
        GROUP BY countryName
    ),
    birdToCountryToValue AS (
        SELECT vernacularName, country, RANK() OVER (PARTITION BY vernacularName ORDER BY averageValue DESC) AS rnk
        FROM birdToCountry JOIN countryToAverageValue on birdToCountry.country = countryToAverageValue.countryName
        ORDER BY vernacularName
    )
    SELECT vernacularName, country
    FROM birdToCountryToValue
    WHERE rnk = 1
    GROUP BY vernacularName;
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

const birdToYear = async function (req, res) {
  const bird = req.params.bird;
  connection.query(
    `
    WITH birdToYear AS (
      SELECT DISTINCT vernacularName, country
      FROM birdData JOIN birdGame.birdSpecies bS on bS.scientificName = birdData.scientificName
      WHERE vernacularName = '${bird}'
    ), countryBSTValue AS (
      SELECT countryName, year, SUM(value) totalMetric
      FROM worldBankData JOIN birdGame.worldBankIndicators wBI on wBI.indicatorCode = worldBankData.indicatorCode
      WHERE topic = 'Environment: Biodiversity & protected areas' and year <> 2018
      GROUP BY countryName, year
      ORDER BY countryName
    ), birdToTotalMetric AS (
      SELECT vernacularName, countryName, year, totalMetric
      FROM birdToYear JOIN countryBSTValue ON birdToYear.country = countryBSTValue.countryName
    ), birdToYearToMetric AS (
      SELECT vernacularName, year, SUM(totalMetric) totalMetricByYear, RANK() OVER (PARTITION BY vernacularName ORDER BY SUM(totalMetric) DESC) as rnk
      FROM birdToTotalMetric
      GROUP BY vernacularName, year
    )
    SELECT vernacularName, year, totalMetricByYear
    FROM birdToYearToMetric
    WHERE rnk = 1
    GROUP BY vernacularName
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

// Find the bird id the 5 closest birds to the id bird by coordinate
const birdsCloseByCoordinate = async function (req, res) {
  const id = req.params.id;
  connection.query(
    `
    WITH tmp1(longitude, latitude, country) AS (
      SELECT longitudeDecimal, latitudeDecimal, country
        FROM birdData
        WHERE id = '${id}' AND longitudeDecimal IS NOT NULL AND latitudeDecimal IS NOT NULL
    ),
      closeBirds(id, name, distance, country) AS (
        SELECT b.id, b.scientificName AS name, SQRT(POW((t.latitude - b.latitudeDecimal), 2) + POW((t.longitude - b.longitudeDecimal),2)) AS distance, b.country
        FROM birdData b JOIN tmp1 t ON b.country != t.country
      ),
      distinctBirds(id, name, distance, country) AS (
        SELECT id, name, distance, country
        FROM (SELECT id, name, distance, country, ROW_NUMBER() over (PARTITION BY country ORDER BY distance IS NULL, distance) AS rnk
          FROM closeBirds) AS t
        WHERE t.rnk = 1
      ),
      birds(id, name, distance, country) AS (
        SELECT DISTINCT *
        FROM distinctBirds
        ORDER BY distance IS NULL, distance
        LIMIT 5
      ),
      worldBankDataFiltered AS (
        SELECT value, countryName, indicatorCode
        FROM worldBankData
        WHERE indicatorCode IN ('EN.BIR.THRD.NO', 'EN.FSH.THRD.NO', 'EN.HPT.THRD.NO', 'EN.MAM.THRD.NO', 'ER.LND.PTLD.ZS',
                  'ER.MRN.PTMR.ZS', 'ER.PTD.TOTL.ZS')
      ),
      indicators(indicator, value, name, country) AS (
        SELECT indicatorCode, value, name, country
        FROM worldBankDataFiltered wfb JOIN birds b ON wfb.countryName = b.country
      )
      SELECT name, country, avg(value)
      FROM worldBankIndicators wi JOIN indicators i ON wi.indicatorCode = i.indicator
      GROUP BY country
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json(data);
      } else {
        res.json(data);
      }
    }
  );
};

// REVIEW

// Given a list of genus already seen by the player,
// list the genus name and the country with the max average value across metrics in the
// category of 'Environment: Biodiversity & protected areas' for that genus, order the results by genus name
const genusToCountry = async function (req, res) {
  const prevGenus = Array.isArray(req.params.prev_genus);
  connection.query(
    `
    WITH genusToCountry AS (
      SELECT DISTINCT genus, country
      FROM birdData
      JOIN birdSpecies bS ON bS.scientificName = birdData.scientificName
      WHERE genus IN ${prevGenus}
    ),
    countryToAverageValue AS (
        SELECT countryName, AVG(value) AS averageValue
        FROM worldBankData
        JOIN worldBankIndicators ON worldBankData.indicatorCode = worldBankIndicators.indicatorCode
        WHERE topic = 'Environment: Biodiversity & protected areas'
        GROUP BY countryName
    ),
    genusToCountryToValue AS (
        SELECT gtc.genus, gtc.country, cta.averageValue,
              RANK() OVER (PARTITION BY gtc.genus ORDER BY cta.averageValue DESC) AS rnk
        FROM genusToCountry gtc
        JOIN countryToAverageValue cta ON gtc.country = cta.countryName
        ORDER BY gtc.genus
    )
    SELECT genus, country
    FROM genusToCountryToValue
    WHERE rnk = 1
    GROUP BY genus;
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

// Given a list of genus we have seen, what year was the best for the bird?
const genusToYear = async function (req, res) {
  const prevGenus = Array.isArray(req.params.prev_genus);
  connection.query(
    `
    WITH genusToCountry AS (
      SELECT distinct (country) countryIn, genus
      FROM birdData JOIN birdSpecies bS on bS.scientificName = birdData.scientificName
      WHERE genus in ${prevGenus}
    ),
    countryBSTValue AS (
      SELECT countryName, year, SUM(value) totalMetric
      FROM worldBankData JOIN birdGame.worldBankIndicators wBI on wBI.indicatorCode = worldBankData.indicatorCode
      WHERE topic = 'Environment: Biodiversity & protected areas' and year <> 2018
      GROUP BY countryName, year
      ORDER BY countryName
    ),
    genusToTotalMetric AS (
      SELECT genus, countryName, year, totalMetric
      FROM genusToCountry JOIN countryBSTValue ON genusToCountry.countryIn = countryBSTValue.countryName
      ORDER BY genus
    ),
    genusToYearToMetric AS (
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
        console.log(err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

// Given a list of genus, find all genus that have yet to be found
const diffGenus = async function (req, res) {
  const prevGenus = Array.isArray(req.params.prev_genus);
  connection.query(
    `
    SELECT *
    FROM birdSpecies
    WHERE genus NOT IN ('${prevGenus}')
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

// Given a region and a set of indicators, find the most common birds recorded in each of the countries
// in that region as well as the associated indicator values (as specified)
const regionBirdsAndFacts = async function (req, res) {
  const region = req.query.region;
  const facts = Array.isArray(req.params.facts);
  connection.query(
    `
    WITH tmp1(country_name) AS (
      SELECT countryName
      FROM countryRegion
      WHERE region = '${region}'
    ),
    raw_birds(bird_name, country, bird_freq) AS (
      SELECT scientificName, b.country, COUNT(1) AS birdFreq
      FROM birdData b
      JOIN tmp1 t ON t.country_name = b.country AND b.scientificName != 'Mystery mystery'
      GROUP BY scientificName
    ),
    birds(bird_name, country, bird_freq, rnk) AS (
      SELECT bird_name, country, bird_freq, ROW_NUMBER() OVER (PARTITION BY country ORDER BY bird_freq DESC)
      FROM raw_birds
    ),
    tmp2(indicator_code, unitOfMeasure) AS (
      SELECT indicatorCode, unitOfMeasure
      FROM worldBankIndicators
      WHERE indicatorName IN ${facts}
    )
    SELECT
      bird_name,
      countryName,
      AVG(value) AS avg_value_across_years,
      indicatorCode,
      bird_freq
    FROM worldBankData w
    JOIN tmp1 t1 ON w.countryName = t1.country_name
    JOIN tmp2 t2 ON w.indicatorCode = t2.indicator_code
    JOIN birds b ON b.country = t1.country_name
    GROUP BY bird_name, countryName, indicatorCode, bird_freq;
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

// Given a list of regions, find all regions that have yet to be found
const diffRegion = async function (req, res) {
  const prevRegions = Array.isArray(req.params.prev_regions);
  connection.query(
    `
    SELECT region
    FROM countryRegion
    WHERE region NOT IN ('${prev_regions}')
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data[0]);
      }
    }
  );
};

module.exports = {
  newBird,
  otherCountries,
  countryFact,
  randomCountryBirdAndFact,
  birdToCountry,
  birdToYear,
  birdsCloseByCoordinate,
  genusToCountry,
  genusToYear,
  diffGenus,
  regionBirdsAndFacts,
  diffRegion,
};
