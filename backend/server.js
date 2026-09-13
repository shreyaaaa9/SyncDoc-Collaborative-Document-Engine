const express = require("express");

const app = express();

const PORT = 5001;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "SyncDoc backend is running!"
  });
});

app.listen(PORT, () => {
  console.log(`SyncDoc server running on http://localhost:${PORT}`);
});