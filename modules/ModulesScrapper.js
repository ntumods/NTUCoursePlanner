const fetch = require("node-fetch");
const qs = require("querystring");
const fs = require("fs");
const cheerio = require("cheerio");
const titleize = require("titleize");

class ModulesScrapper {
    constructor() {
    }

    async fetchSchedule({ year, semester, plan_no }) {
        let options = {
            "r_search_type": "F",
            "boption": "Search",
            "acadsem": `${year};${semester}`,
            "r_subj_code": "",
            "staff_access": "false"
        };

        let res = await fetch("https://wish.wis.ntu.edu.sg/webexe/owa/AUS_SCHEDULE.main_display1", {
            method: "POST",
            body: qs.stringify(options),
            headers: { "user-agent": "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0" }
        });

        let scheduleDom = await res.text();
        let scheduleDomCleaned = scheduleDom.replace(`<HR SIZE=2>`, "<HR>");
        return scheduleDomCleaned;
    }

    async parseSchedule({ file = null, str = null }) {
        let classes = [];
        let data = null;
        if (file !== null) {
            data = fs.readFileSync("./data/schedule.html", "utf8");
        } else {
            data = str;
        }

        let lines = data.split("<HR>")
        lines.shift();
        lines.forEach(line => {
            let $ = cheerio.load(line);
            if ($("table").length < 1) return;
            let mod = {
                "info": {},
                "classes": []
            };

            $("table").each((tableIndex, tableElement) => {
                if (tableIndex === 0) {
                    return $(tableElement).find("tbody").children().each((trIndex, trElement) => {
                        switch (trIndex) {
                            case 0:
                                $(trElement).children().each((tdIndex, tdElement) => {
                                    switch (tdIndex) {
                                        case 0:
                                            mod["info"]["code"] = $(tdElement).text();
                                            break;
                                        case 1:
                                            mod["info"]["name"] = titleize($(tdElement).text());
                                            break;
                                        case 2:
                                            mod["info"]["au"] = $(tdElement).text().replace("AU", "").trim();
                                            break;
                                    }
                                })
                                break;
                            case 1:
                                $(trElement).children().each((tdIndex, tdElement) => {
                                    switch (tdIndex) {
                                        case 1:
                                            mod["info"]["remarks"] = $(tdElement).text();
                                            break;
                                    }
                                });
                                break;
                        }
                    });
                }

                $(tableElement).find("tbody").children().each((trIndex, trElement) => {
                    if (trIndex === 0) return;
                    let trChildren = $(trElement).children();
                    let childTime = $(trChildren[4]).text() || "";
                    let childTimeStart = "";
                    let childTimeEnd = "";

                    if (childTime !== null && childTime.length > 0) {
                        let childTimeSplit = childTime.split("-");
                        childTimeStart = childTimeSplit[0];
                        childTimeEnd = childTimeSplit[1];
                        childTime = this.countDuration({ start: parseInt(childTimeStart), end: parseInt(childTimeEnd) });
                    }

                    let remarks = $(trChildren[6]).text() ? this.cleanRemarks($(trChildren[6]).text()) : "";
                    mod["classes"].push({
                        "index": $(trChildren[0]).text(),
                        "type": titleize($(trChildren[1]).text()),
                        "group": $(trChildren[2]).text(),
                        "day": titleize($(trChildren[3]).text()),
                        "time": {
                            "start": childTimeStart,
                            "end": childTimeEnd,
                            "duration": childTime
                        },
                        "location": $(trChildren[5]).text(),
                        "remarks": remarks
                    })
                });

                classes.push(mod);
            });
        });

        return classes;
    }

    countDuration({ start, end }) {
        let hourStart = parseInt(start / 100);
        let hourEnd = parseInt(end / 100);
        let minuteStart = start % 100;
        let minuteEnd = end % 100;
        if (minuteEnd - minuteStart < 0) {
            return parseFloat(hourEnd - hourStart - 1) + parseFloat(minuteEnd - minuteStart + 60) / 60.0;
        }

        return parseFloat(hourEnd - hourStart) + parseFloat(minuteEnd - minuteStart) / 60.0;
    }

    cleanRemarks(remarks) {
        let rremarks = remarks.replace(/^(Teaching ).*?$/g, "");
        return rremarks
    }
}

module.exports = ModulesScrapper;