<template>
    <div class="container" flex="dir:top main:center">
        <div class="bg-blur" :style="`background-image:url(${bgUrl})`">
          <div class="bg-mask"></div>
        </div>
        <div class="title">
            <img class="back-icon" v-if="defaultIndex === 1" @click="toggleSwipe(0,$event)" src="../image/back.png" />
            <!-- <img v-else @click="closePage" src="../image/close.png" /> -->
            <div class="name">{{currentMusic.musicName}}</div>
        </div>
        <div class="content" flex-box="1">
            <mt-swipe :auto="0" ref="swipe" 
            :defaultIndex="defaultIndex" 
            @change="handleChange"
            :showIndicators="false">
                <mt-swipe-item>
                  <div class="logo-wrapper" flex="main:center cross:center">
                    <div class="logo-box" :class="{'active': audio.playing}">
                      <img class="logo" :src="logoUrl" :onerror="logoUrl" />
                    </div>
                  </div>
                  <img class="lrc-icon" @click="toggleSwipe(1,$event)" src="../image/lrc.png" />
                </mt-swipe-item>
                <mt-swipe-item>
                  <LrcList :lrc="currentMusic.lrc" :playing="audio.playing" :currentTime="currentTime"></LrcList>
                </mt-swipe-item>
            </mt-swipe>
        </div>
        <div class="music">
            <audio ref="audio" class="dn" 
                :src="currentMusic.musicUrl" :preload="audio.preload"
                autoplay="autoplay"
                @play="onPlay" 
                @error="onError"
                @waiting="onWaiting"
                @pause="onPause" 
                @timeupdate="onTimeupdate"
                @loadedmetadata="onLoadedmetadata"
                ></audio>
            <div class="audio-box">
                <div class="progress-wrapper" flex="dir:left main:justify cross:center">
                    <span class="time time-l">{{audio.currentTime|timeFilter}}</span>
                    <div class="progress-bar-wrapper" flex-box="1">
                      <ProgressBar :percent="percent" @percentChange="setProgress"></ProgressBar>
                    </div>
                    <span class="time time-r">{{audio.maxTime|timeFilter}}</span>
                </div>
                <div class="btn-box" flex="main:justify cross:center">
                  <img class="zanimg" @click="addMonitor('1006',$event)" :src="zanicon" />
                  <!-- <Zan class="zanimg" @click="addMonitor('1006',$event)"></Zan> -->
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
          position="right"
          class="music-list"
          >
          <MusicList :bgUrl="bgUrl" :list="musicList" 
          :currentId="currentMusic.musicId" 
          :playing="audio.playing"></MusicList>
        </mt-popup>
    </div>
