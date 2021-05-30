const basic = {
    state: {
        height: document.documentElement.clientHeight,
        loginStatus: false,
        mockInitFinished: false,
        userInfo: {
            userId: 'admin',
            nickname: 'admin',
        }
    },
    mutations: {
        MOCK_INIT_FINISHED: (state, status) => {
            state.mockInitFinished = status
        },
        AUTO_WINDOW_HEIGHT: state => {
            state.height = document.documentElement.clientHeight
        },
        LOGIN_STATUS: (state, status) => {
            state.loginStatus = status
        },
        SET_USER_INFO:(state, userInfo) => {
            state.userInfo = userInfo;
        }
    },
    actions: {
        mockInitFinished({ commit }, status) {
            commit('MOCK_INIT_FINISHED', status)
        },
        autoHeight({ commit }) {
            commit('AUTO_WINDOW_HEIGHT')
        },
        loginStatus({commit}, status){
            commit('LOGIN_STATUS', status)
        },
        setUserInfo({commit}, userInfo) {
            commit('SET_USER_INFO', userInfo)
        }
    }
}

export default basic;