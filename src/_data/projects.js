const fs = require("fs");
const path = require("path");
const squarespaceLinks = require("./squarespaceLinks");

const basePath = path.join(__dirname, "..", "assets");

function getSlug(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function safeReadDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath).filter(file =>
    fs.statSync(path.join(dirPath, file)).isDirectory()
  );
}

// Optional: lookup for enhanced project info
const customDetails = {
  "meowsic": {
    title: "Meowsic Keyboard Remix",
    youtube: "https://www.youtube.com/embed/abc123",
    images: ["meowsic1.jpg", "meowsic2.jpg"]
  },
  "laser-harps": {
    title: "Laser Harps Trio",
    youtube: "https://www.youtube.com/embed/xyz456",
    images: ["laser1.jpg", "laser2.jpg"]
  }
};

// Folder → Display Title Map
const displayMap = {
  "GAMEBOY": "Gameboy",
  "MEOWSIC": "Meowsic",
  "LASER HARPS": "Laser Harps",
  "SPEAKS TALKS": "Speaks/Talks",
  "FX": "FX",
  "TOYS": "Toys",
  "SYNTH GADGETS": "Synth/Gadgets",
  "KEYS DRUMS": "Keys/Drums",
  "ACOUSTIC ELECTRIC": "Acoustic/Electric"
};

module.exports = safeReadDir(basePath).map(rawCategory => {
  const categoryPath = path.join(basePath, rawCategory);
  const displayName = displayMap[rawCategory] || rawCategory;
  let projects = [];

  // ✅ Add root-level images
  const rootFiles = fs.readdirSync(categoryPath).filter(f =>
    /\.(gif|jpg|jpeg|png)$/i.test(f)
  );

  const rootProjects = rootFiles.map(file => {
    const name = path.parse(file).name;
    const slug = getSlug(name);
    return {
      name,
      slug,
      category: displayName,
      title: name,
      gif: file, // e.g. "project.gif"
      link: squarespaceLinks[slug] || "#",
      youtube: null,
      images: []
    };
  });

  // ✅ Add subfolder projects (with gifs/)
  const subfolders = safeReadDir(categoryPath);
  const folderProjects = subfolders.map(projectName => {
    const slug = getSlug(projectName);
    const projectDir = path.join(categoryPath, projectName);
    const gifFolder = path.join(projectDir, "gifs");

    const gifs = fs.existsSync(gifFolder)
      ? fs.readdirSync(gifFolder).filter(f => f.endsWith(".gif"))
      : [];

    const detail = customDetails[slug] || {};

    return {
      name: projectName,
      slug,
      category: displayName,
      title: detail.title || projectName,
      gif: gifs[0] ? `${projectName}/gifs/${gifs[0]}` : null, // ✅ include full relative path
      link: squarespaceLinks[slug] || "#",
      youtube: detail.youtube || null,
      images: detail.images || []
    };
  }).filter(project => project.gif); // only include if it has a gif

  // ✅ Combine both sets
  projects = [...rootProjects, ...folderProjects];

  return {
    category: displayName,
    slug: getSlug(displayName),
    projects
  };
});
