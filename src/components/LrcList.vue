<template>
<div class="wrapper" v-if="lrc && lrcObj && lrcObj.lines">
 <Scroll class="lyric-wrapper" ref="lyricList" :data="lrcObj && lrcObj.lines">
    <div class="lyric">
        <p v-for="(line,index) in lrcObj.lines" ref="lyricLine"
          :class="{'current':currentLineNum===index,'brother':index===currentLineNum-1||index===currentLineNum+1}"
          class="text" :key="index">{{line.txt}}</p>
    </div>
 </Scroll>
</div>
<div class="message" v-else>暂无歌词</div>
<!-- <div>{{lrc}}</div> -->
</template>

<script>
import Lyric from 'lyric-parser'
import Tool from "../utils/Tool"
import Scroll from "../components/Scroll"
export default {
  components: {
    Scroll
  },
  name: 'LrcList',
  props: {
    lrc: {
      type: String,
      default: ''
    },
    playing: {
      type: Boolean,
      default: false
    },
    currentTime: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      currentLineNum: 0,
      // scrollLine: 3,//默认多少行开始滚动
      lrcObj: '',//解析后的歌词对象
    }
  },
  watch: {
    playing: function(val){
      this.togglePlaying()
    },
    currentTime: function(val){
      this.setProgress(val)
    },
    lrc: function(val){
      if(!val) return
      if(this.lrcObj){
        this.lrcObj.stop()
      }
      this.$nextTick(()=>{
        this.getLyric()
        this.togglePlaying()
        this.currentLineNum = 0
      })
    }
  },
  computed: {
    lrcObj1: function(){
      if(this.lrc){
        let obj = new Lyric(this.lrc,this.handleLyric)
        return obj;
      }else{
        return ''
      }
    },
    //默认多少行开始滚动
    scrollLine: function(){
      let h1 = this.$refs.lyricList.$el.clientHeight
      let h2 = this.$refs.lyricLine[0].clientHeight
      let line = h1/h2;
      return Math.floor(line/2)
    }
  },
  filters: {
  },
  methods: {
    getLyric(){
      let obj = new Lyric(this.lrc,this.handleLyric)
      this.lrcObj = obj;
    },
    handleLyric({lineNum, txt}) {
      // console.log(lineNum)
        this.currentLineNum = lineNum
        // 若当前行大于5,开始滚动,以保歌词显示于中间位置
        if (lineNum > this.scrollLine) {
          let lineEl = this.$refs.lyricLine[lineNum - this.scrollLine]
          // 结合better-scroll，滚动歌词
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          // let lineEl = this.$refs.lyricLine[lineNum]
          // this.$refs.lyricList.scrollToElement(0, 0, 1000)
          let lineEl = this.$refs.lyricLine[lineNum]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
        }
        
    },
    togglePlaying: function(){
      if(this.playing){
        this.lrcObj && this.lrcObj.play()
      }else{
        this.lrcObj && this.lrcObj.stop()
      }
    },
    setProgress(time){
      this.lrcObj && this.lrcObj.seek(time)
      this.togglePlaying()
    }
  }
}
</script>

<style lang="less" scoped>
.wrapper{
  height: 100%;
  text-align: center;
  .lyric-wrapper{
    height: 100%;
    overflow: hidden;
    .text{
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.3rem;
      padding: 0.2rem 0;
    }
    .text.current{
      color: #fff;
      font-size: 0.36rem;
    }
    .text.brother{
      color: rgba(255, 255, 255, 0.64);
    }
  }
}
.message{
  font-size: .30rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-top: 1.5rem;
}
</style>
