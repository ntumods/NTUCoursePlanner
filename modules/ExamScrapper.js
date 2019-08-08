const fetch = require("node-fetch");
const qs = require("querystring");
const fs = require("fs");

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
        fs.writeFileSync("./data/exams.html", scheduleDom);
    }

    async parseFile() {

    }
}

module.exports = ExamScrapper;