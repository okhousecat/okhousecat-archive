const fs = require("fs");
const path = require("path");

module.exports = function(eleventyConfig) {
  const rawProjects = require("./src/_data/projects.js");

  // ✅ Passthrough for assets and CSS
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/style.css": "style.css" });

  // ✅ Collection: Flatten all projects
  eleventyConfig.addCollection("projects", function () {
    return rawProjects.flatMap(cat => cat.projects).map(project => ({
      ...project,
      inputPath: "",
      outputPath: "",
      templateContent: ""
    }));
  });

  // ✅ Filter to map display names to folder names with SPACES
  eleventyConfig.addFilter("specialImages", function(category) {
    const dirMap = {
      "Gameboy": "GAMEBOY",
      "Meowsic": "MEOWSIC",
      "Laser Harps": "LASER HARPS",
      "Speaks/Talks": "SPEAKS TALKS",
      "FX": "FX",
      "Toys": "TOYS",
      "Synth/Gadgets": "SYNTH GADGETS",
      "Keys/Drums": "KEYS DRUMS",
      "Acoustic/Electric": "ACOUSTIC ELECTRIC"
    };

    return dirMap[category] || category;
  });

  // ✅ Set directory structure
  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
