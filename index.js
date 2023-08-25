import { browserAgent } from '@knowlearning/agents'
import paper from 'paper'
import { createApp } from 'vue'
import Outline from './outline.vue'

window.paper = paper
window.Agent = browserAgent()

const id = 'some-state-id'

let selected = null

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 10,
  bounds: true
}

const onMouseDownHandlers = []
function onMouseDown(fn) {
  onMouseDownHandlers.push(fn)
}

const onMouseDragHandlers = []
function onMouseDrag(fn) {
  onMouseDragHandlers.push(fn)
}

function select(item) {
  if (selected) selected.selected = false
  selected = item
  selected.selected = true
}

function makeDraggable(item, state) {

  onMouseDown(event => {
    if (selected !== item) return

    const hitResult = paper.project.hitTest(event.point, hitOptions)
    if (hitResult && hitResult.type === 'bounds') console.log(hitResult.name)
  })

  onMouseDrag(event => {
    if (selected !== item) return

    item.position = item.position.add(event.delta)
    const { x, y } = item.position
    state.position = { x, y }
  })
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

  image.onClick = () => select(image)
  return image
}

function initializeItem(id, state) {
  if (state[id].type === 'raster') return initializeRaster(id, state)
}

window.onload = async function() {
  const state = await statePromise

  createApp(Outline, { id, select: function(e) {
    console.log(e)
  } }).mount('#outline')

  const canvas = document.getElementById('canvas')
  paper.setup(canvas)

  paper.view.onMouseDown = event => onMouseDownHandlers.forEach(fn => fn(event))
  paper.view.onMouseDrag = event => onMouseDragHandlers.forEach(fn => fn(event))

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
    const item = initializeItem(name, state)
    console.log(item)
    select(item)
  }
}
