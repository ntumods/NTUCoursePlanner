const fetch = require("node-fetch");
const cheerio = require("cheerio");

class LocationScraper {
    constructor() {
        this.links = [
            {
                "name": "Lecture Theatres",
                "url": "http://maps.ntu.edu.sg/a/search?q=Lecture+Theatres&c=Lecture+Theatres"
            },
            {
                "name": "Libraries",
                "url": "http://maps.ntu.edu.sg/a/search?q=Libraries&c=Libraries"
            },
            {
                "name": "Examination Halls",
                "url": "http://maps.ntu.edu.sg/a/search?q=Examination+Halls&c=Examination+Halls"
            },
            {
                "name": "Tutorial Rooms",
                "url": "http://maps.ntu.edu.sg/a/search?q=Tutorial+Rooms&c=Tutorial+Rooms"
            },
            {
                "name": "Tutorial Rooms +",
                "url": "http://maps.ntu.edu.sg/a/search?q=Tutorial+Rooms+%2B&c=Tutorial+Rooms+%2B"
            },
            {
                "name": "Labs",
                "url": "http://maps.ntu.edu.sg/a/search?q=Laboratories&c=Laboratories&ll=1.344731%2C103.681473"
            }
        ]
    }

    async fetchLocations() {
        let locationsArray = [];
        for (let i = 0; i < this.links.length; i++) {
            let response = await fetch(this.links[i]["url"], {
                headers: { "user-agent": "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0" }
            });

            let responseText = await response.json();
            locationsArray.push({
                "name": this.links[i]["name"],
                "locations": responseText["what"]["markers"].map(loc => {
                    let $ = cheerio.load(loc["html"]);
                    return {
                        "name": loc["tooltip"],
                        "latlng": loc["latlng"],
                        "description": $("body > div > div:nth-child(2)").text()
                    }
                })
            });
        }

        return locationsArray;
    }
}

module.exports = LocationScraper;