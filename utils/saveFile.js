const fs = require("fs");
const path = require("path");

function saveFile(fileType, buffer, filename, baseFolder = "./downloaded_files") {
  let subfolder = "";

  if (fileType === "image") subfolder = "images";
  else if (fileType === "file") subfolder = "files";
  else subfolder = "others";

  const folderPath = path.resolve(baseFolder, subfolder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fullPath = path.join(folderPath, filename);
  fs.writeFileSync(fullPath, buffer);

  // console.log(`✅ Saved file: ${fullPath} (${buffer.length} bytes)`);
  return fullPath;
}

module.exports = { saveFile };
