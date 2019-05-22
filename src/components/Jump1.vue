<template>
    <img :src="imgUrl" />
</template>
<script>
import { mapMutations, mapState } from "vuex";
import store from '../store';

export default {
    props: {
        playing: {
            type: Boolean,
            default: false
        },
        imgType: {
            type: String,
            default: ''
        }
    },
    data(){
        return{
            index: 0,
            imgUrl: ''
        }
    },
    mounted(){
        if(this.playing){
            this.setTimer()
        }
        if(this.imgType==='big'){
            this.imgUrl = this.imgs[0]
        }else{
            this.imgUrl = this.icons[0]
        }
    },
    destroyed(){
        if(this.timer){
            clearInterval(this.timer)
        }
    },
    watch: {
        playing: function(val){
            if(this.playing){
                this.setTimer()
            }else{
                this.clearTimer()
            }
        }
    },
    methods: {
        setTimer: function(){
            this.clearTimer()
            if(this.imgType === 'big'){
                this.bigTimer()
            }else{
                this.smallTimer()
            }
        },
        clearTimer: function(){
            if(this.timer){
                clearInterval(this.timer)
            }
        },
        smallTimer: function(){
            const self= this;
            this.timer = setInterval(()=>{
                if(self.index===this.icons.length-1){
                    self.index = 0;
                }else{
                    self.index++;
                }
                this.imgUrl = this.icons[self.index];
            },100)
        },
        bigTimer: function(){
            const self= this;
            this.timer = setInterval(()=>{
                // if(self.index===this.imgs.length-1){
                //     self.index = 0;
                // }else{
                //     self.index++;
                // }
                let random = this.random(1,50)
                //随机数和上一个相同时，就取前一个图片
                if(random === self.index){
                    self.index = random - 1
                }else{
                    self.index = random
                }
                this.imgUrl = this.imgs[self.index];
            },300)
        },
        random: function(lower, upper) {
            return Math.floor(Math.random() * (upper - lower)) + lower;
        }
    },
    computed: {
        ...mapState({
            icons: ({imgs1}) => imgs1.icons,
            imgs: ({imgs1}) => imgs1.imgs
        })
    },
}
</script>
<style lang="less" scoped>

</style>
