import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connect from './dbConfig/dbCon.js';
import crypto from 'crypto';
import { Url } from "./models/url.model.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
connect();

app.post('/shorten', async (req, res) => {
    const longUrl = req.body?.longUrl;
    if (!longUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }
    try {
        const hash = crypto.createHash("md5").update(longUrl).digest("hex");

        const shortCode = hash.substring(0, 6);

        let entry = await Url.findOne({ shortCode });

        // If entry with this shortCode doesn't exist, create and save it
        if (!entry) {
            entry = new Url({ longUrl, shortCode });
            await entry.save();
        }
        return res.status(200).json({ shortCode });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/find/:shortCode", async (req, res) => {
    try {
        const shortCode = req.params.shortCode;
        const entry = await Url.findOne({ shortCode });

        // If found, redirect to the original longUrl
        if (entry) return res.redirect(entry.longUrl);

        res.status(404).json({ error: "Short URL not found" });

    } catch {
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(3001, () => {
    console.log('server listening on 3001');
});