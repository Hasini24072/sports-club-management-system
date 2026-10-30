const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3000;

const MONGO_URL = "mongodb://127.0.0.1:27017";
const DATABASE_NAME = "sportsClubDB";

let playersCollection;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GET: Retrieve all players
app.get("/api/players", async (req, res) => {
    try {
        const players = await playersCollection.find({}).toArray();
        res.status(200).json(players);
    } catch (error) {
        console.error("Error retrieving players:", error);
        res.status(500).json({ message: "Failed to retrieve players." });
    }
});

// POST: Add a new player
app.post("/api/players", async (req, res) => {
    try {
        const { playerId, name, age, sport, membershipType, membershipStatus } = req.body;

        if (
            playerId === undefined ||
            !name ||
            !sport ||
            !Number.isFinite(Number(age)) ||
            Number(age) <= 0
        ) {
            return res.status(400).json({
                message: "Please enter a valid player ID, name, age, and sport."
            });
        }

        const newPlayer = {
            playerId: Number(playerId),
            name: name.trim(),
            age: Number(age),
            sport: sport.trim(),
            membershipType: membershipType || "Basic",
            membershipStatus: membershipStatus || "Active"
        };

        const result = await playersCollection.insertOne(newPlayer);

        res.status(201).json({
            message: "Player added successfully!",
            insertedId: result.insertedId
        });
    } catch (error) {
        console.error("Error adding player:", error);
        res.status(500).json({ message: "Failed to add player." });
    }
});

// PUT: Update a player
app.put("/api/players/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, age, sport, membershipType, membershipStatus } = req.body;

        const result = await playersCollection.updateOne(
            { playerId: id },
            {
                $set: {
                    name: name.trim(),
                    age: Number(age),
                    sport: sport.trim(),
                    membershipType,
                    membershipStatus
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Player not found." });
        }

        res.json({ message: "Player updated successfully!" });
    } catch (error) {
        console.error("Error updating player:", error);
        res.status(500).json({ message: "Failed to update player." });
    }
});

// DELETE: Delete a player
app.delete("/api/players/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const result = await playersCollection.deleteOne({
            playerId: id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Player not found." });
        }

        res.json({ message: "Player deleted successfully!" });
    } catch (error) {
        console.error("Error deleting player:", error);
        res.status(500).json({ message: "Failed to delete player." });
    }
});

// Connect MongoDB and start server
async function startServer() {
    const client = new MongoClient(MONGO_URL);

    try {
        await client.connect();

        const db = client.db(DATABASE_NAME);
        playersCollection = db.collection("players");

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        await client.close().catch(() => { });
        process.exitCode = 1;
    }
}

startServer();