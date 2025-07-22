/*
 * 1. npm install csv-parse
 * 2. node reorganize-projects.js
 */

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const ASSETS_ROOT = path.join(
  'C:', 'Users', 'wpros', 'Downloads',
  'okhousecat-archive-starter-v2', 'src', 'assets'
);

const CSV_PATH = path.join(__dirname, 'project_category_map.csv');

// Utility: copy folder (only if dest doesn't exist)
const copyFolder = (src, dest) => {
  if (fs.existsSync(dest)) {
    console.log(`↷ Skipped (already exists): ${dest}`);
    return true;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`✅ Copied → ${dest}`);
  return true;
};

// Utility: recursively delete a folder
const deleteFolder = (target) => {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`🗑️  Deleted → ${target}`);
  }
};

// Step 1: Read category folders
const legacyCategories = fs.readdirSync(ASSETS_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

// Step 2: Map of all projects in old folders
const projectMap = {};
legacyCategories.forEach(cat => {
  const catPath = path.join(ASSETS_ROOT, cat);
  fs.readdirSync(catPath, { withFileTypes: true }).forEach(entry => {
    if (entry.isDirectory()) {
      projectMap[entry.name] = { path: path.join(catPath, entry.name), from: cat };
    }
  });
});

// Step 3: Read CSV
const csvData = fs.readFileSync(CSV_PATH, 'utf8');
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
});

// Step 4: Track which projects were moved
const movedProjects = new Set();
const usedLegacyCategories = new Set();

records.forEach(({ 'Item name': item, 'NEW CATEGORY': cats }) => {
  const entry = projectMap[item];
  if (!entry) {
    console.log(`⚠️  Not found in old categories: ${item}`);
    return;
  }

  const { path: srcPath, from: originalCategory } = entry;
  let copiedAnywhere = false;

  cats.split(',').map(c => c.trim()).filter(Boolean).forEach(newCat => {
    const destPath = path.join(ASSETS_ROOT, newCat, item);
    const copied = copyFolder(srcPath, destPath);
    if (copied) copiedAnywhere = true;
  });

  if (copiedAnywhere) {
    deleteFolder(srcPath); // delete from original
    movedProjects.add(item);
    usedLegacyCategories.add(originalCategory);
  }
});

// Step 5: Delete empty legacy category folders if all projects moved
usedLegacyCategories.forEach(cat => {
  const catPath = path.join(ASSETS_ROOT, cat);
  const remaining = fs.readdirSync(catPath).filter(f => fs.lstatSync(path.join(catPath, f)).isDirectory());
  if (remaining.length === 0) {
    deleteFolder(catPath);
  }
});
