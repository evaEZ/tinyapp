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
/** 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
*/

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

//send HTML code in the response
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//add a route for /urls
app.get("/urls", (req, res) => {
  
  const user = req.session.user_id;
  if(user) {
    const username = users[user]["email"];
    const urlUserDatabase = getUserDB (user, urlDatabase);
    console.log(urlUserDatabase);
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
    const username = users[user]["email"];
    const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      username
    };
    res.render("urls_show", templateVars);
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
  console.log(urlDatabase);
  res.statusCode = 200;
  res.redirect(`/urls/${shortURL}`);
});

//redirect short URLs
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL){
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
    //res.cookie('user_id',key);
    req.session.user_id = key;
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("Try Again");
  }
  /*
  console.log(req.cookie["username"]);
  username = req.body.username;
  const templateVars = {
    username,
    urls: urlDatabase
  };
  console.log(templateVars);
   res.render("urls_index", templateVars);
  */
});

app.get("/login", (req, res) => {
  //const user = req.cookies["user_id"];
  const user = req.session.user_id;
  if(user) {
    res.redirect("urls");
  } else {
    //console.log(users);
    const username = users[user];
    //console.log(req.cookies["username"]);
    const templateVars = {
      username,
      urls: urlDatabase
    };
  //console.log(templateVars); 
    //res.render("/urls", templateVars);
    res.render("urls_login",templateVars);
  }
});

app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  delete req.session.user_id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  //const user = req.cookies["user_id"];
  const user = req.session.user_id;
   if(user){
      res.redirect("/urls");
   } else {
    //res.redirect("/urls");
    //console.log(user);
    const username = users[user];
    const templateVars = {
      username
     };
    //console.log(templateVars);
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
        //password: password
    }
      console.log(users);
      //res.cookie('user_id', randomid);
      req.session.user_id = randomid;
      //console.log(users);
      res.redirect("/urls");
  }
}
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
