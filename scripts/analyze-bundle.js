/**
 * Bundle Analyzer Script
 * Analyzes bundle sizes after build
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const buildPath = path.join(__dirname, '..', 'build', 'static', 'js');

console.log('📊 Analyzing Bundle Sizes...\n');

// Check if build directory exists
if (!fs.existsSync(path.join(__dirname, '..', 'build'))) {
  console.error('❌ Build directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Get all JS files in build/static/js
try {
  const files = fs.readdirSync(buildPath).filter(file => file.endsWith('.js'));
  
  if (files.length === 0) {
    console.error('❌ No JS files found in build/static/js');
    process.exit(1);
  }

  console.log('📦 Found bundle files:\n');
  
  files.forEach(file => {
    const filePath = path.join(buildPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const sizeKBGzipped = (stats.size * 0.3 / 1024).toFixed(2); // Approximate gzip size
    
    console.log(`  ${file}`);
    console.log(`    Size: ${sizeKB} KB (estimated gzipped: ~${sizeKBGzipped} KB)\n`);
  });

  console.log('💡 Tip: For detailed package analysis, run:');
  console.log('   npm run analyze-sourcemap\n');
  
} catch (error) {
  console.error('❌ Error analyzing bundles:', error.message);
  process.exit(1);
}

