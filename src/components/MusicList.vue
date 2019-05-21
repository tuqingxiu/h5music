<template>
<div class="list">
    <div class="bg-blur" :style="`background-image:url(${bgUrl})`">
        <div class="bg-mask"></div>
    </div>
    <div class="content">
        <div class="title" flex="dir:left cross:center">
            <img @click="goBack" src="../image/back.png" />
            <span>歌曲列表</span>
        </div>
        <div class="wrapper">
            <Scroll class="item-wrapper" ref="lyricList" :data="list">
                <div>
                    <!-- <p v-for="(line,index) in lrcObj.lines" ref="lyricLine"
                    :class="{'current':currentLineNum===index,'brother':index===currentLineNum-1||index===currentLineNum+1}"
                    class="text" :key="index">{{line.txt}}</p> -->
                    <div @click="selectItem(index,$event)" v-for="(item,index) in list"
                    :class="{'current':currentId===item.musicId}"
                     class="item" :key="index"  flex="dir:left cross:center">
                        <Jump1 class="jumpicon" v-if="currentId===item.musicId" :playing="playing && showMusicList"></Jump1>
                        <span v-else>{{index+1}}.</span>
                        <span class="name">{{item.musicName}}</span>
                    </div>
                </div>
            </Scroll>
        </div>
    </div>
    
</div>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import store from '../store';
import Scroll from "../components/Scroll"
import Jump1 from "../components/Jump1"
export default {
    components: {
        Scroll,
        Jump1
    },
    props: {
        bgUrl: {
            type: String,
            default: ''
        },
        list: {
            type: Array,
            default: []
        },
        currentId: {
            type: String,
            default: ''
        },
        playing: {
            type: Boolean,
            default: false
        },
    },
    data(){
        return {
        }
    },
    computed: {
        ...mapState({
            // countList: ({maintainitem}) => maintainitem.countList,
            showMusicList: ({common}) => common.showMusicList
        })
    },
    methods: {
        ...mapMutations({
            setVisible: 'SHOW_MUSIC_LIST',//列表显示状态
            selectMusic: 'SELECT_MUSIC',//选择某项
        }),
        goBack(){
            this.setVisible(false);
        },
        selectItem(index,e){
            this.selectMusic(this.list[index])
            this.goBack()
        }
    }
}
</script>
<style lang="less" scoped>
.bg-blur {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  width: 110%;
  height: 110%;
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
.list{
    width: 100%;
    height: 100%;
    .content{
        padding: 0 .45rem;
        color: #fff;
        height: 100%;
    }
}
.title{
    position: absolute;
    width: 100%;
    top: 0;
    left: 1.2rem;
    margin: .35rem 0;
    font-size: .34rem;
    img{
        width:0.38rem;
        padding:0 .1rem;
        margin-right: .2rem;
    }
}
.wrapper{
    height: 100%;
    padding-top: .9rem;
    .item-wrapper{
        height: 100%;
        overflow: hidden;
    }
    .item{
        padding: .35rem 0;
        color: #fff;
        font-size: .36rem;
        .name{
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            margin-left: .05rem;
        }
    }
    .item.current{
        color: #51a5fd;
        .jumpicon{
            width: .36rem;
        }
        .name{
            margin-left: .1rem;
        }
    }
}
</style>
