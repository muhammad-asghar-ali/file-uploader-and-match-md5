const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const File = require("../models/file");
const { ensureAuthenticated } = require("../config/auth");

const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "images/gif",
  "application/pdf",
  "application/x-msdownload",
  "application/msword",
  "application/msword",
  "application/octet-stream",
];
//login page
router.get("/", (req, res) => {
  res.render("welcome");
});
//register page
router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/dashboard", ensureAuthenticated, async (req, res, next) => {
  try {
    const files = await File.find();
    res.render("index", {
      user: req.user,
      files,
    });
  } catch (err) {
    console.log("err: " + err);
  }
});

router.post("/add", async (req, res, next) => {
  const { name, type, img } = req.body;
  const filefind = await File.findOne({ name, type });
  //   console.log(filefind);
  if (filefind) {
    // err_msg = "This file already exists.";
    // return res.json({ err_msg: err_msg });
    res.render("alreadyExist");
  }
  const md5 = crypto.createHash("md5").digest("hex");
  const files = new File({
    name,
    type,
    md5,
  });

  // SETTING file AND file TYPES
  saveImage(files, img);
  try {
    const newFile = await files.save();
    // console.log(newFile);
    res.render("upload");
  } catch (err) {
    console.log(err);
  }
});

router.post("/search", async (req, res, next) => {
  try {
    const { md5 } = req.body;
    // console.log(md5);
    const findFile = await File.find({ md5 });
    if (findFile.length > 0) {
      //   err_msg = "This file already exists.";
      //   return res.json({ err_msg: err_msg });
      res.render("alreadyExist")
    } else {
      //   err_msg = "File Not Found";
      //   return res.json({ err_msg: err_msg });
      res.render("notFound");
    }
  } catch (err) {
    console.log("err: " + err);
  }
});

function saveImage(files, imgEncoded) {
  // CHECKING FOR IMAGE IS ALREADY ENCODED OR NOT
  if (imgEncoded == null) return;

  // ENCODING IMAGE BY JSON PARSE
  const img = JSON.parse(imgEncoded);
  console.log("JSON parse: " + img);

  // CHECKING FOR JSON ENCODED IMAGE NOT NULL
  // AND HAVE VALID IMAGE TYPES WITH IMAGE MIME TYPES
  if (img != null && imageMimeTypes.includes(img.type)) {
    // SETTING IMAGE AS BINARY DATA
    files.img = new Buffer.from(img.data, "base64");
    files.imgType = img.type;
  }
}

module.exports = router;
