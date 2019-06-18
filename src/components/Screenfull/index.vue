<template>
  <div>
    <svg-icon :style="{fill:fill}" icon-class="screenfull" class-name="screenfull-svg" @click.native="click()" />
  </div>
</template>

<script>
import screenfull from 'screenfull'

export default {
  name: 'Screenfull',
  props: {
    width: {
      type: Number,
      default: 22
    },
    height: {
      type: Number,
      default: 22
    },
    fill: {
      type: String,
      default: null
    },
    screenfullName: {
      type: String,
      default: null
    }
  },
  methods: {
    click() {
      if (!screenfull.enabled) {
        this.$message({
          message: '您的浏览器不支持此功能',
          type: 'warning'
        })
        return false
      }
      if (this.screenfullName) {
        screenfull.toggle(document.querySelector('.' + this.screenfullName))
      } else {
        screenfull.toggle()
      }
    }
  }
}
</script>

<style scoped>
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #ffffff;
  width: 28px;
  height: 28px;
  vertical-align: -0.25em!important;
}
</style>
