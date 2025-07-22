const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const newCategoriesDir = path.join(__dirname, "src/assets");
const oldCategoryDirs = [
  "src/assets/HOMEMADE DEVICES",
  "src/assets/CIRCUIT BENT INSTRUMENTS",
  "src/assets/MODIFIED TOYS",
  "src/assets/GADGET AND FX",
  "src/assets/OTHER"
];

const rows = [];

fs.createReadStream("project_category_map.csv")
  .pipe(csv())
  .on("data", (data) => rows.push(data))
  .on("end", () => {
    rows.forEach(({ Project, Categories }) => {
      if (!Project || !Categories) return;

      const sourcePath = findProjectPath(Project);
      if (!sourcePath) {
        console.warn(`❌ Not found: ${Project}`);
        return;
      }

      Categories.split(",").forEach((category) => {
        const dest = path.join(newCategoriesDir, category.trim(), Project);
        if (!fs.existsSync(dest)) {
          fs.cpSync(sourcePath, dest, { recursive: true });
          console.log(`✅ Copied → ${dest}`);
        } else {
          console.log(`⏭️  Skipped (already exists) → ${dest}`);
        }
      });
    });
  });

function findProjectPath(projectName) {
  for (const folder of oldCategoryDirs) {
    const full = path.join(__dirname, folder, projectName);
    if (fs.existsSync(full)) return full;
  }
  return null;
}
