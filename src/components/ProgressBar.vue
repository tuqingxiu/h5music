<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress"  ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent = "progressTouchStart"
           @touchmove.prevent = "progressTouchMove"
           @touchend = "progressTouchEnd"
      >
        <!-- <div class="progress-btn"></div> -->
        <img ref="progressBtn" class="progress-btn" src="../image/progress.gif" />
        <!-- <Zan class="progress-btn"></Zan> -->
      </div>
    </div>
  </div>
</template>
<script>
  // 进度条按钮宽度,由于style中没有设置width,因此只能用clientWidth获取
  export default {
    components: {
      // Zan
    },
    data() {
      return {
        btnWidth: {
          type: Number,
          default: 0
        },
        touchInfo: {
          initiated: false
        }
      }
    },
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    mounted() {
      
      // this.btnWidth = document.getElementsByClassName('progress-btn')[0].clientWidth
    //  console.log(this.btnWidth)
      // this.btnWidth = this.$refs.progressBtn.clientWidth
      this.btnWidth = 0
    },
    methods: {
      // 点击按钮
      progressTouchStart(e) {
        // 记录touch事件已经初始化
        this.touchInfo.initiated = true
        // 点击位置
        this.touchInfo.startX = e.touches[0].pageX
        // 点击时进度条长度
        this.touchInfo.left = this.$refs.progress.clientWidth
      },
      // 开始移动
      progressTouchMove(e) {
        if (!this.touchInfo.initiated) {
          return
        }
        // 计算移动距离
        const moveX = e.touches[0].pageX - this.touchInfo.startX
        // 设置偏移值
        const offsetWidth = Math.min(Math.max(0, this.touchInfo.left + moveX),
          this.$refs.progressBar.clientWidth - this.btnWidth)
        this._setOffset(offsetWidth)
      },
      // 移动结束
      progressTouchEnd(e) {
        this.touchInfo.initiated = false
        // 向父组件派发事件,传递当前百分比值
        this._triggerPercent()
      },
      // 进度条点击事件
      progressClick(e) {
        // 设置进度条及按钮偏移
        this._setOffset(e.offsetX)
        // 通知父组件播放进度变化
        this._triggerPercent()
      },
      _triggerPercent() {
        const barWidth = this.$refs.progressBar.clientWidth - this.btnWidth
        const percent = Math.min(1, this.$refs.progress.clientWidth / barWidth)
        this.$emit('percentChange', percent)
      },
      // 设置偏移
      _setOffset(offsetWidth) {
        // 设置进度长度随着百分比变化
        this.$refs.progress.style.width = `${offsetWidth}px`
        // 设置按钮随着百分比偏移
        // this.$refs.progressBtn.style.transform = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.progressBtn.style.webkitTransform = `translate3d(${offsetWidth}px, 0, 0)`
      }
    },
    watch: {
      // 监听歌曲播放百分比变化
      percent(newPercent, oldPercent) {
        if (newPercent > 0 && !this.touchInfo.initiated) {
          // 进度条总长度
          const barWidth = this.$refs.progressBar.clientWidth - this.btnWidth
          const offsetWidth = barWidth * newPercent
          // 设置进度条及按钮偏移
          this._setOffset(offsetWidth)
        }
      }
    }
  }
</script>
<style lang="less" scoped>
.progress-bar{
  height: 0.5rem;
  .bar-inner{
    position: relative;
      top: 0.2rem;
      height: 0.04rem;
      background: rgba(255, 255, 255, 0.3);
      .progress{
        position: absolute;
        height: 100%;
        background: #51a5fd;
      }
      .progress-btn-wrapper{
        position: absolute;
        // left: -0.25rem;
        left: -0.5rem;
        top: -0.25rem;
        width: 0.5rem;
        height: 0.5rem;
        .progress-btn{
          position: relative;
          // top: 0.12rem;
          // left: 0.12rem;
          left: 0.26rem;
          box-sizing: border-box;
          // width: 0.32rem;
          // height: 0.32rem;
          width:0.24rem;
        }
      }
        
  }
}
    
</style>