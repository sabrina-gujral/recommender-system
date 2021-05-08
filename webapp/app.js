const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const timeout = require('connect-timeout');
const spawn = require("child_process").spawn;
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(timeout('30s'));

app.get("/", function (req, res) {
  res.render("index");
});


const genresList = [
  "Animation",
  "Children",
  "Comedy",
  "Musical",
  "Horror",
  "Drama",
  "Romance",
  "Action",
  "Crime",
  "Sci-fi",
  "Thriller",
  "Adventure",
  "Fantasy",
  "Mystery",
  "War",
  "Western",
  "Documentary",
];

genresList.sort();

app.post("/", function (req, res) {
  const name = req.body.name;
  const userId = req.body.userid;

  if (userId < 0 || userId > 610) {
    res.render("404");
  } else {
    res.redirect("/rec/" + userId + "/" + name);
  }
});

app.get("/rec/:userId/:name/:filters?/:title?", function (req, res) {
  const userId = req.params.userId;
  const name = req.params.name;
  let filters = req.query.filter;

  const url = "https://still-dusk-52410.herokuapp.com/movies/" + userId + "/re";

  https.get(url, function (response) {
    var data;
    response.on("data", function (chunk) {
      if (!data) {
        data = chunk;
      } else {
        data += chunk;
      }
    });

    response.on("end", function () {
      let movieRec = JSON.parse(data);
      const genres = [];
      movieRec.forEach((i) => genres.push(i.genres.split("|")));

      if (typeof filters === "undefined") {
        movieRec = movieRec;
      } else if (typeof filters === "string") {
        filters = [filters];
        filterMovies(filters);
      } else {
        filterMovies(filters);
      }

      function filterMovies(filters) {
        const movs = [];
        filters.forEach(function (filter) {
          movieRec.forEach((rec) =>
            rec.genres.includes(filter) ? movs.push(rec) : null
          );
        });
        movieRec = movs;

        return movieRec;
      }

      res.render("list", {
        rec: movieRec,
        name: name,
        userId: userId,
        genres: genresList,
      });
    });
  });
});

app.post("/rec/:userId/:name/:filters?/", function (req, res) {
  const name = req.params.name;
  const newId = req.body.userid;
  const filters = req.body.filter;

  if (newId < 0 || newId > 610) {
    res.render("404");
  } else {
    res.redirect("/rec/" + newId + "/" + name + "/" + filters);
  }
});

app.get("/:title", function (req, res) {
  const title = req.params.title;
  const pythonProcess = spawn("python", ["./recommender/recommend.py", title]);

  var dataStr = "";

  pythonProcess.stdout.on("data", (data) => {
    dataStr += data.toString();
  });

  pythonProcess.stderr.on("data", (data, err) => {
    console.log(err);
    console.log(data.toString());
  });

  pythonProcess.on("exit", (code) => {
    console.log("Process quit with code : " + code);

    const recommendations = JSON.parse(dataStr);

    const titles = Object.values(recommendations.title);
    const urls = Object.values(recommendations.movie_url);
    const posters = Object.values(recommendations.poster);
    const genres = Object.values(recommendations.genres);
    const director = Object.values(recommendations.director);

    const mem = process.memoryUsage();
    for(let key in mem) {
      console.log(
        `${key}: ${Math.round(mem[key] /1024 / 1024 * 100) / 100} MB`
      );
    }

    if(req.timedout) return;

    res.render("content", {
      movie: title,
      title: titles,
      urls: urls,
      posters: posters,
      genres: genres,
      director: director,
    });
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("listening on port 3000...");
});