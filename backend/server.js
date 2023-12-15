const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get("/newbird", routes.newBird);
app.get("/othercountries/:country", routes.otherCountries);
app.get("/countryfact/:countryName", routes.countryFact);
app.get("/birdandfactsbyregion", routes.birdAndFactsByRegion);
app.get("/birdcountriesfacts", routes.birdCountriesFacts);
app.get("/genusToEnvCountry", routes.genusToCountry);
app.get("/genusToYear", routes.genusToYear);
app.get("/diffGenus", routes.diffGenus);

app.listen(config.server_port, () => {
  console.log(
    `Server running at http://${config.server_host}:${config.server_port}/`
  );
});

module.exports = app;
