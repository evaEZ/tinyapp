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
  
  const validateUser = function(bcrypt, usersDb, email, password) {
    for (let key in usersDb){
      console.log(usersDb[key]["password"]);
      //console.log(usersDb.key);
      //const result = bcrypt.compareSync(usersDb[key]["password"], password);
      //if (usersDb[key]["email"] === email && result) {
      if (usersDb[key]["email"] === email && usersDb[key]["password"] === password) {  
        return key;
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