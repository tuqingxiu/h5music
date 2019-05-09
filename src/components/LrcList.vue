<template>
<div v-if="lrcObj">
 <Scroll class="lyric-wrapper" ref="lyricList" :data="lrcObj && lrcObj.lines">
  <p v-for="(line,index) in lrcObj.lines" ref="lyricLine"
                   :class="{'current':currentLineNum===index}"
                   class="text" :key="index">{{line.txt}}</p>
 </Scroll>

  
</div>
</template>

<script>
import Lyric from 'lyric-parser'
import Tool from "../utils/Tool"
import Scroll from "../components/Scroll"
export default {
  name: 'LrcList',
  props: {
    lrc: {
      type: String,
      default: ''
    },
    playing: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      currentLineNum: 0
    }
  },
  watch: {
    playing: function(val){
      if(val){
        this.lrcObj && this.lrcObj.play()
      }else{
        this.lrcObj && this.lrcObj.stop()
      }
    }
  },
  computed: {
    lrcObj: function(){
      if(this.lrc){
        let obj = new Lyric(this.lrc,this.handleLyric)
        console.log(obj)
        return obj;
      }else{
        return ''
      }
    }
  },
  methods: {
    handleLyric({lineNum, txt}) {
      console.log(lineNum)
        this.currentLineNum = lineNum
        // 若当前行大于5,开始滚动,以保歌词显示于中间位置
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          // 结合better-scroll，滚动歌词
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollToElement(0, 0, 1000)
        }
    }
  }
}
</script>

<style scoped>

</style>
