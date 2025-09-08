const fs = require('fs');
const path = require('path');

// Get the command from npm script (dev or prod)
const command = process.argv[2];

if (!command || !['dev', 'prod'].includes(command)) {
  console.error('Usage: node dev-prod.js [dev|prod]');
  process.exit(1);
}

console.log(`Switching to ${command} configuration...`);

// Function to update files based on mode
function updateFiles(isDev) {
  // Update .UseWindowsService() calls
  updateWindowsServiceCalls(isDev);
  
  // Update environment.ts
  updateEnvironmentFile(isDev);
  
  console.log(`Successfully switched to ${isDev ? 'development' : 'production'} mode!`);
}

// Function to find and update .UseWindowsService() calls in all .cs files
function updateWindowsServiceCalls(isDev) {
  const findCsFiles = (dir, files = []) => {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        findCsFiles(fullPath, files);
      } else if (item.endsWith('.cs')) {
        files.push(fullPath);
      }
    }
    
    return files;
  };

  const csFiles = findCsFiles('.');
  let filesUpdated = 0;

  csFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      if (isDev) {
        // Dev mode: uncomment out .UseWindowsService()
        const uncommentedPattern = /\/\/(\s*)\.UseWindowsService\(\)/g;
        if (uncommentedPattern.test(content)) {
          content = content.replace(uncommentedPattern, '$1.UseWindowsService()');
          modified = true;
        }
      } else {
        // Prod mode: comment .UseWindowsService()
        const commentedPattern = /(\s*)\.UseWindowsService\(\)/g;
        if (commentedPattern.test(content)) {
          content = content.replace(commentedPattern, '$1//.UseWindowsService()');
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesUpdated++;
        console.log(`Updated Windows Service calls in: ${filePath}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not process ${filePath}: ${error.message}`);
    }
  });

  console.log(`Updated Windows Service calls in ${filesUpdated} files.`);
}

// Function to update environment.ts file
function updateEnvironmentFile(isDev) {
  const envPath = path.join('.', 'src/environments/environment.ts');

  if (!fs.existsSync(envPath)) {
    console.warn('Warning: environment.ts not found. Skipping environment configuration.');
    return;
  }

  try {
    let content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    if (isDev) {
      // Dev mode: comment lines 8,9 and uncomment lines 4,5
      if (lines[7] && !lines[7].trim().startsWith('//')) {
        lines[7] = '//' + lines[7];
        modified = true;
      }
      if (lines[8] && !lines[8].trim().startsWith('//')) {
        lines[8] = '//' + lines[8];
        modified = true;
      }
      if (lines[3] && lines[3].trim().startsWith('//')) {
        lines[3] = lines[3].replace(/^(\s*)\/\//, '$1');
        modified = true;
      }
      if (lines[4] && lines[4].trim().startsWith('//')) {
        lines[4] = lines[4].replace(/^(\s*)\/\//, '$1');
        modified = true;
      }
    } else {
      // Prod mode: uncomment lines 8,9 and comment lines 4,5
      if (lines[7] && lines[7].trim().startsWith('//')) {
        lines[7] = lines[7].replace(/^(\s*)\/\//, '$1');
        modified = true;
      }
      if (lines[8] && lines[8].trim().startsWith('//')) {
        lines[8] = lines[8].replace(/^(\s*)\/\//, '$1');
        modified = true;
      }
      if (lines[3] && !lines[3].trim().startsWith('//')) {
        lines[3] = '//' + lines[3];
        modified = true;
      }
      if (lines[4] && !lines[4].trim().startsWith('//')) {
        lines[4] = '//' + lines[4];
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
      console.log('Updated environment.ts configuration.');
    } else {
      console.log('environment.ts was already in the correct state.');
    }
  } catch (error) {
    console.error(`Error updating environment.ts: ${error.message}`);
  }
}

// Execute the configuration switch
updateFiles(command === 'dev');