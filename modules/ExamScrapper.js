const fetch = require("node-fetch");
const qs = require("querystring");
const fs = require("fs");
const cheerio = require("cheerio");
const titleize = require("titleize");

class ExamScrapper {
    constructor() {

    }

    async fetchSchedule({ year, semester, plan_no }) {
        let options = {
            "p_exam_dt": "",
            "p_start_time": "",
            "p_dept": "",
            "p_subj": "",
            "p_venue": "",
            "p_matric": "",
            "academic_session": `Semester ${semester} Academic Year ${year}-${year + 1}`,
            "p_plan_no": plan_no,
            "p_exam_yr": year,
            "p_semester": semester,
            "bOption": "Next"
        };

        let res = await fetch("https://wis.ntu.edu.sg/webexe/owa/exam_timetable_und.Get_detail", {
            method: "POST",
            body: qs.stringify(options),
            headers: { "user-agent": "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0" }
        });

        let scheduleDom = await res.text()
        return scheduleDom.replace(/\n/g, "");
    }

    async parseSchedule({ file = null, str = null }) {
        let data = null;
        if (file !== null) {
            data = fs.readFileSync(file, "utf-8");
        } else {
            data = str;
        }

        let exams = [];
        let $ = cheerio.load(data);
        $("table").eq(1).find("tbody").children().each((trIndex, trChildren) => {
            if (trIndex === 0) return;
            let rowChildren = $(trChildren).children();
            exams.push({
                "date": $(rowChildren[0]).text(),
                "day": $(rowChildren[1]).text(),
                "time": $(rowChildren[2]).text(),
                "index": $(rowChildren[3]).text(),
                "title": titleize($(rowChildren[4]).text()),
                "duration": $(rowChildren[5]).text()
            });
        });

        return exams;
    }
}

module.exports = ExamScrapper;