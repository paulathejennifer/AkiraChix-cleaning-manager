
const areas = [
    {name: "Washrooms", difficulty:"Medium", needed:5},
    {name: "Entrance & Pavement", difficulty: "Hard", needed: 6 },
    {name: "Kaya", difficulty: "Medium", needed: 6 },
    {name: "Bool", difficulty: "Easy", needed: 3 },
    {name: "Corridor", difficulty: "Hard", needed: 6 },
    {name: "Serving Area", difficulty: "Easy", needed: 5 },
    {name: "Char", difficulty: "Easy", needed: 4 },
    {name: "In Front of Kaya", difficulty: "Moderate", needed: 5 },
    {name: "Path near Office", difficulty: "Easy", needed: 4 },
    {name: "Sink", difficulty: "Easy", needed: 4 },
    {name: "Lovelace Class", difficulty: "Moderate", needed: 3 },
    {name: "AnitaB Class", difficulty: "Moderate", needed: 3 },
    {name: "Ada Class", difficulty: "Moderate", needed: 3 },
    {name: "Spiral Staircase & Balcony", difficulty: "Hard", needed: 6}
];

const EMAILJS_PUBLIC_KEY = "T1VNwf5KLCL8rIt-J"; 
const EMAILJS_SERVICE_ID = "service_lufaje1";
const EMAILJS_TEMPLATE_ID = "template_fyo6raw";

emailjs.init(EMAILJS_PUBLIC_KEY);

function parseStudents() {
    const raw = document.getElementById("studentList").value.trim();
    return raw.split("\n").map(line => {
        const [name, email] = line.split(",").map(s => s.trim());
        return { name, email };
    }).filter(s => s.name && s.email);
}

function saveStudents() {
    const students = parseStudents();
    localStorage.setItem("students", JSON.stringify(students));
    alert("Student list saved!");
}

function getStudents() {
    return JSON.parse(localStorage.getItem("students") || "[]");
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function assignStudents() {
    const students = getStudents();
    if (students.length < 1) {
        alert("Add and save students first.");
        return {};
    }
    const lastAssignments = JSON.parse(localStorage.getItem("lastAssignments") || "{}");
    const unassigned = [...students];
    shuffle(unassigned);

    const newAssignments = {};
    const assignments = {};

    for (const area of areas) {
        const assigned = [];

        while (assigned.length < area.needed && unassigned.length > 0) {
            const student = unassigned.shift();
            const last = lastAssignments[student.email];
            if (last === area.difficulty && unassigned.length > 0) {
                unassigned.push(student);
                continue;
            }
            assigned.push(student);
            newAssignments[student.email] = area.difficulty;
        }
        assignments[area.name] = assigned;
    }
    localStorage.setItem("lastAssignments", JSON.stringify(newAssignments));
    return assignments;
}

function generateSchedule() {
    const assignments = assignStudents();
    let scheduleText = [];
    for (const area of areas) {
        const assigned = assignments[area.name] || [];
        if (assigned.length < area.needed) {
            scheduleText.push(`${area.name} — ${assigned.map(s => s.name).join(", ")} (⚠️ Not enough students!)`);
        } else {
            scheduleText.push(`${area.name} — ${assigned.map(s => s.name).join(", ")}`);
        }
    }
    document.getElementById("scheduleOutput").innerText = scheduleText.join("\n\n");
}

function generateAndSendSchedule() {
    const assignments = assignStudents();
    generateSchedule();
    for (const [area, students] of Object.entries(assignments)) {
        students.forEach(student => {
            const teammates = students.filter(s => s.email !== student.email).map(s => s.name).join(", ");
            const templateParams = {
                to_name: student.name,
                to_email: student.email,
                area: area,
                teammates: teammates || "You are working solo today!"
            };
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(() => {
                console.log(`Email sent to ${student.name}`);
            })
            .catch((err) => {
                console.error(`Failed to send to ${student.name}`, err);
            });
        });
    }
}
 