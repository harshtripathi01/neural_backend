const logger = require("../logger");
const path = require("path");

function saveImage(filePath) {
  const directories = path.dirname(filePath).split(path.sep).slice(1).join('/');
  const fileName = path.basename(filePath);
  return directories + '/' + encodeURIComponent(fileName);
}

const uploadImage = async (request, response) => {
try {
  let imagePath = saveImage(request.file.path);

  if (imagePath) {
    return response.status(200).json({
      success: true,

      statusCode: 200,

      message: "success",

      imagePath,
    });
  } else {
    return response.status(403).json({
      success: false,

      statusCode: 403,

      message: "some error has occured",
    });
  }
} catch (error) {
  console.log("error", error);

  return response.status(500).json({
    success: false,

    statusCode: 500,

    message: error.message,
  });
}
};

module.exports = { uploadImage };
