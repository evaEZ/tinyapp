function generateRandomString() {
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
  
const validateUser = function(bcrypt, usersDb, email, password) {
  for (let key in usersDb){
    const currentUser = usersDb[key]
    const result = bcrypt.compareSync(password,currentUser["password"]);    
    if (currentUser["email"] === email){
      console.log("email matching");
      if (result) {
        console.log("password matching");
        return key;
      }
    }
  }
  return null;
}
  
const getUserDB = function(user, urlDB) {
  let urlUserDatabase = {};
  for (let item in urlDB) {
    if (urlDB[item]["userID"] === user) {
      urlUserDatabase[item] = urlDB[item]["longURL"];
    }
  }
  return urlUserDatabase;
}

module.exports = {generateRandomString, findUserByEmail, validateUser, getUserDB};