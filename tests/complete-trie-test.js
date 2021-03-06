require('locus');
import { assert } from 'chai';
import { CompleteMe } from '../scripts/complete-me'
const text = "/usr/share/dict/words"
const fs = require('fs');
let dictionary = fs.readFileSync(text).toString().trim().split('\n')

describe('Trie basic attributes', () => {
  let completion = new CompleteMe();

  it('should be an instance of CompleteMe', () => {
    assert.instanceOf(completion, CompleteMe, "completion is an instance");
  })

  it('should be have a collection, starting with an empty array', () => {
    assert.deepEqual(completion.data, []);
  })

  it('should be have a head or root value', () => {
    assert.deepEqual(completion.head.data, "");
  })
})

describe('Trie Insert', () => {
  let completion = new CompleteMe();

  it('should have a function called "Insert"', () => {
    assert.isFunction(completion.insert, "insert is a function");
  })

  it('should insert a word into a database', () => {

    completion.insert("pizza");
    assert.equal(completion.data[0], "pizza")
  });

  it('should insert another letter into a database', () => {

    completion.insert("car");
    assert.equal(completion.data[1], "car")
  });

  it('should check multiple items in the database ', () => {

    completion.insert("banana");
    completion.insert("papaya");
    assert.equal(completion.data[2], "banana")
    assert.equal(completion.data[3], "papaya")
  });

  it('should have a node for letter down the chain for a first word', () =>{

    completion.insert("car")
    assert.property(completion.head.children['c'].children['a'].children, 'r')
  })

  it('should have a node for letter down the chain for a different ending word, evaluating cat vs car', () =>{

    completion.insert("cat")
    assert.property(completion.head.children['c'].children['a'].children, 't')
  })
})

describe('Trie should Find things', () => {
  let completion = new CompleteMe();

  it('should be a function', () => {
    assert.isFunction(completion.find, true);
  })

  it('should find a word', () => {
    completion.insert("pants");

    assert.deepEqual(completion.find('pants'), completion.head.children['p'].children['a'].children['n'].children['t'].children['s']);
  })

  it('should find a differt word', () => {
    completion.insert("banana");
    completion.insert("papaya");

    assert.deepEqual(completion.find('banana'), completion.head.children['b'].children['a'].children['n'].children['a'].children['n'].children['a']);
  })

})

describe('Trie Count data length', () => {
  let completion = new CompleteMe();

  it('should start at zero', () => {

    assert.deepEqual(completion.count(), 0);
  })

  it('should count up', () => {
    completion.insert("cater");
    completion.insert("banana");
    completion.insert("papaya");

    assert.deepEqual(completion.count(), 3);
  })


  it('should continue to count up', () => {
    completion.insert("car")
    completion.insert("cat")

    assert.deepEqual(completion.count(), 5);
  })

})

describe('Trie Suggestion', () => {
  let completion = new CompleteMe();

  it('should suggest a small array', () => {
    completion.insert("pick")
    completion.insert("picture")

    let autoSuggest = completion.suggest('pic')

    assert.equal(autoSuggest.includes("pick"), true)
    assert.equal(autoSuggest.includes("picture"), true)

  })

  it('should suggest another small array', () => {
    completion.insert("fin")
    completion.insert("finish")
    completion.insert("finally")



    let autoSuggest = completion.suggest('fi')

    assert.equal(autoSuggest.includes("fin"), true)
    assert.equal(autoSuggest.includes("finish"), true)
    assert.equal(autoSuggest.includes("finally"), true)
  })
})

describe('Trie Populate: Store the Dictionary', () => {
  let completion = new CompleteMe();

  completion.populate(dictionary)

  it('should be loaded in as an array', () => {
    let dictionary = fs.readFileSync(text).toString().trim().split('\n')

    assert.equal(dictionary.length, 235886)
  })

  it('should be called in the Trie', () =>{
    assert.equal(completion.data.length > 235000, true);
  })

  it('should auto suggest some options from the dictionary.', ()=>{
    let autoSuggest = completion.suggest('fi')

    assert.equal(autoSuggest.includes("fish"), true)
    assert.equal(autoSuggest.includes("finite"), true)
    assert.equal(autoSuggest.includes("fin"), true)
    assert.equal(autoSuggest.includes("fiction"), true)
  })
})

