import { browserAgent } from '@knowlearning/agents'
import paper from 'paper'
import { createApp } from 'vue'
import Outline from './outline.vue'

window.paper = paper
window.Agent = browserAgent()

const id = 'some-state-id'

function makeDraggable(item, state) {
  item.onMouseDrag = event => {
    item.position = item.position.add(event.delta)
    const { x, y } = item.position
    state.position = { x, y }
  }
}

const statePromise = Agent.state(id)

function initializeRaster(id, state) {
  const { source, position, scale } = state[id]
  const image = new paper.Raster(source)

  const { x, y } = position
  image.position = { x, y }

  image.scale(scale)

  makeDraggable(image, state[id])

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

  createApp(Outline, { id, select: function(e) {
    console.log(e)
  } }).mount('#outline')

  const canvas = document.getElementById('canvas')
  paper.setup(canvas)

  Object
    .keys(state)
    .forEach(id => initializeItem(id, state))
  
  function uniqueSuffix(prefix) {
    let num = 1
    while (state[`${prefix} ${num}`]) num += 1
    return `${prefix} ${num}`
  }

  paper.view.onDoubleClick = ({ point: { x, y } }) => {
    const name = uniqueSuffix('Object')
    const position = { x, y }
    state[name] = {
      type: 'raster',
      position,
      source: '/rose.png',
      scale: 1
    }
    initializeItem(name, state)
  }
}
