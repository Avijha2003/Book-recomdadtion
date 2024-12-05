const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const natural = require("natural");
const TfIdf = natural.TfIdf;
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const books = JSON.parse(fs.readFileSync("books.json", "utf-8"));

const tfidf = new TfIdf();
books.forEach((book) => {
  const text = `${book.title} ${book.genre} ${book.author}`.toLowerCase();
  tfidf.addDocument(text);
});

function getTfIdfScores(userInput) {
  const input = userInput.toLowerCase();
  const scores = [];

  tfidf.tfidfs(input, (i, measure) => {
    scores.push({ book: books[i], score: measure });
  });

  return scores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

app.post("/recommend", (req, res) => {
  const userInput = req.body.interest;

  const recommendations = getTfIdfScores(userInput);

  if (recommendations.length > 0) {
    let responseHtml = `
      <h2>Recommended Books:</h2>
      <table border="1" cellpadding="10" cellspacing="0" style="width:80%; margin:auto;">
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Genre</th>
          <th>socre</th>
          <th>Link</th>
        </tr>`;

    recommendations.forEach(({ book, score }) => {
      responseHtml += `
        <tr>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.genre}</td>
          <td>${score.toFixed(2)}</td>
          <td><a href="${book.link}" target="_blank">View Book</a></td>
        </tr>`;
    });

    responseHtml += "</table><br><a href='/'>Go Back</a>";
    res.send(responseHtml);
  } else {
    res.send(
      "<h2>No books found matching your interest.</h2><a href='/'>Go Back</a>"
    );
  }
});


app.get('/', async (req, res) => {
  res.render('public/index.html'); // Use the correct 'render' method
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
