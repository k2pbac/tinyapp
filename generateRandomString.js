function generateRandomString() {
  return ((Math.random() + 1).toString(36).substring(7)).split('')
  .map((el, index) => typeof el === 'string' && index % 2 !== 0 ? el.toUpperCase() : el).join('');
}

module.exports = {
  generateRandomString
}

