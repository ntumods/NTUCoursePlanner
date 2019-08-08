const LocationScraper = require("../modules/LocationScraper");
const fs = require("fs");

(async() => {
    let l = new LocationScraper();
    fs.writeFileSync("./data/locations.json", JSON.stringify(await l.fetchLocations(), null, 2));
})();