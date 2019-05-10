<template>
    <div class="container" flex="dir:top main:justify">
        <div class="bg-blur" :style="`background-image:url(${bgUrl})`"></div>
        <div class="title">
            <img @click="closePage" src="../image/close.png" />
            <div class="name">{{currentMusic.musicName}}</div>
        </div>
        <div class="content">
            <mt-swipe :auto="0" ref="swipe" :defaultIndex="defaultIndex">
                <mt-swipe-item>
                  <div class="logo-wrapper" flex="main:center cross:center">
                    <div class="logo-box">
                      <img class="logo" :src="currentMusic.coverUrl" />
                    </div>
                  </div>
                  <img class="lrc-icon" @click="goLrc" src="../image/lrc.png" />
                </mt-swipe-item>
                <mt-swipe-item>
                  <LrcList :lrc="currentMusic.lrc" :playing="audio.playing" :currentTime="currentTime"></LrcList>
                </mt-swipe-item>
            </mt-swipe>
        </div>
        <div class="music">
            <audio ref="audio" class="dn" 
                :src="currentMusic.musicUrl" :preload="audio.preload"
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
                    ref="range"
                    v-model="rangeValue"
                    :min="0"
                    :max="audio.maxTime"
                    :step="1"
                    :bar-height="5"
                    @touchend = "progressTouchEnd"
                    >
                        <div slot="start">{{audio.currentTime|timeFilter}}</div>
                        <div slot="end">{{audio.maxTime|timeFilter}}</div>
                    </mt-range>
                </div>
                <div class="btn-box" flex="main:justify cross:center">
                  <img @click="addMonitor('1006',$event)" src="../image/zan.png" />
                  <div class="play-box" flex="main:justify cross:center">
                    <img @click="prev" src="../image/prev.png" />
                    <img class="play-btn" @click="togglePlaying" :src="playicon" />
                    <img @click="next" src="../image/next.png" />
                  </div>
                  <img @click="showMore" src="../image/more.png" />
                </div>
            </div>
        </div>
        <mt-popup
          v-model="popupVisible"
          position="bottom"
          class="music-list"
          >
          <MusicList :bgUrl="bgUrl" :list="musicList" :currentId="currentMusic.musicId"></MusicList>
        </mt-popup>
    </div>
</template>
<script>
/**
 * 1001打开小精灵，1002播放时长，1003下一首，1004上一首，1005关闭小精灵
 * 1006点赞，1007播放列表，1008拖拽进度条，1009查看歌词，1010从歌词返回
 * 1011分享次数，1012分享成功
 */
import {mapState, mapMutations} from "vuex";
import store from '../store';
import { Swipe, SwipeItem, Range,Popup } from 'mint-ui';
import moment from "moment";
import Tool from "../utils/Tool";
import Lyric from 'lyric-parser';
import LrcList from "../components/LrcList";
import MusicList from "../components/MusicList";

