const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/agrismart-web-v1-1')));

// Handle Angular routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/agrismart-web-v1-1/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});