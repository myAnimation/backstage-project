import { login, logout, getInfo } from '@/api/acl/user'
// import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter,allAsyncRoutes,constantRoutes,anyRoute } from '@/router'
import router from '@/router'
import  cloneDeep  from 'lodash/cloneDeep'
// const getDefaultState = () => {
//   return {
//     token: getToken(),
//     name: '',
//     avatar: ''
//   }
// }
function filterAsyncRoutes(allAsyncRoutes,routeNames){

let asyncRoutes = allAsyncRoutes.filter(item => {
    if(routeNames.indexOf(item.name) !== -1){
      if(item.children && item.children.length){
          item.children = filterAsyncRoutes(item.children,routeNames)

      }  
      return true
    }
  })
 return asyncRoutes
}

const state = {
  token: localStorage.getItem('token_key'),
  name: '',
  avatar: '',
  buttons:[],
  roles:[],
  // asyncRoutes:[] ,//这个里面一会保存的不是请求回来的用户信息，而是根据请求回来的routes字符串，过滤出来的路由信息数组
  routes:[] //保存的是这个用户对应的路由器当中配置的所有路由组成的数组，这个数组到时候是让侧边栏遍历使用
}

const mutations = {
  // RESET_STATE: (state) => {
  //   Object.assign(state, getDefaultState())
  // },
  RESET_STATE: (state) => {
    state.token = ''
    state.name = ''
    state.avatar = ''
    state.buttons = []
    state.roles = []
    // state.asyncRoutes = []
  },
  SET_TOKEN: (state, token) => {

    state.token = token
  },
  SET_USERINFO: (state, userInfo) => {
    state.name = userInfo.name
    state.avatar = userInfo.avatar
    state.buttons = userInfo.buttons
    state.roles = userInfo.roles
    
  },
  SET_ROUTES(state,asyncRoutes){
    // state.asyncRoutes  = asyncRoutes
    // 保存所有的路由组成的数组，用于形成侧边栏菜单的时候，遍历使用的
    state.routes = constantRoutes.concat(asyncRoutes,[anyRoute])
  //  还要把动态路由和任意路由，动态添加到路由器的配置项当中
  router.addRoutes([...asyncRoutes,anyRoute])
  }
  // SET_NAME: (state, name) => {
  //   state.name = name
  // },
  // SET_AVATAR: (state, avatar) => {
  //   state.avatar = avatar
  // }
}

const actions = {
  // user login
  async login({commit}, userInfo) {

   
      const { username, password } = userInfo
     let result = await login({ username: username.trim(), password: password })
    
        if(result.code === 20000 || result.code === 200){
         const {token} = result.data
 
         commit('SET_TOKEN', token)
         localStorage.setItem('token_key',token)
         return Promise.resolve('ok')
        }else{
    
          return Promise.reject(new Error('failed'))
        }
         

  },
  /*  login({ commit }, userInfo) {
     const { username, password } = userInfo
     return new Promise((resolve, reject) => {
       login({ username: username.trim(), password: password }).then(response => {
         const { data } = response
         commit('SET_TOKEN', data.token)
         // setToken(data.token)
         localStorage.setItem('token_key',data.token)
         resolve()
       }).catch(error => {
         reject(error)
       })
     })
   }, */

  // get user info
 async getInfo({commit,state}){
     const result =  await getInfo(state.token)

     if(result.code === 20000 || result.code === 200){
      const { data } = result
      commit('SET_USERINFO', data)
      // data.routes 这个拿到的是用户返回的路由name字符串组成的数组
      //我们现在要的不是他，而是通过它从所以异步路由当中过滤出来的路由组成的数组
     
      commit('SET_ROUTES', filterAsyncRoutes(cloneDeep(allAsyncRoutes),data.routes))
      return Promise.resolve(data)
     }else{
 
        return Promise.reject(new Error('failed'))
     }
  },
 /*  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        commit('SET_USERINFO', data)
        // commit('SET_NAME', name)
        // commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  }, */

  // user logout
   async logout ({commit,state,dispatch}){
      const result = await logout(state.token)
      if(result.code === 20000 || result.code === 200){
        dispatch('resetToken')
        commit('RESET_STATE')
        resetRouter()
        return 'ok'
      }else{
          return Promise.reject(new Error('failed'))
      }
   },
 /*  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        // removeToken() // must remove  token  first
        // commit('RESET_STATE')
        dispatch('resetToken')
        resetRouter()

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }, */

  // remove token
 async resetToken ({commit}){
  localStorage.removeItem('token_key')
  commit('RESET_STATE')
  return 'ok'
 }
 /*  resetToken({ commit }) {
    return new Promise(resolve => {
      // removeToken() // must remove  token  first
      localStorage.removeItem('token_key')
      commit('RESET_STATE')
      resolve()
    })
  } */
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

