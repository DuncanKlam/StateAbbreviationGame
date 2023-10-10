import { useState } from "react";
import GameData from './data/CountiesByState.json'

export type GData = {
  completed: boolean
  guess: string
  order: number
  abbr: string
  state: string
}

export enum PlayStyle {
  UNCHOSEN,
  EASY,
  NORMAL,
}

export enum GameMode {
  UNCHOSEN,
  EASY,
  HARD,
  GODLY,
}

function App() {

  const [gameData, setGameData] = useState<GData[]>([])
  const [playstyle, setPlaystyle] = useState<PlayStyle>(PlayStyle.UNCHOSEN)
  const [gamemode, setGamemode] = useState<GameMode>(GameMode.UNCHOSEN)
  const [isSetupButtonsVisible, setIsSetupButtonsVisible] = useState(false)
  const [showStart, setShowStart] = useState(true)
  const [showGame, setShowGame] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [resultsData, setResultsData] = useState(0)

  return (
    <div className="App">
      <div className="body">
        { 
          showStart && 
          <div className="button-row">
            <button onClick={showButtons}>Play Game</button> 
          </div>
        }
        { 
          isSetupButtonsVisible && 
          <div className="question-group">
            <div className="question">
              <p>Playstyle?</p>
              <div className="button-row">
                <button className={`${playstyle === PlayStyle.EASY && 'selected'}`} onClick={playstyleEasy}>Easy</button>
                <button className={`${playstyle === PlayStyle.NORMAL && 'selected'}`} onClick={playstyleNormal}>Normal</button>
              </div>
            </div>
            <div className="question">
              <p>Gamemode?</p>
              <div className="button-row">
                <button className={`${gamemode === GameMode.EASY && 'selected'}`} onClick={gamemodeEasy}>Easy</button>
                <button className={`${gamemode === GameMode.HARD && 'selected'}`} onClick={gamemodeHard}>Hard</button>
                <button className={`${gamemode === GameMode.GODLY && 'selected'}`} onClick={gamemodeGodly}>Godly</button>
              </div>
            </div>
            <div className="button-row">
              <button className="next-button" onClick={startGame}>Start</button>
            </div>
          </div>
        }
        {
          showGame &&
          <div className="game">
            <h1>{gameData[currentIndex].state} <span>({currentIndex + 1}/{50})</span></h1>
            {
              (playstyle === PlayStyle.EASY) && 
              <div className="button-row">
                {generateOptions(gameData[currentIndex]).map((opt, index) => (
                  <button className={`${gamemode === GameMode.EASY && ''}`} key={index} onClick={handleOptionClick}>{opt}</button>
                ))}
              </div>
            }
            {
              (playstyle === PlayStyle.NORMAL) &&
              <input type="text" maxLength={2} minLength={2} onChange={handleInputChange} value={inputVal} id="abbr-input" onKeyDown={checkSubmit}/>
            }
            <div className="button-row">
              <button className="next-button" onClick={submitAnswer}>Next</button>
            </div>
          </div>
        }
        {
          showResults && 
          <div className="results">
            <h1>Results</h1>
            <div className="results-nums">
              <span id="correct">{resultsData}</span>
              <span id="incorrect">{50 - resultsData}</span>
            </div>
            <p>{resultsData >= 45 ? "So close, great job!" : resultsData >= 35 ? "You did good!" : "oof :( try again"}</p>
            <div className="button-row">
              <button onClick={backToStart}>Back to Start</button>
            </div>
          </div>
        }
      </div>
    </div>
  )

  function showButtons(){setIsSetupButtonsVisible(true); setShowStart(false)}
  function playstyleEasy(){setPlaystyle(PlayStyle.EASY)}
  function playstyleNormal(){setPlaystyle(PlayStyle.NORMAL)}
  function gamemodeEasy(){setGamemode(GameMode.EASY)}
  function gamemodeHard(){setGamemode(GameMode.HARD)}
  function gamemodeGodly(){setGamemode(GameMode.GODLY)}
  function handleInputChange(e: React.FormEvent<HTMLInputElement>){ setInputVal(e.currentTarget.value.toUpperCase()) }
  function handleOptionClick(e: React.FormEvent<HTMLButtonElement>){ setInputVal(e.currentTarget.value)}
  function checkSubmit(e: any){if(e && e.keyCode === 13){submitAnswer()}}

  function startGame(){
    if (gamemode === GameMode.EASY) { createEasyGameData() } 
    else if (gamemode === GameMode.HARD) { createHardGameData() } 
    else { createGodlyGameData() }
    setIsSetupButtonsVisible(false)
    setCurrentIndex(0)
    setShowGame(true)
  }

  function createEasyGameData(){
    setGameData(GameData.map((stateData, index) => ({...stateData, completed: false, guess: "", order: index })).sort((a,b) => a.order - b.order))
  }

  function createHardGameData(){
    let stateNums = [...Array(50).keys()]
    setGameData(GameData.map((stateData) => {
      const randomStateNum = stateNums[Math.floor(Math.random()*stateNums.length)];
      stateNums = stateNums.filter( num => num !== randomStateNum )
      return ({ ...stateData, completed: false, guess: "", order: randomStateNum })
    }).sort((a,b) => a.order - b.order))
  }

  function createGodlyGameData(){
    return []
  }

  function submitAnswer(){
    const newGameData = gameData.map((stateInfo, index) => {
      if(index === currentIndex){
        return {
          ...stateInfo,
          guess: inputVal,
          completed: true
        }
      }
      return stateInfo
    })
    setGameData(newGameData)
    setInputVal('')
    if(currentIndex === 49){
      processResults(newGameData)
      setShowGame(false)
      setShowResults(true)
      setCurrentIndex(0)
    } else {
      setCurrentIndex(currentIndex + 1)
    }
    document.getElementById("abbr-input")?.focus();
  }

  function processResults(data: GData[]){
    const numResults = data.map(stateInfo => stateInfo.guess === stateInfo.abbr ? 1 : 0)
    //@ts-ignore
    const sum = numResults.reduce((partialSum, a) => partialSum + a, 0)
    setResultsData(sum)
  }

  function backToStart(){
    setGameData([])
    setResultsData(0)
    setCurrentIndex(0)
    setPlaystyle(PlayStyle.UNCHOSEN)
    setGamemode(GameMode.UNCHOSEN)
    setShowResults(false)
    setShowStart(true)
  }

  function generateOptions({ state, abbr }: GData){
    debugger
    const normalized = state.toUpperCase().replaceAll(" ", "")
    let answers = [abbr]
    while (answers.length < 3) {
      const potentialAnswer = normalized[0] + normalized[Math.floor(Math.random()*normalized.length)]
      if(!answers.includes(potentialAnswer)){answers.push(potentialAnswer)}
    }
    return shuffle(answers)
  }

  function shuffle(array: Array<any>) {
    var m = array.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array
  }
}

export default App;
