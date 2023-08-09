import paper from 'paper'

window.onload = function() {
  var canvas = document.getElementById('myCanvas');
  paper.setup(canvas)

  var circle = new paper.Path.Circle({
    center: paper.view.center,
    radius: 50,
    fillColor: 'red'
  })

  circle.onMouseDrag = event => {
    circle.position = circle.position.add(event.delta)
  }

  circle.onMouseUp = event => {
    const target = {
      position: paper.view.center
    }
    circle.tweenTo(target, { duration: 300 })
  }

  paper.view.draw()
}
