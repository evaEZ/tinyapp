const express = require("express");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const {generateRandomString, findUserByEmail, validateUser, getUserDB} = require('./helper');
const app = express();
const salt = bcrypt.genSaltSync(10);
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // set ejs as the view engine

//get the body-parser library
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['testtinyapp', 'tinyapptest']
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "a5fjdk" }
};

const users = { 
  "a5fjdk": {
    id: "a5fjdk", 
    email: "ezfl@example.com", 
    //password: "purple-monkey-dinosaur"
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
 "skd2do": {
    id: "skd2do", 
    email: "flez@example.com", 
    //password: "dishwasher-funk"
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
}

app.get("/", (req, res) => {
  const user = req.session.user_id;
  if(!user) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

//add another endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//add a route for /urls
app.get("/urls", (req, res) => {
  
  const user = req.session.user_id;
  if(user) {
    const username = users[user]["email"];
    const urlUserDatabase = getUserDB (user, urlDatabase);
    const templateVars = {
      username,
      urls: urlUserDatabase
    };
    res.render("urls_index", templateVars); 
  } else {
    res.send("Logged out/Not signed in");
  }
});

//add a GET route to show the form, render the urls_new.ejs template
app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  if(user){
    const username = users[user]["email"];
    const templateVars = {
      username
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//add a route for /urls/:shortURL which will be used to render the tempalate urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const user = req.session.user_id;
  if (user){
    if (req.params.shortURL in urlDatabase) {
      if (urlDatabase[req.params.shortURL]["userID"] === user) {
        const username = users[user]["email"];
        const templateVars = { 
          shortURL: req.params.shortURL, 
          longURL: urlDatabase[req.params.shortURL]["longURL"],
          username
        };
        res.render("urls_show", templateVars);
      } else {
        res.send ("You don't have access to this url");
      }
    } else {
      res.send ("The url doesn't exist");
    }
  } else {
    res.send("Please sign in");
  }
})

//add a post
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.statusCode = 200;
  res.redirect(`/urls/${shortURL}`);
});

//redirect short URLs
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase){
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  } else {
    res.send("The url doesn't exist");
  }
});

//delete an url
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//edit an url
app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  const username = users[user]["email"];
  const templateVars = { 
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id]["longURL"],
    username
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req,res) =>{ 
  urlDatabase[req.params.id]["longURL"] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  
  email=req.body.email;
  password=req.body.password;

  const key = validateUser(bcrypt, users, email, password);

  if (key){
    req.session.user_id = key;
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("Try Again");
  }
});

app.get("/login", (req, res) => {
  const user = req.session.user_id;
  if(user) {
    res.redirect("urls");
  } else {
    const username = users[user];
    const templateVars = {
      username,
      urls: urlDatabase
    };
    res.render("urls_login",templateVars);
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user = req.session.user_id;
   if(user){
      res.redirect("/urls");
   } else {
    const username = users[user];
    const templateVars = {
      username
     };
    res.render("urls_register", templateVars);
   }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt);
  if(!email || !password)
  {
    res.status(400);
    res.send("Please make sure your typed in email and password");
  } else {
    if(findUserByEmail(users, email)){
      res.status(400);
      res.send("email already used");
    } else {
      randomid = generateRandomString();
      users[randomid] = {
        id: randomid,
        email: email,
        password: hashedPassword
    }
      req.session.user_id = randomid;
      res.redirect("/urls");
  }
}
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
