<template>
    <div class="container" flex="dir:top main:justify">
        <div class="bg-blur" :style="`background-image:url(${bgUrl})`"></div>
        <div class="content">
            <mt-swipe :auto="0" ref="swipe" :defaultIndex="defaultIndex">
                <mt-swipe-item>
                  <div @click="goLrc">词</div>
                </mt-swipe-item>
                <mt-swipe-item>
                  <LrcList :lrc="currentMusic.lrc" :playing="audio.playing"></LrcList>
                </mt-swipe-item>
            </mt-swipe>
        </div>
        <div class="music">
            <audio ref="audio" class="dn" 
                :src="url" :preload="audio.preload"
                @play="onPlay" 
                @error="onError"
                @waiting="onWaiting"
                @pause="onPause" 
                @timeupdate="onTimeupdate"
                @loadedmetadata="onLoadedmetadata"
                ></audio>
            <div class="audio-box">
                <div class="progress-box">
                    <mt-range
                    v-model="rangeValue"
                    :min="0"
                    :max="audio.maxTime"
                    :step="3"
                    :bar-height="5">
                        <div slot="start">{{audio.currentTime|timeFilter}}</div>
                        <div slot="end">{{audio.maxTime|timeFilter}}</div>
                    </mt-range>
                </div>
                <div class="btn-box" flex="main:justify cross:center">
                  <img src="../image/zan.png" />
                  <div class="play-box" flex="main:justify cross:center">
                    <img src="../image/prev.png" />
                    <img @click="togglePlaying" v-if="audio.playing" src="../image/pause.png" />
                    <img @click="togglePlaying" v-else src="../image/play.png" />
                    <img src="../image/next.png" />
                  </div>
                  <img src="../image/more.png" />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import {mapState, mapMutations} from "vuex";
import { Swipe, SwipeItem, Range } from 'mint-ui';
import moment from "moment";
import Tool from "../utils/Tool";
import Lyric from 'lyric-parser'
import LrcList from "../components/LrcList";
export default {
    components: {
      LrcList
    },
    data() {
        return {
          bgUrl: 'https://mall.changan.com.cn/goods-img/img/otherimg/pic/2018/10/08/10/1538965463488.png',
          defaultIndex: 1,//swipe,默认页数
          url: 'http://audio.xmcdn.com/group28/M00/BA/E2/wKgJXFswy3agW0S0AB6kqc2Lc6U457.m4a',
          audio: {
              currentTime: 0,
              maxTime: 0,
              playing: false,  //是否自动播放
              muted: false,   //是否静音
              speed: 1,
              waiting: true,
              preload: 'auto'
          },
          rangeValue: 0,
          currentMusic: {
            lrcObj: {},
            lrc: ''
          }
        }
    },
    watch: {
      rangeValue(val){
        this.$refs.audio.currentTime = val
      }
    },
    filters: {
        //时间过滤,value为秒
        timeFilter(value){
            return moment(value*1000).format('mm:ss')
        }
    },
    created(){
      this.getLyric()
    },
    methods: {
      //跳转到词页面
      goLrc(){
        this.defaultIndex = 1
        let swipe = this.$refs.swipe
        swipe.swipeItemCreated()
      },
      //手动播放、暂停
      togglePlaying(){
        this.audio.playing = !this.audio.playing
        let audio = this.$refs.audio;
        this.audio.playing?audio.play():audio.pause()
      },
      // 当音频暂停
      onPause () {
        this.audio.playing = false
      },
      // 当发生错误, 就出现loading状态
      onError () {
        this.audio.waiting = true
      },
      // 当音频开始等待
      onWaiting (res) {
        // console.log(res)
      },
      // 当音频开始播放
      onPlay (res) {
        // console.log(res)
        this.audio.playing = true
        this.audio.loading = false

        // if(!this.controlList.onlyOnePlaying){
        //   return 
        // }

        let target = res.target

        let audios = document.getElementsByTagName('audio');

        [...audios].forEach((item) => {
          if(item !== target){
            item.pause()
          }
        })
      },
      // 当timeupdate事件大概每秒一次，用来更新音频流的当前播放时间
      onTimeupdate(res) {
        // console.log('timeupdate')
        // console.log(res)
        this.audio.currentTime = res.target.currentTime
        // this.rangeValue = res.target.currentTime
        this.sliderTime = parseInt(this.audio.currentTime / this.audio.maxTime * 100)
      },
      // 当加载语音流元数据完成后，会触发该事件的回调函数
      // 语音元数据主要是语音的长度之类的数据
      onLoadedmetadata(res) {
        //  console.log('loadedmetadata')
        //  console.log(res)
        this.audio.waiting = false;
        this.audio.maxTime = parseInt(res.target.duration);
        
         //this.audio.maxTime = parseInt( this.$refs.audio.duration);
         console.log("总时间",this.$refs.audio.duration);
         
        this.$emit("loading-true",11);
      },
      getLyric(){
        let url = 'https://lyric.97ting.com/lyric/15/363/15363867-LRC-LRC.lrc?t=1547169930000'
        Tool.get(url,{},data=>{
          let obj = new Lyric(data,this.handleLyric)
          this.currentMusic.lrcObj = obj
          this.currentMusic.lrc = data
        })
        
      },
      handleLyric(){}
    }
}
</script>
<style lang="less" scoped>
.container{
    overflow-x: hidden;
    height: 100vh;
    
}
.content{
    width: 100%;
    height: 80%;
}
.music{
  padding: 0 0.2rem;
    width: 100%;
    .audio-box{
      .btn-box{
        margin: 0.2rem 0 0.3rem;
        .play-box{
          width: 40%;
        }
        img{
          width: 0.4rem;
          height: 0.4rem;
        }
      }
    }
}
.bg-blur {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(20px);
  z-index: -1;
}
</style>
