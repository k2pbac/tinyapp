const { assert } = require('chai');

const { userExists, authenticateUser, urlsForUser, isLoggedIn } = require('../helpers.js');
const {users} = require("../seeds/userSeeds");
const {urlDatabase} = require("../seeds/urlSeeds");


describe('authenticateUser(email, password, object)', function() {
  it('should return a user object with a valid email and password', function() {
    const user = authenticateUser("user@example.com","password", users);
    const expectedOutput = {id:'userRandomID', email:'user@example.com', password:'$2b$10$oHhn9/rAncryjP0MYXBi8OSW733Q2YufQfBn3TgzYg.N.mLFHcPs6'};
    assert.deepEqual(expectedOutput, user);
  });
  it('should return undefined with a valid email and invalid (or empty) password', function() {
    const user = authenticateUser("user@example.com","passwords", users);
    const expectedOutput = undefined;
    assert.deepEqual(expectedOutput, user);
  });
  it('should return undefined with a invalid (or empty) email and valid password', function() {
    const user = authenticateUser("USERSERSER@example.com","password", users);
    const expectedOutput = undefined;
    assert.deepEqual(expectedOutput, user);
  });
  it('should return undefined with a invalid (or empty) email and (or empty) invalid password', function() {
    const user = authenticateUser("USERSERSER@example.com","passwordsd", users);
    const expectedOutput = undefined;
    assert.deepEqual(expectedOutput, user);
  });

});

describe('userExists(email, object)', () => {
  it('should return true if the email is found in the object', () => {
    const email = userExists('krisbachan123@hotmail.com', users);
    const expectedOutput = true;

    assert.strictEqual(expectedOutput, email);
  });
  it('should return false if the email is not found in the object', () => {
    const email = userExists('krisbachansdfsad123@hotmail.com', users);
    const expectedOutput = false;

    assert.strictEqual(expectedOutput, email);
  });
  it('should return false if the email is empty', () => {
    const email = userExists('', users);
    const expectedOutput = false;

    assert.strictEqual(expectedOutput, email);
  });
});

describe('urlsForUser(id, object)', () => {

  it('should return an object containing the urls a user has created', () => {

    const urls = urlsForUser("aJ48lW", urlDatabase);
    const expectedOutput = {b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' }, sgq3y6: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }};

    assert.deepEqual(expectedOutput, urls);
});
it('should return an empty object if no urls exist for that user', () => {

  const urls = urlsForUser("aJ48lF", urlDatabase);
  const expectedOutput = {};

  assert.deepEqual(expectedOutput, urls);
});
});


describe('isLoggedIn(username)', () => {
  it('should return true if the user exists', () => {

    const urls = isLoggedIn('krisbachan123@hotmail.com');
    assert.isTrue(urls);
});
it("should return false if the user doesn't exist (i.e. username will be empty)", () => {

  const urls = isLoggedIn('');
  assert.isFalse(urls);
});
});