import express from "express";
import { MongoClient } from "mongodb";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("MongoDb is connected");
    return client;
}
const client = await createConnection();

app.listen(PORT, () => console.log("App connected in:" + PORT));

app.get("/", (req, res) => {
    res.send("Web Developer Task Server Started ");
});

app.post("/create-mentor", async (req, res) => {
    const data = req.body;
    const mentor = await client
        .db("classes")
        .collection("mentors")
        .insertOne(data);
    res.send(mentor);
});

app.post("/create-student", async (req, res) => {
    const data = req.body;
    const student = await client
        .db("classes")
        .collection("students")
        .insertOne(data);
    res.send(student);
});
app.get("/students", async (req, res) => {
    const data = await client
        .db("classes")
        .collection("students")
        .find()
        .toArray();
    res.status(200).send(data);
});
app.get("/mentors", async (req, res) => {
    const data = await client
        .db("classes")
        .collection("mentors")
        .find()
        .toArray();
    res.status(200).send(data);
});

// Inserting Many data
app.post("/mentors", async (req, res) => {
    const data = req.body;
    const mentors = await client
        .db("classes")
        .collection("mentors")
        .insertMany(data);
    res.send(mentors);
});

// Inserting Many data
app.post("/students", async (req, res) => {
    const data = req.body;
    const students = await client
        .db("classes")
        .collection("students")
        .insertMany(data);
    res.send(students);
});

app.put("/assign-student", async (req, res) => {
    const { mentorName, studentsAssigned } = req.body;

    const mentor = await client
        .db("classes")
        .collection("mentors")
        .updateOne(
            { mentorName: mentorName },
            {
                $set: {
                    studentsAssigned: studentsAssigned,
                },
            }
        );

    const students = await client
        .db("classes")
        .collection("students")
        .updateOne(
            { studentName: studentsAssigned },
            {
                $set: { mentorAssigned: mentor },
            }
        );


    res.send(students);
});

app.put("/assign-mentor", async (req, res) => {
    const { studentName, mentorAssigned } = req.body;
    const mentor = await client
        .db("classes")
        .collection("students")
        .updateOne(
            { studentName: studentName },
            { $set: { mentorAssigned: mentorAssigned } }
        );

    const students = await client
        .db("classes")
        .collection("mentors")
        .findOneAndUpdate(
            { mentorName: mentorAssigned },
            {
                $addToSet: {
                    studentsAssigned: studentName,
                },
            }
        );

    res.send({ Msg: "Database Updated Successfully" });
});