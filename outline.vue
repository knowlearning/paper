<template>
  <div
    class="outline"
    :style="{
      left: `${x}px`,
      top: `${y}px`
    }"
  >
    <div
      class="drag-handle"
      @mousedown="startDrag"
    >
      drag handle
    </div>
    <div v-for="name in orderedNames">
      <div
        class="item"
        @click="select(name)"
      >
        <img class="preview" :src="state[name].source">
        <div>
          {{ name }}
        </div>
      </div>
      <div v-if="open[name]">
        {{ state[name] }}
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    props: {
      id: String
    },
    data() {
      return {
        state: null,
        x: 8,
        y: 8,
        open: {}
      }
    },
    created() {
      this.unwatch = Agent.watch(this.id, ({ state }) => this.state = state)
    },
    unmounted() {
      this.unwatch()
    },
    computed: {
      orderedNames() {
        if (!this.state) return []
        return Object.keys(this.state).sort()
      }
    },
    methods: {
      startDrag(e) {
        let lastX = e.pageX
        let lastY = e.pageY
        const drag = e => {
          const dx = e.pageX - lastX
          const dy = e.pageY - lastY
          this.x += dx
          this.y += dy
          lastX += dx
          lastY += dy
        }
        window.addEventListener('mousemove', drag)
        window.addEventListener('mouseup', () => {
          window.removeEventListener('mousemove', drag)
        })
      },
      select(name) {
        this.open[name] = !this.open[name]
      }
    }
  }

</script>

<style>

.outline
{
  position: absolute;
  user-select: none;
}

.item
{
  display: flex;
  align-items: center;
}

.preview
{
  display: inline-block;
  max-width: 24px;
  max-height: 24px;
  margin: 4px 8px;
}

</style>