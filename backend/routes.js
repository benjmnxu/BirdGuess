const mysql = require("mysql");
const config = require("./config.json");
const coll = require('./mongo');

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
});

connection.connect((err) => err && console.log(err));

const mongoPut = async function(req, res) {
    const user = req.params.user;
    const genus = req.params.genus;
    const region = req.params.region;
    f = await coll.find({user:user}).toArray()
    if (f.length == 0) {
        result = await coll.insertOne({user: user, genus: [genus], region: [region]});
    } else {
        result = await coll.updateOne({user: user}, {$addToSet: {region: region}}, {$addToSet: {genus: genus}});
    }
    res.json(result);
}

const mongoGet = async function(req, res) {
    const user = req.params.user;
    
    result = await coll.find({user: user}).toArray()
    console.log(result)
    if (result.length == 0) {
        res.json({"ERROR": "No such user"})
    } else {
        res.json(result)
    }
}
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
    SELECT scientificName, accessURI, country, id
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
const countryfact = async function (req, res) {
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

const birdCountriesFacts = async function(req, res) {
    /*
    Given a bird, return countries where bird has been recorded with associated facts
    */
    const bird = req.params.bird
    const keyFacts = req.params.key_facts
    const startYear = req.params.start_year
    const endYear = req.params.end_year
    connection.query(`
    WITH tmp1(country_name) AS (
        SELECT country
        FROM birdData
        WHERE scientificName = '${bird}'
    ),
        tmp2(country, indicator_code, year, value) AS (
            SELECT countryName, indicatorCode, year, value
            FROM worldBankData w JOIN tmp1 t ON w.countryName = t.country_name
        ),
        tmp3(country, indicator_code, indicator_name, value, year) AS (
            SELECT country, wi.indicatorCode, indicatorName, value, year
            FROM worldBankIndicators wi JOIN tmp2 t ON wi.indicatorCode = t.indicator_code
            AND indicatorName IN (${keyFacts})
        )
    SELECT DISTINCT *
    FROM tmp3
    WHERE ${startYear} <= year AND year <= ${endYear};
    `, (err, data) => {
        if (err || data.length == 0) {
            console.log(err)
            res.json({})
        } else {
            res.Array(data)
        }
    });
}

const otherCountries = async function(req, res) {
    const answer_country = req.params.country
    console.log(answer_country)
    connection.query(`
    SELECT DISTINCT country
    FROM birdData
    WHERE country != '${answer_country}'
    ORDER BY RAND()
    LIMIT 3
    `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err);
            res.json({});
        } else {
            
            res.json(data)
        }
      });
}

const birdsCloseByCoordinate = async function(req, res) {
    // Find the bird id the 5 closest birds to the id bird by coordinate
    const birdId = req.params.id
    connection.query(`
    WITH tmp1(longitude, latitude, country) AS (
        SELECT longitudeDecimal, latitudeDecimal, country
            FROM birdData
            WHERE id = '${birdId}' AND longitudeDecimal IS NOT NULL AND latitudeDecimal IS NOT NULL
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
    `, (err, data) => {
        if (err || data.length === 0) {
            console.log(err)
            res.json(data)
        } else {
            res.json(data)
        }
    })

}

module.exports = {
  newBird,
  birdAndFactsByRegion,
  otherCountries,
  randomCountryFact,
  diffGenus,
  randomBirdAndFact,
  genusToEnvCountry,
  birdsCloseByCoordinate,
  birdCountriesFacts,
  mongoGet,
  mongoPut
};

//Out of all countries the user has seen/guessed right, rank the countries by those with the most bird sounds
