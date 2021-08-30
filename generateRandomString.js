function generateRandomString() {
  let randomString = "";
  let check = true;
  for (let i = 0; i < 6; i++) {
    randomString+= String.fromCharCode(i);
    if(check) {
      randomString += String.fromCharCode(Math.random() * (91 - 65) + 65);
      check = false;
    }
    else {
    randomString += String.fromCharCode(Math.random() * (123 - 97) + 97);
    check = true;
    }
  }
  return randomString;
}


module.exports = {
  generateRandomString
}