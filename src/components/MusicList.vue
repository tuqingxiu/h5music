<template>
<div class="list">
    <div class="bg-blur" :style="`background-image:url(${bgUrl})`"></div>
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
                        <img v-if="currentId===item.musicId" src="../image/icon1.png" />
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
export default {
    components: {
        Scroll
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
        }
    },
    data(){
        return {

        }
    },
    computed: {
        ...mapState({
            // countList: ({maintainitem}) => maintainitem.countList,
            // showMusicList: ({common}) => common.showMusicList
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
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(20px);
  z-index: -1;
}
.list{
    width: 100%;
    height: 100%;
    .content{
        padding: 0 .2rem;
        color: #fff;
        height: 100%;
    }
}
.title{
    position: absolute;
    width: 100%;
    top: 0;
    margin: .25rem 0;
    font-size: .34rem;
    img{
        width:0.38rem;
        padding:0 .1rem;
        margin-right: .1rem;
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
        img{
            width: .36rem;
        }
        .name{
            margin-left: .1rem;
        }
    }
}
</style>
