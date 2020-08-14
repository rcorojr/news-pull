var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");


var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3001;

var app = express();


// Use morgan logger for logging requests
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Connect to mongo Heroku
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongonews-pull";

// mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the website
app.get("/scrape", function(req, res) {
  db.Article.remove({}).then(function(response){
    axios.get("https://www.nytimes.com/").then(function(response) {
      var $ = cheerio.load(response.data);
  
      $("div.css-6p6lnl").each(function(i, element) {
        var result = {};
            // console.log($(this).find("a").attr("href"))
        result.title = $(this)
          .find("h2")
          .text();
        result.link = "https://www.nytimes.com/" + $(this)
          .find("a")
          .attr("href");
  
        db.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle); res.send("Scrape Complete");
          })
          .catch(function(err) {
            console.log(err);
          });
      });
      console.log("test");

      
    });
  });
    
  });

  // Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated comment
app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbComment) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});



  app.listen(PORT, function() {
    console.log("App running on port " + PORT);
  });