import pauseImg from "../image/pause.png";
import playImg from "../image/play.png";
import bgImg from "../image/bgImg.png";
export default {
    components: {
      LrcList,
      MusicList
    },
    data() {
        return {
          popupVisible: false,
          musicList: [],
          backGroundList: [],
          defaultIndex: 0,//swipe,默认页数
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
            musicId: '',
            lrcObj: {},//解析后的歌词对象
            lrc: '',//接口获取到的歌词
            musicName: '',//歌名
            musicUrl: '',//歌曲链接
            lrcurl: '',//歌词链接
            coverUrl: ''//logo地址
          }
        }
    },
    watch: {
      rangeValue(val){
        this.$refs.audio.currentTime = val
        // this.$refs.audio.play()
        // this.$nextTick(()=>{
        //   if(this.audio.currentTime === this.audio.maxTime) return
        //   if(val<this.audio.maxTime){
        //     this.$refs.audio.currentTime = val
        //   }else{
        //     this.audio.currentTime = val;
        //   }
        // })
      },
      //监听歌曲列表
      musicList(val){
        if(val[0]){
          Object.assign(this.currentMusic,val[0])
          this.getLyric()
        }
      },
      showMusicList(val){
        this.popupVisible = val
      },
      //选中的歌曲,歌曲变化时
      selectMusic(val){
        console.log('改变')
        Object.assign(this.currentMusic,val)
        //暂停歌曲
        this.audio.playing = false
        this.rangeValue = 0
        //
        this.$nextTick(()=>{
          this.getLyric()
          this.$refs.audio.play();
        })
      },
      //监听当前播放时间，判断当前歌曲是否播放完毕
      currentTime(val){
        if(val/1000 >= this.audio.maxTime-1){
          console.log('播放完毕')
          this.next()
        }
      }
    },
    filters: {
        //时间过滤,value为秒
        timeFilter(value){
            return moment(value*1000).format('mm:ss')
        }
    },
    computed: {
      ...mapState({
          showMusicList: ({common}) => common.showMusicList,
          selectMusic: ({common}) => common.selectMusic,
      }),
      currentTime: function(){
        return this.audio.currentTime*1000
      },
      playicon: function(){
        if(this.audio.playing){
          return pauseImg
        }else{
          return playImg
        }
      },
      bgUrl: function(){
        let list = this.backGroundList[0]
        return list&&list.fileUrl||bgImg
      },
      //当前歌曲下标，第几首
      currentIndex: function(){
        let index = this.musicList.findIndex(item=>{
          return item.musicId === this.currentMusic.musicId
        })
        return index;
      }
    },
    created(){
      // this.getLyric()
      //获取歌曲列表
      this.getMusicList()
    },
    methods: {
      ...mapMutations({
          setVisible: 'SHOW_MUSIC_LIST',//列表显示状态
          toggleMusic: 'SELECT_MUSIC',//切换歌曲
      }),
      //获取歌曲列表
      getMusicList(){
        let self = this;
        Tool.get('baseController/getMusicList',{},data=>{
          if(data.musicList){
            // self.musicList = data.musicList
            data.musicList[0].musicId = '0'
            data.musicList[3].musicId = '1'
            data.musicList[1].musicId = '2'
            data.musicList[2].musicId = '3'
            
            data.musicList[0].musicName = '0000'
            data.musicList[3].musicName = '1111'
            data.musicList[1].musicName = '2222'
            data.musicList[2].musicName = '3333'
            
            self.musicList = [data.musicList[0],data.musicList[3],data.musicList[1],data.musicList[2]]
          }
          if(data.backGroundList){
            self.backGroundList = data.backGroundList
          }
        })
      },
      //数据监听http://127.0.0.1:9089/baseController/addMonitor
      addMonitor(type){
        Tool.post('baseController/addMonitor',{
          monitorCode: type||'1006',
          musicName: this.currentMusic.musicName,
          playTime: this.audio.currentTime
        },data=>{
          console.log(data)
        })
      },
      //显示列表
      showMore(){
        this.setVisible(true);
      },
      //跳转到词页面
      goLrc(){
        this.defaultIndex = 1
        let swipe = this.$refs.swipe
        swipe.swipeItemCreated()
      },
      //放开进度条
      progressTouchEnd(){
        console.log('--------------touchend')
      },
      //手动播放、暂停
      togglePlaying(){
        this.audio.playing = !this.audio.playing
        let audio = this.$refs.audio;
        this.audio.playing?audio.play():audio.pause()
      },
      //重新加载歌曲
      reLoad(){
        this.$refs.audio.load();
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
        this.audio.currentTime = res.target.currentTime
        this.sliderTime = parseInt(this.audio.currentTime / this.audio.maxTime * 100)
      },
      // 当加载语音流元数据完成后，会触发该事件的回调函数
      // 语音元数据主要是语音的长度之类的数据
      onLoadedmetadata(res) {
        this.audio.waiting = false;
        this.audio.maxTime = parseInt(res.target.duration);
        this.$emit("loading-true",11);
      },
      getLyric(){
        let url = this.currentMusic.lrcurl
        Tool.getAbsolute(url,{},data=>{
          let obj = new Lyric(data,this.handleLyric)
          this.currentMusic.lrcObj = obj
          this.currentMusic.lrc = data
        })
      },
      handleLyric(){},
      //关闭网页
      closePage(){
        window.location.href += '#closeWindow'
      },
      //上一首
      prev(){
        this.addMonitor('1004')
        if(this.currentIndex > 0){
          this.toggleMusic(this.musicList[this.currentIndex-1])
        }else{
          let lastIndex = this.musicList.length-1;
          this.toggleMusic(this.musicList[lastIndex])
        }
      },
      //下一首
      next(){
        this.addMonitor('1003')
        let lastIndex = this.musicList.length-1;
        if(this.currentIndex<lastIndex){
          this.toggleMusic(this.musicList[this.currentIndex+1])
        }else{
          this.toggleMusic(this.musicList[0])
        }
        this.audio.currentTime = 0
      }
    }
}
</script>
<style>
.v-modal{
  opacity: 0;
}
</style>
<style lang="less" scoped>
.music-list{
  width: 100%;
  height: 100%;
  max-width: 800px;
}
.container{
    overflow-x: hidden;
    height: 100vh;
    .title{
      position: absolute;
      width: 100%;
      top: 0;
      margin: .25rem 0 0 0;
      font-size: .36rem;
      text-align: center;
      color: #fff;
      img{
          width:0.48rem;
          padding:0 .1rem;
          margin-right: .1rem;
          position: absolute;
          left: .35rem;
          top: 50%;
          transform: translateY(-50%);
      }
      .name{
        width: 70%;
        margin-left: 15%;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
      }
  }
}
.content{
    width: 100%;
    height: 75%;
    padding-top: .65rem;
    .logo-wrapper{
      width: 100%;
      height: 100%;
      .logo-box{
        width: 3.04rem;
        height: 3rem;
        border: .02rem solid #51A5fd;
        padding: .1rem;
        border-radius: 1.52rem;
        background-color: rgba(81,165,253,.2);
        .logo{
          width: 100%;
          height: 100%;
          border-radius: 1.5rem;
          border: .03rem solid #51A5fd;
          box-shadow: #51A5fd;
        }
      }
    }
    .lrc-icon{
      width: .40rem;
      position: absolute;
      right: .45rem;
      bottom: .32rem;
    }
}
.music{
  padding: 0 0.45rem;
    width: 100%;
    .audio-box{
      .btn-box{
        margin: 0.2rem 0 0.3rem;
        .play-box{
          width: 50%;
        }
        img{
          width: 0.36rem;
        }
        img.play-btn{
          width: 0.62rem;
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

.logo-box{
  -webkit-transition-property: -webkit-transform;
    -webkit-transition-duration: 1s;
    -moz-transition-property: -moz-transform;
    -moz-transition-duration: 1s;
    -webkit-animation: rotate 3s linear infinite;
    -moz-animation: rotate 3s linear infinite;
    -o-animation: rotate 3s linear infinite;
    animation: rotate 3s linear infinite;
}
@-webkit-keyframes rotate{from{-webkit-transform: rotate(0deg)}
    to{-webkit-transform: rotate(360deg)}
}
@-moz-keyframes rotate{from{-moz-transform: rotate(0deg)}
    to{-moz-transform: rotate(359deg)}
}
@-o-keyframes rotate{from{-o-transform: rotate(0deg)}
    to{-o-transform: rotate(359deg)}
}
@keyframes rotate{from{transform: rotate(0deg)}
    to{transform: rotate(359deg)}
}
</style>
