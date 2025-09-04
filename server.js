const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the Angular app build output
app.use(express.static(path.join(__dirname, 'dist/agrismart-web-v1-1')));

// Handle all other routes - return the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/agrismart-web-v1-1/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});