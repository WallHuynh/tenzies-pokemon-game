import { React, useEffect, useState, useRef, Children } from 'react'
import './App.css'
import Dice from './components/Dice'
import { nanoid } from 'nanoid'
import Confetti from 'react-confetti'
import { useStopwatch } from 'react-timer-hook'

function App() {
  const [diceNum, setDiceNum] = useState(allNewDice())
  const [tenzies, setTenzies] = useState(newtenzies())
  const [rollTimes, setRollTimes] = useState(15)
  const [bestRecord, setBestRecord] = useState(0)
  const records = useRef([])
  const { seconds, minutes, hours, days, isRunning, start, pause, reset } =
    useStopwatch({})

  const resetRecord = () => {
    window.localStorage.removeItem('record')
    setBestRecord(0)
  }

  useEffect(() => {
    if (localStorage.getItem('record') !== null) {
      console.log(`its exists`)
      console.log(window.localStorage.getItem('record'))
      console.log(JSON.parse(window.localStorage.getItem('record')).record)
      setBestRecord(JSON.parse(window.localStorage.getItem('record')).record)
    } else {
      console.log(`its not found`)
      setBestRecord(0)
    }
  }, [])

  //use no method parameters
  useEffect(() => {
    const isAllHold = diceNum.every(die => die.isHeld)
    const firstElement = diceNum[0].value
    const isAllSame = diceNum.every(die => firstElement === die.value)
    if (isAllSame && isAllHold) {
      setTenzies(prev => {
        return { ...prev, isWon: true }
      })
      isRunning && pause()
      findBestRecord()
    }
  }, [diceNum])

  // // use method with parameters
  // useEffect(() => {
  //   setTenzies(diceNum.every(calWinner))
  // }, [diceNum])

  // function calWinner(el, index, arr) {
  //   if (el.isHeld === false) {
  //     return false
  //   }
  //   if (index === 0) {
  //     return true
  //   } else {
  //     return el.value === arr[index - 1].value
  //   }
  // }

  useEffect(() => {
    if (rollTimes === 0) {
      const firstElement = diceNum[0].value
      const isAllSame = diceNum.every(die => firstElement === die.value)
      if (isAllSame) {
        setTenzies(prev => ({
          ...prev,
          isLost: false,
        }))
      } else {
        isRunning && pause()
        setTenzies(prev => ({
          ...prev,
          isLost: true,
        }))
      }
    }
    // ???????????????????????????
    // const isWon = tenzies.isWon
    // const isLost = tenzies.isLost
    // if (isWon && isLost) {
    //   setTenzies(prev => ({
    //     ...prev,
    //     isLost: !prev.isLost,
    //   }))
    // }
  }, [rollTimes])

  const findBestRecord = () => {
    records.current.push(seconds)
    const theBest = Math.min(...records.current)
    setBestRecord(theBest)
    const value = { record: theBest }
    window.localStorage.setItem('record', JSON.stringify(value))
  }

  function newtenzies() {
    return {
      isWon: false,
      isLost: false,
    }
  }

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    }
  }

  function allNewDice() {
    const numArray = []
    for (let i = 0; i < 10; i++) {
      numArray.push(generateNewDie())
    }
    return numArray
  }

  function newGame(e) {
    if (e.target.textContent === 'New game') {
      setDiceNum(allNewDice())
      setTenzies(newtenzies())
      setRollTimes(15)
      reset(() => {
        const stopwatchOffset = new Date()
        stopwatchOffset.setSeconds(stopwatchOffset.getSeconds())
      }, false)
    } else {
      if (isRunning) {
        setDiceNum(allNewDice())
        setTenzies(newtenzies())
        setRollTimes(15)
        reset(() => {
          const stopwatchOffset = new Date()
          stopwatchOffset.setSeconds(stopwatchOffset.getSeconds())
        }, false)
      }
    }
  }

  const handleRoll = e => {
    if (e.target.textContent === 'Roll') {
      setDiceNum(oldDice =>
        oldDice.map(die => {
          return die.isHeld ? die : generateNewDie()
        })
      )
      if (isRunning && rollTimes > 0) {
        setRollTimes(prev => prev - 1)
      }
    } else {
      newGame(e)
    }
  }

  // //this is method 1
  // const handleHold = id => {
  //   setDiceNum(oldDice =>
  //     oldDice.map(die => {
  //       return {
  //         ...die,
  //         isHeld: id === die.id ? !die.isHeld : die.isHeld,
  //       }
  //     })
  //   )
  // }

  // this is method 2
  const handleHold = id => {
    !isRunning && start()
    setDiceNum(oldDice =>
      oldDice.map(die => {
        return id === die.id ? { ...die, isHeld: !die.isHeld } : die
      })
    )
  }

  // // this is method 3 for loop
  // const handleHold = id => {
  //   const anArray = []
  //   for (let i = 0; i < diceNum.length; i++) {
  //     const currDice = diceNum[i]
  //     if (id !== currDice.id) {
  //       anArray.push(currDice)
  //     } else {
  //       const newObject = {
  //         value: currDice.value,
  //         isHeld: !currDice.isHeld,
  //         id: currDice.id,
  //       }
  //       anArray.push(newObject)
  //     }
  //   }
  //   setDiceNum(anArray)
  // }

  const diceElements = diceNum.map(die => (
    <Dice
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      handleHold={() => handleHold(die.id)}
    />
  ))

  const style = {
    width: '450px',
    height: '450px',
    borderRadius: '20px',
  }
  return (
    <div className='main'>
      {tenzies.isWon && <Confetti style={style} />}
      <div className='game-record'>
        <span className='playing-inf'>
          Best record: <strong>{bestRecord}</strong> seconds
        </span>
        <button className='btn-reset' onClick={resetRecord}>
          Reset record
        </button>
      </div>
      <div className='game-timeline'>
        <span className='playing-inf'>
          Time out: <strong>{seconds}</strong> seconds
        </span>
        <span className='playing-inf'>
          Roll times left: <strong>{rollTimes}</strong>
        </span>
        <button className='btn-stop' onClick={newGame}>
          Try again
        </button>
      </div>
      <div className='game-intro'>
        <h1 className='die-num'>Tenzies Pokemon</h1>
        <h4>
          Roll until all dice are the same. Click each die to freeze it at its
          current pokemon between rolls.
        </h4>
      </div>

      <div className='container'>{diceElements}</div>

      <button className='btn-roll' onClick={handleRoll}>
        {tenzies.isWon || tenzies.isLost ? 'New game' : 'Roll'}
      </button>

      {/* {tenzies.isWon ? (
        <button className='btn-roll' onClick={newGame}>
          New game
        </button>
      ) : (
        <button className='btn-roll' onClick={handleRoll}>
          Roll
        </button>
      )} */}

      {tenzies.isWon && <h1 className='win-label'>You are the winner!!</h1>}
      {tenzies.isLost && <h1 className='win-label'>Game over :333</h1>}
    </div>
  )
}

export default App