</template>
<script>
/**
 * 1001打开小精灵，1002播放时长，1003下一首*，1004上一首*，1005关闭小精灵
 * 1006点赞*，1007播放列表，1008拖拽进度条，1009查看歌词，1010从歌词返回
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
import ProgressBar from "../components/ProgressBar";
import Zan from '../components/zan';//点赞前动图

import pauseImg from "../image/pause.png";
import playImg from "../image/play.png";
import bgImg from "../image/bgImg.png";
// import zanImg from "../image/zan.png";
// import zanedImg from "../image/zaned.png";
import zanImg from "../image/zan.gif?id=12";
import zanedImg from "../image/zaned.gif?id=12";
import logoImg from "../image/logo.png";


export default {
    components: {
      LrcList,
      MusicList,
      ProgressBar,
      Zan
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
          currentMusic: {
            isZan: false,//默认未点赞
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
        Object.assign(this.currentMusic,{
          isZan: false,
          musicId: '',
          lrcObj: {},
          lrc: '',
        },val)
        //暂停歌曲
        this.audio.playing = false
        this.audio.currentTime = 0
        //
        this.$nextTick(()=>{
          this.getLyric()
          this.$refs.audio.play();
        })
      },
      //监听当前播放时间，判断当前歌曲是否播放完毕
      currentTime(val){
        if(val/1000 === this.audio.maxTime){
          this.next('auto')
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
      logoUrl: function(){
        return this.currentMusic.coverUrl || logoImg
        // return this.currentMusic.coverUrl
      },
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
      zanicon: function(){
        if(this.currentMusic.isZan){
          return zanedImg
        }else{
          return zanImg
        }
      },
      bgUrl: function(){
        let list = this.backGroundList[0]
        // return list&&list.fileUrl||bgImg
        return list&&list.fileUrl
      },
      //当前歌曲下标，第几首
      currentIndex: function(){
        let index = this.musicList.findIndex(item=>{
          return item.musicId === this.currentMusic.musicId
        })
        return index;
      },
      //进度条百分比
      percent() {
        return Math.min(1, this.audio.currentTime / this.audio.maxTime)
      }
    },
    created(){
      //进入该页面
      this.addMonitor('1001')
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
        // self.musicList = [{
        //   musicName: '1212',//歌名
        //   musicUrl: '',//歌曲链接
        //   lrcurl: '',//歌词链接
        //   coverUrl: ''//logo地址
        // }]
        Tool.get('getMusicList',{},data=>{
          if(data.musicList){
            self.musicList = data.musicList
            data.musicList[0].lrcurl = ''
          }
          if(data.backGroundList){
            self.backGroundList = data.backGroundList
          }
        })
      },
      //数据监听http://127.0.0.1:9089/baseController/addMonitor
      addMonitor(type){
        let newTime = new Date().getTime();
        //1s内同一个统计，同一首歌曲，只统计一次，防止页面卡顿时，按钮重复统计
        if(this.preStatisTime&&this.preStatisType===type
        &&(newTime-this.preStatisTime<1000)
        &&this.preStatisName&&this.currentMusic.musicName){
          return;
        }else{
          this.preStatisType = type;
          this.preStatisTime = newTime;
          this.preStatisName = this.currentMusic.musicName;
        }
        
        let self = this
        if(type === '1006' && this.currentMusic.isZan){
          console.log('已经点赞了')
          return
        }
        if(!this.currentMusic.musicId && type !=='1001'){
          return
        }
        let data = {
          "monitorCode": type||'1006',
          "musicName": this.currentMusic.musicName,
          "playTime": this.audio.currentTime
        }
        if(data.playTime > this.audio.maxTime){
          data.playTime = this.audio.maxTime;
        }
        
        console.log('code='+data.monitorCode+',name='+data.musicName
        +',time='+data.playTime+',allTimge='+this.audio.maxTime)
        Tool.post('addMonitor',JSON.stringify(data),data=>{
          if(data === 'ok' && type === '1006'){
            //点赞成功
            self.musicList[self.currentIndex].isZan = true
            self.currentMusic.isZan = true;
          }
          // console.log(type+data)
        })
      },
      //显示列表
      showMore(){
        this.setVisible(true);
        //播放列表
        this.addMonitor('1007');
      },
      //跳转到词页面,返回  0返回，1到词页面
      toggleSwipe(type,e){
        if(type === 0){
          this.addMonitor('1010')
        }else{
          this.addMonitor('1009')
        }
        this.defaultIndex = type
        let swipe = this.$refs.swipe
        swipe.swipeItemCreated()
      },
      //进度条
      setProgress(val){
        this.$refs.audio.currentTime = val*this.audio.maxTime;
        this.addMonitor('1008')
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
        this.audio.playing = true
        this.audio.loading = false

        // if(!this.controlList.onlyOnePlaying){
        //   return 
        // }
        let target = res.target || res.currentTarget

        let audios = document.getElementsByTagName('audio');

        [...audios].forEach((item) => {
          if(item !== target){
            item.pause()
          }
        })
      },
      // 当timeupdate事件大概每秒一次，用来更新音频流的当前播放时间
      onTimeupdate(res) {
        this.audio.currentTime = res.target ? res.target.currentTime : res.currentTarget.currentTime
        this.sliderTime = parseInt(this.audio.currentTime / this.audio.maxTime * 100)
      },
      // 当加载语音流元数据完成后，会触发该事件的回调函数
      // 语音元数据主要是语音的长度之类的数据
      onLoadedmetadata(res) {
        this.audio.waiting = false;
        this.audio.maxTime = parseInt(res.target ? res.target.duration : res.currentTarget.duration);
        this.$emit("loading-true",11);
      },
      getLyric(){
        let url = this.currentMusic.lrcurl
        if(!url) return
        Tool.getAbsolute(url,{},data=>{
          let obj = new Lyric(data,this.handleLyric)
          this.currentMusic.lrcObj = obj
          this.currentMusic.lrc = data
        })
      },
      handleLyric(){},
      //关闭网页
      closePage(){
        let href = window.location.href;
        if(href.indexOf('#closeWindow') < 0){
          this.addMonitor('1005')
          let newHref = href;
          if(href.indexOf('/#/')>0){
            let href1 = href.replace('/#/','/');
            newHref = href1 + '#closeWindow';
          }else{
            newHref = href + '#closeWindow';
          }
          window.location.href = newHref;
        }
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
      //下一首type:auto自动播放下一首
      next(type){
        if(type === 'auto'){
          this.addMonitor('1002')
        }else{
          this.addMonitor('1003')
        }
        
        let lastIndex = this.musicList.length-1;
        if(this.currentIndex<lastIndex){
          this.toggleMusic(this.musicList[this.currentIndex+1])
        }else{
          this.toggleMusic(this.musicList[0])
        }
        this.audio.currentTime = 0
      },
      //切换swipe
      handleChange(index){
        this.defaultIndex = index
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
}
.container{
    overflow-x: hidden;
    height: 100%;
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
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          -webkit-transform: translateY(-50%);
      }
      img.back-icon{
        width: 0.38rem;
        padding: 0 0.1rem;
        margin-right: 0.1rem;
      }
      .name{
        width: 60%;
        margin-left: 20%;
        // padding-left: .5rem;
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
        width: 3rem;
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
        // margin: 0.2rem 0 0.3rem;
        .play-box{
          width: 50%;
        }
        img{
          width: 0.36rem;
        }
        img.play-btn{
          width: 0.62rem;
        }
        img.zanimg{
          width: 1rem;
        }
      }
    }
}
.bg-blur {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  -webkit-filter: blur(5px);
  filter: blur(5px);
  z-index: -1;
  background-color: #3f67a1;
  .bg-mask{
    width:100%;
    height: 100%;
    background-color: rgba(0,0,0,.56);
  }
}

.logo-box.active{
  -webkit-transition-property: -webkit-transform;
    -webkit-transition-duration: 2s;
    -moz-transition-property: -moz-transform;
    -moz-transition-duration: 2s;
    -webkit-animation: rotate 10s linear infinite;
    -moz-animation: rotate 10s linear infinite;
    -o-animation: rotate 10s linear infinite;
    animation: rotate 10s linear infinite;
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

.progress-wrapper{
  display: flex;
  .time{
    font-size: 0.28rem;
    color: rgba(255, 255, 255, .5)
  }
  .progress-bar-wrapper{
    margin: 0 .2rem;
  }      
}
          
</style>
