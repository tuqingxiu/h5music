import Vue from 'vue';
import Vuex from 'vuex';
import routes from './modules/routes';
import common from './modules/common';

/**
 * 状态管理，按模块划分
 */
Vue.use(Vuex);
const store = new Vuex.Store({
  modules: {
    routes, //路由控制
    common, //其它状态
  }
});
export default store;