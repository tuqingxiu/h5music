/**
 * 各种状态管理
 */
const state = {
    isLogin: false,//是否登录
    showLogin: false,//是否显示登录
    showDownLoad: false,//循环弹窗
};

const mutations = {
    SHOW_LOGIN: function(state){
        state.showLogin = !state.showLogin;
    },
    IS_LOGIN: function(state,bool){
        state.isLogin = bool;
    },
    SHOW_DOWNLOAD: function(state,bool){
        state.showDownLoad = bool;
    }
};

export default {
    state,
    mutations
}