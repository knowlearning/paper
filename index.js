import { browserAgent } from '@knowlearning/agents'
import paper from 'paper'

window.paper = paper

window.Agent = browserAgent()

const statePromise = Agent.state('some-state')

function initializeRaster(id, state) {
  const { source, position } = state[id]
  const image = new paper.Raster(source)

  const { x, y } = position
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

function initializeItem(id, state) {
  if (state[id].type === 'raster') initializeRaster(id, state)
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
    state[id] = {
      type: 'raster',
      position,
      source: '/rose.png'
    }
    initializeItem(id, state)
  }
}
