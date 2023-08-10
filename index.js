import { browserAgent } from '@knowlearning/agents'
import paper from 'paper'

window.Agent = browserAgent()

const statePromise = Agent.state('some-state')

function initializeItem(id, state) {
  const image = new paper.Raster('/rose.png')

  const { x, y } = state[id].position
  image.position = { x, y }

  image.scale(0.5)

  image.onMouseDrag = event => {
    image.position = image.position.add(event.delta)
    const { x, y } = image.position
    state[id].position = { x, y }
  }

  image.onDoubleClick = async event => {
    event.stopPropagation()
    image.remove()
    delete state[id]
  }
}

window.onload = async function() {
  const state = await statePromise
  const canvas = document.getElementById('myCanvas')
  paper.setup(canvas)

  Object
    .keys(state)
    .forEach(id => initializeItem(id, state))

  paper.view.onDoubleClick = ({ point: { x, y } }) => {
    const id = Agent.uuid()
    const position = { x, y }
    state[id] = { position }
    initializeItem(id, state)
  }
}
