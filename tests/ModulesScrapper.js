const ModulesScraper = require("../modules/ModulesScrapper")
const ExamScrapper = require("../modules/ExamScrapper");
const fs = require("fs");

let m = new ModulesScraper();
let e = new ExamScrapper();

(async () => {
    let schedule = await m.fetchSchedule({ year: 2019, semester: 1 });
    let parsedSchedule = await m.parseSchedule({ str: schedule });
    fs.writeFileSync("./data/schedule.json", JSON.stringify(parsedSchedule, null, 2));
    // await e.fetchSchedule({ year: 2019, semester: 1, plan_no: 101 })
})();
