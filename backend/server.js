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
app.get("/countryfact/:country", routes.countryFact);
app.get(
  "/randomcountrybirdandfact/:country/:bird",
  routes.randomCountryBirdAndFact
);
app.get("/birdtocountry/:bird", routes.birdToCountry);
app.get("/birdtoyear/:bird", routes.birdToYear);
app.get("/birdsclosebycoordinate/:id", routes.birdsCloseByCoordinate);
app.get("/genustocountry", routes.genusToCountry);
app.get("/genustoyear", routes.genusToYear);
app.get("/diffgenus", routes.diffGenus);
app.get("/regionbirdsandfacts", routes.regionBirdsAndFacts);
app.get("/diffregion", routes.diffRegion);

app.listen(config.server_port, () => {
  console.log(
    `Server running at http://${config.server_host}:${config.server_port}/`
  );
});

module.exports = app;
