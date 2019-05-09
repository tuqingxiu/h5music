/**
 * 路由相关的数据
 */
const state = {
    pageStack: [], //页面栈
    mode: "push" //翻页效果
  };
  
  const mutations = {
    SET_MODE: function(state, mode) {
      //设置翻页效果
      state.mode = mode;
    },
    PUSH_PAGE: function(state, page) {
      //往页面栈中放一个页面
      state.pageStack.push(page);
    },
    INSERT_PAGE: function(state, page, index) {
      //在指定位置插入一个页面
      state.pageStack.splice(index, 0, page);
    },
    POP_PAGE: function(state, number = 0) {
      //弹出一个页面
      for (var i = 0; i < number; i++) {
        state.pageStack.pop();
      }
    },
    CLEAR_PAGE: function(state) {
      //清空页面栈
      state.pageStack = [{ name: "/", index: 0 }];
    }
  };
  
  const getters = {
    pageStack: function(state) {
      return state.pageStack;
    },
    prepage: function(state, getters) {
      return state.pageStack[state.pageStack.length - 2];
    }
  };
  
  export default {
    state,
    mutations,
    getters
  };
  