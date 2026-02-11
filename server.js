const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;
let showsCollection;

async function connectDB() {
    try {
        await client.connect();
        console.log("connected");

        db = client.db("showTracker");
        showsCollection = db.collection("shows");

    } catch (error) {
        console.error("connection error:", error);
        process.exit(1);
    }
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// all shows
app.get('/shows', async (req, res) => {
    try {
        const { username } = req.query;

        let query = {};
        if (username) {
            query = { uname: username };
        }

        const shows = await showsCollection.find(query).toArray();
        res.json(shows);

    } catch (error) {
        console.error('Error getting shows:', error);
        res.status(500).json([]);
    }
});

// add show
app.post('/submit', async (req, res) => {
    try {
        const newShow = req.body;

        // Calculate derived fields (same as before)
        newShow.totalEpisodes = newShow.SeasonCount * newShow.EpisodeCount;
        newShow.percentComplete = Math.round((newShow.EpisodesWatched / newShow.totalEpisodes) * 100);
        newShow.RemainingEpisodes = newShow.totalEpisodes - newShow.EpisodesWatched;
        newShow.createdAt = new Date();

        await showsCollection.insertOne(newShow);

        // Return all shows for this user
        const userShows = await showsCollection.find({ uname: newShow.uname }).toArray();
        console.log("Show added:", newShow.title);
        res.json(userShows);

    } catch (error) {
        console.error('Show add error:', error);
        res.status(500).json([]);
    }
});

// delete
app.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.query;

        await showsCollection.deleteOne({
            _id: new ObjectId(id),
            uname: username
        });

        res.json({ success: true });

    } catch (error) {
        console.error('Delete show error:', error);
        res.status(500).json({ success: false });
    }
});

// update
app.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Recalculate derived fields
        updateData.totalEpisodes = updateData.SeasonCount * updateData.EpisodeCount;
        updateData.percentComplete = Math.round((updateData.EpisodesWatched / updateData.totalEpisodes) * 100);
        updateData.RemainingEpisodes = updateData.totalEpisodes - updateData.EpisodesWatched;
        updateData.updatedAt = new Date();

        await showsCollection.updateOne(
            { _id: new ObjectId(id), uname: updateData.uname },
            { $set: updateData }
        );

        res.json({ success: true });

    } catch (error) {
        console.error('Show update error:', error);
        res.status(500).json({ success: false });
    }
});

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});

process.on('SIGINT', async () => {
    console.log('\nending mongo connection');
    await client.close();
    process.exit(0);
});