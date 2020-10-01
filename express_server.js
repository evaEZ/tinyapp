const express = require("express");
const cookieParser = require('cookie-parser');
//const cookieSession = require('cookie-session')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs") // set ejs as the view engine

//get the body-parser library
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "a5fjdk": {
    id: "a5fjdk", 
    email: "ezfl@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "skd2do": {
    id: "skd2do", 
    email: "flez@example.com", 
    password: "dishwasher-funk"
  }
}

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


const findUserByEmail = function(usersDb, email) {
  
  for (let key in usersDb){
    if(usersDb[key]["email"] === email){
      return true;
    }
  }
  return null;
}

const validateUser = function(usersDb, email, password) {
  for (let key in usersDb){
    if (usersDb[key]["email"] === email && usersDb[key]["password"] === password) {
      return key;
    }
  }
  return null;
}


app.get("/", (req, res) => {
  //res.send("Hello!")
  const user = req.cookies["user_id"];
  if(!user) {
     //res.render("urls_login");
     res.redirect("/login");
  } else {
   // console.log(users);
   // const username = users[user]["email"];
    //console.log(req.cookies["username"]);
    //const templateVars = {
    //  username,
    //  urls: urlDatabase
   // };
  //console.log(templateVars); 
    //res.render("/urls", templateVars);
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
  const user = req.cookies["user_id"];
  if(user) {
  console.log(user);
  const username = users[user]["email"];
  const templateVars = {
    username,
    urls: urlDatabase
  };
  /** 
  const templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase};
  */
  //pass the URL data to our template url_index.ejs
  res.render("urls_index", templateVars); 
  } else {
    res.Status(403);
  }
});

//add a GET route to show the form, render the urls_new.ejs template
app.get("/urls/new", (req, res) => {
  const user = req.cookies["user_id"];
  const username = users[user]["email"];
  const templateVars = {
    username
  };
  res.render("urls_new", templateVars);
});

//add a route for /urls/:shortURL which will be used to render the tempalate urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies["user_id"];
  const username = users[user]["email"];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]/* What goes here? */,
    username};
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

//delete an url
app.post("/urls/:shortURL/delete", (req,res) => {
  //console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//edit an url
app.post("/urls/:id", (req, res) => {
  const user = req.cookies["user_id"];
  const username = users[user]["email"];
  const templateVars = { 
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req,res) =>{ 
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});



app.post("/login", (req, res) => {
  console.log(req);
  email=req.body.email;
  password=req.body.password;
  const key = validateUser(users, email, password);

  if (key){
    res.cookie('user_id',key);
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
  const user = req.cookies["user_id"];
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
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user = req.cookies["user_id"];
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
  email = req.body.email;
  password = req.body.password;
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
      password: password
    }
    res.cookie('user_id', randomid);
    //console.log(users);
    res.redirect("/urls");
  }
}
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
