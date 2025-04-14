const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/explain", (req, res) => {
    const { code } = req.body;
    res.json({ explanation: `Received code with ${code.length} characters.` });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
