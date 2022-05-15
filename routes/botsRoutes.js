const express = require("express");
const mongoose = require("mongoose");
const Posts = mongoose.model("Post");

const requireToken = require("../middleware/requireToken");
var similarity = require("string-cosine-similarity");

const router = express.Router();

router.get("/getUser", requireToken, (req, res) => {
  // console.log("got req");
  res.status(200).json({ userId: req.user._id });
});

router.post("/pdfSearch", (req, res) => {
  Posts.find({}, "postaddress postname postText", (err, data) => {
    if (err) return res.send({ error: "error occured" });

    var string1 = req.body.searchQuery;
    const objects = [];

    for (var i = 0; i < data.length; i++) {
      var string2 = data[i].postText;

      var similarityScore = 0;

      if (isNaN(similarity(string2, string1))) {
        similarityScore = 0;
      } else {
        similarityScore = similarity(string2, string1);
        objects.push({
          similarity: similarityScore,
          postData: data[i],
        });
      }
    }
    function compare_similarity(a, b) {
      if (a.similarity < b.similarity) {
        return 1;
      }
      if (a.similarity > b.similarity) {
        return -1;
      }
      return 0;
    }

    objects.sort(compare_similarity);
    console.log("Done");
    res.json(objects);
  });
});

module.exports = router;