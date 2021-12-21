import { login, logout, getInfo } from '@/api/user'
// import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

// const getDefaultState = () => {
//   return {
//     token: getToken(),
//     name: '',
//     avatar: ''
//   }
// }

const state = {
  token: localStorage.getItem('token_key'),
  name: '',
  avatar: ''
}

const mutations = {
  // RESET_STATE: (state) => {
  //   Object.assign(state, getDefaultState())
  // },
  RESET_STATE: (state) => {
    state.token = ''
    state.name = ''
    state.avatar = ''
  },
  SET_TOKEN: (state, token) => {

    state.token = token
  },
  SET_USERINFO: (state, userInfo) => {
    state.name = userInfo.name
    state.avatar = userInfo.avatar
  },
 
}

const actions = {
  // user login
  async login({commit}, userInfo) {

   
      const { username, password } = userInfo
     let result = await login({ username: username.trim(), password: password })
    
        if(result.code === 20000){
         const {token} = result.data
 
         commit('SET_TOKEN', token)
         localStorage.setItem('token_key',token)
         return Promise.resolve('ok')
        }else{

          return Promise.reject(new Error('failed'))
        }
         

  },


  // get user info
 async getInfo({commit,state}){
     const result =  await getInfo(state.token)

     if(result.code === 20000){
      const { data } = result
      commit('SET_USERINFO', data)
      return Promise.resolve(data)
     }else{
        return Promise.reject(new Error('failed'))
     }
  },


  // user logout
   async logout ({commit,state,dispatch}){
      const result = await logout(state.token)
      if(result.code === 20000){
        dispatch('resetToken')
        commit('RESET_STATE')
        resetRouter()
        return 'ok'
      }else{
          return Promise.reject(new Error('failed'))
      }
   },


  // remove token
 async resetToken ({commit}){
  localStorage.removeItem('token_key')
  commit('RESET_STATE')
  return 'ok'
 }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

