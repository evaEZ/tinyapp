const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs") // set ejs as the view engine

//get the body-parser library
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//function to generate a random shortURL
function generateRandomString() {
/** 
  const alphanum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result ="";
  for(let i = 0; i < 6; i++){
    result += alphanum[Math.floor(Math.random()* 61)];
  }
*/
  const result = Math.random().toString(36).substring(2,8);
  return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

//add another endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//send HTML code in the response
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//add a route for /urls
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  //pass the URL data to our template url_index.ejs
  res.render("urls_index", templateVars); 
});

//add a GET route to show the form, render the urls_new.ejs template
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//add a route for /urls/:shortURL which will be used to render the tempalate urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */ };
  res.render("urls_show", templateVars);
})

//add a post
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  //res.send();
  
   const shortURL = generateRandomString();
   urlDatabase[shortURL] = req.body.longURL;
   //console.log(urlDatabase);
   res.statusCode = 200;
   res.redirect(`/urls/${shortURL}`);
   //res.send('OK');  // Respond with 'Ok' (we will replace this)
});

//redirect short URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});