const express = require('express');
const path = require('path');
const app = express();

// Security and performance middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS headers for API calls
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files with proper headers
app.use(express.static(path.join(__dirname, 'dist/agrismart-web-v1-1'), {
  maxAge: '1d',
  etag: false,
  setHeaders: (res, path) => {
    // Disable caching for index.html to ensure updates are picked up
    if (path.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // Set proper MIME types
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API proxy endpoints if needed (optional - remove if not using)
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found. This is a frontend-only server.' 
  });
});

// Handle Angular routing - MUST be last
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/agrismart-web-v1-1/index.html');
  
  // Check if index.html exists
  const fs = require('fs');
  if (!fs.existsSync(indexPath)) {
    return res.status(500).send(`
      <h1>Build Error</h1>
      <p>Angular build files not found at: ${indexPath}</p>
      <p>Make sure 'npm run build' completed successfully.</p>
    `);
  }
  
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 AgriSmart frontend server running on port ${port}`);
  console.log(`📂 Serving from: ${path.join(__dirname, 'dist/agrismart-web-v1-1')}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
  
  // Log if build directory exists
  const fs = require('fs');
  const buildPath = path.join(__dirname, 'dist/agrismart-web-v1-1');
  const indexExists = fs.existsSync(path.join(buildPath, 'index.html'));
  
  console.log(`📁 Build directory exists: ${fs.existsSync(buildPath)}`);
  console.log(`📄 Index.html exists: ${indexExists}`);
  
  if (indexExists) {
    console.log('✅ Ready to serve Angular application');
  } else {
    console.log('❌ Warning: index.html not found - run npm run build first');
  }
});