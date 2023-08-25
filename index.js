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
  bounds: true,
  selected: true
}

const onMouseDownHandlers = []
function onMouseDown(fn) { onMouseDownHandlers.push(fn) }
const onMouseUpHandlers = []
function onMouseUp(fn) { onMouseUpHandlers.push(fn) }
const onMouseDragHandlers = []
function onMouseDrag(fn) { onMouseDragHandlers.push(fn) }

function select(item) {
  if (selected) selected.selected = false
  selected = item
  if (selected) selected.selected = true
}

function makeDraggable(item, state) {
  let mode = null
  let originalPoint = null
  let originalScale = null

  onMouseDown(event => {
    if (selected !== item) return

    originalPoint = event.point
    originalScale = item.matrix.scaling

    const hitResult = paper.project.hitTest(event.point, hitOptions)
    if (!hitResult || hitResult.item !== item) {
      select(null)
    }
    else if (hitResult.type === 'bounds') {
      mode = "scale"
    }
    else mode = "drag"
  })

  onMouseUp(event => {
    mode = null
  })

  onMouseDrag(event => {
    if (selected !== item) return

    if (mode === "drag") {
      item.position = item.position.add(event.delta)
      const { x, y } = item.position
      state.position = { x, y }
    }
    else if (mode === "scale") {
      const center = item.position
      const to = event.point
      const scaleX = Math.abs((to.x - center.x) / (originalPoint.x - center.x))
      const scaleY = Math.abs((to.y - center.y) / (originalPoint.y - center.y))
      const scale = Math.max(
        scaleX/(item.matrix.scaling.x/originalScale.x),
        scaleY/(item.matrix.scaling.y/originalScale.y)
      )
      item.scale(scale)
      const { x, y } = item.matrix.scaling
      state.scale = [x, y]
    }
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
  paper.view.onMouseUp = event => onMouseUpHandlers.forEach(fn => fn(event))

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
    select(item)
  }
}
