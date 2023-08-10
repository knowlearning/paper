import paper from 'paper'

window.onload = function() {
  const canvas = document.getElementById('myCanvas');
  paper.setup(canvas)

  const circle = new paper.Path.Circle({
    center: paper.view.center,
    radius: 50,
    fillColor: 'red'
  })

  const image = new paper.Raster('/rose.png')

  image.position = paper.view.center
  image.scale(0.5)

  image.onMouseDrag = event => {
    image.position = image.position.add(event.delta)
  }

  image.onMouseUp = event => {
    const target = {
      position: paper.view.center
    }
    image.tweenTo(target, { duration: 300 })
  }

  paper.view.draw()
}
