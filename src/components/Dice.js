import React from 'react'

export default function Dice(props) {
  const style = {
    backgroundColor: props.isHeld ? 'rgb(3, 83, 50)' : 'rgb(172, 212, 179)',
  }
  return (
    <div style={style} className='die-box' onClick={props.handleHold}>
      <img className='icons' src={'images/' + props.value + '.png'} />
    </div>
  )
}
