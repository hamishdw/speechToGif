import React, { useState, useRef } from 'react';

import { GiphyFetch } from '@giphy/js-fetch-api';

import './App.css';

import testWords from './words.json';
// import wordsToFilter from './wordsToFilter.json';
import wordsToFilter from './thousandWords.json';

const gf = new GiphyFetch('b8waZcuFYNKu6la8h5moFSkQP3TNK8nU');

const settings = {
  duplicateTimeout: 20
}

let count = 0;
let foundWords = new Set();

const appStyle = {
  fontSize: "10vmax",
  textAlign: "left",
  transform: "translateY(calc(-100% + 100vh))",
}

const anchorStyle = {
  overflowAnchor: "auto",
  height: "15vh",
}

const App = () => {
  const [ words, newWord ] = useState([]);
  const app = useRef();

  // if ('webkitSpeechRecognition' in window) {
  //   speechToText(newWord);
  // }

  setTimeout(() => {
    const word = checkIfKeyword( testWords[count].toLowerCase(), app.current );

    newWord(
      [...words, word]
    );

    count++;

    if(count === testWords.length) count = 0;
  }, 200);

  return (
    <div style={appStyle} ref={app} className="App">
      {words.map(({ text, keyword }) => 
        <span className={`word ${keyword && '-highlight'}`}>{ text } </span> 
      )}

      <div style={anchorStyle}/>
    </div>
  );
}

const checkIfKeyword = (word, appEl) => {
  let keyword = wordsToFilter.some(notAllowed => {
    if(notAllowed.length > 2){
      return word.indexOf(notAllowed, 0) !== -1
    }

    return word === notAllowed;
  }) !== true;

  if(foundWords.has(word)){
    keyword = false;
  } else {
    foundWords.add(word);

    setTimeout(() => {
      foundWords.delete(word);
    }, settings.duplicateTimeout * 1000)
  }

  if(keyword){
    const id = count;

    const gifsToCheck = 20;
    const rand = Math.floor(Math.random() * gifsToCheck);

    gf.search(word, { sort: 'relevant', limit: 1, offset: rand }).then(gif => {
      if(gif.data.length === 0) return;

      const gifUrl = gif.data[0].images.downsized_large.url;
      // const gifUrl = gif.data[0].images.original.url;
      console.log("gifUrl",gifUrl);

      const wordEl = document.querySelectorAll("span")[id];
      const imgEl = document.createElement("img");

      imgEl.onload = () => {
        const wordBox = wordEl.getBoundingClientRect();
        let left = wordBox.left > window.innerWidth / 2 ? wordBox.left : wordBox.right;

        imgEl.style.top = (wordBox.top + appEl.offsetHeight - window.innerHeight) + "px";
        imgEl.style.left = left + "px";
        imgEl.classList.add('gif');

        appEl.appendChild(imgEl);
      }

      imgEl.src = gifUrl;
    })
  }

  return {
    text: word,
    keyword
  }
}

const speechToText = newWord => {
  // eslint-disable-next-line no-undef
  const recognition = new webkitSpeechRecognition();
  console.log("recognition",recognition);
  recognition.maxAlternatives = 10;
  recognition.onresult = function(event) {
    if (event.results.length > 0) {
      var result = event.results[0];

      console.log("result",result);
      // for (var i = 0; i < result.length; ++i) {
      //   var text = result[i].transcript;
      //   select.options[i] = new Option(text, text);
      // }
    }
  }

  recognition.onstart = () => { 
    console.log('Speech recognition service has started'); 
  }

  recognition.onnomatch = event => {
    console.log("'I didnt recognise that color.'",'I didnt recognise that color.');
  }

  recognition.start();
}

export default App;