describe('Trie Select Relevant Suggestions', () => {


  it('have a function called Select', () =>{
    let completion = new CompleteMe();

    assert.isFunction(completion.select, true);
  })

  it('should select a word based on input, and increment its node isWord value', () =>{

    let completion = new CompleteMe();

    completion.insert('frog');
    assert.deepEqual(completion.head.children['f'].children['r'].children['o'].children['g'].isWord, 1)

    completion.select('frog');
    assert.deepEqual(completion.head.children['f'].children['r'].children['o'].children['g'].isWord, 2)

  })

  it('should increase count every time it is called', ()=>{
    let completion = new CompleteMe();

    completion.insert('frog');
    completion.insert('from');
    completion.insert('froglegs');

    completion.select('frog');
    completion.select('frog');
    completion.select('frog');
    completion.select('froglegs');

    completion.suggest('fro');

    assert.deepEqual(completion.head.children['f'].children['r'].children['o'].children['g'].isWord, 4)
    assert.deepEqual(completion.head.children['f'].children['r'].children['o'].children['m'].isWord, 1)
    assert.deepEqual(completion.head.children['f'].children['r'].children['o'].children['g'].children['l'].children['e'].children['g'].children['s'].isWord, 2)
  })

  it('should sort the suggestions array based on words of highest value', () =>{
    let completion = new CompleteMe();

    completion.insert('pickle');
    completion.insert('pine');
    completion.insert('pills');
    completion.insert('pizza');
    completion.insert('pizzazz');
    completion.insert('pizzle');
    completion.insert('pint');
    completion.insert('pity');

    completion.select('pizza');
    completion.select('pizza');
    completion.select('pizza');
    completion.select('pint');
    completion.select('pint');
    completion.select('pizzazz');

    let suggestion = completion.suggest('pi');

    assert.deepEqual(suggestion, ['pizza', 'pint', 'pizzazz', 'pizzle', 'pity', 'pine', 'pills', 'pickle'])
  })
})

describe('Trie Sort Function', () => {
  let completion = new CompleteMe();

  it('should be a function', () => {
    assert.isFunction(completion.sortSuggestions, true)
  })

  it('should return an array', () => {
    let nums = [5, 7, 22, 55, 66]
    let arr = completion.sortSuggestions(nums)

    assert.equal(Array.isArray(arr), true)
  })

  it('should return an array, in DESCENDING order', () => {
    let nums = [5, 7, 22, 55, 66]
    let arr = completion.sortSuggestions(nums)

    assert.deepEqual(arr, [66, 55, 22, 7, 5])
  })

  it('should sorts Words with higher counts based on Suggestions', () => {

    completion.insert('pickle');
    completion.insert('pine');
    completion.insert('pills');
    completion.insert('pizza');
    completion.insert('pint');

    completion.select('pizza');
    completion.select('pizza');
    completion.select('pizza');
    completion.select('pint');
    completion.select('pint');

    let autoSuggest = completion.suggest("pi");

    assert.deepEqual(autoSuggest, ['pizza', 'pint', 'pine', 'pills', 'pickle'])
  })

})

describe('Trie Select Relevant Suggestions from Dictionary', () => {
  let completion = new CompleteMe();

  completion.populate(dictionary)

  it('should count the number of similar words from the dictionary', () =>{

    completion.select('bass');
    completion.select('base');
    completion.select('base');
    completion.select('basoon')
    completion.select('bass')
    completion.select('bass');
    completion.select('based');
    completion.select('basic');

    assert.deepEqual(completion.head.children['b'].children['a'].children['s'].children['s'].isWord, 4)
    assert.deepEqual(completion.head.children['b'].children['a'].children['s'].children['e'].isWord, 3)
  })

  it('should auto present options in the dictionary', () =>{

    completion.select('bass');
    completion.select('base');
    completion.select('base');
    completion.select('basoon')
    completion.select('bass')
    completion.select('bass');
    completion.select('based');
    completion.select('basic');

    let autoSuggest = completion.suggest('ba');

    assert.deepEqual(autoSuggest[0], "bass");
    assert.deepEqual(autoSuggest[1], "base");
  })

  it('should auto present another set of options from the dictionary', () =>{

    completion.select('plank');
    completion.select('platypus');
    completion.select('plant');
    completion.select('platypus');
    completion.select('planter');
    completion.select('plan')
    completion.select('plant')
    completion.select('platypus');
    completion.select('plant');
    completion.select('plastic');
    completion.select('platypus');

    let autoSuggest = completion.suggest('pla');

    assert.deepEqual(autoSuggest[0], "platypus");
    assert.deepEqual(autoSuggest[1], "plant");
  })

  it('should auto present another ANOTHER set of options from the dictionary', () =>{

    completion.select('draft');
    completion.select('drain');
    completion.select('drab');
    completion.select('draw');
    completion.select('dragon');
    completion.select('draft');
    completion.select('drag')
    completion.select('dragon')
    completion.select('draft');
    completion.select('dragon');
    completion.select('drag');
    completion.select('drain');
    completion.select('draw');

    let autoSuggest = completion.suggest('dr');

    assert.deepEqual(autoSuggest[0], "dragon");
    assert.deepEqual(autoSuggest[1], "draft");
    assert.deepEqual(autoSuggest[2], "draw");
  })
})
