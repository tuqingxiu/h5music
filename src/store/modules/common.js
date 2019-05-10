/**
 * 各种状态管理
 */
const state = {
    showMusicList: false,//歌曲列表显示状态
    selectMusic: {},//列表中选中的播放音乐
};

const mutations = {
    SHOW_MUSIC_LIST: function(state,bool){
        state.showMusicList = bool;
    },
    SELECT_MUSIC: function(state,val){
        state.selectMusic = val
    }
};

export default {
    state,
    mutations
}