import qs from 'qs'
const menu = {
    'POST /login': function(params){
        const param = qs.parse(params.body)
        if (param.username == 'admin' && param.password == '123456') {
            return {
              statusCode: "200",
              statusMessage: 'Successful',
              data: {
                accessToken: 'xxx',
                refreshToken: 'xxx'
              }
            }
        } else {
          return {
            statusCode: "403",
            statusMessage: 'Login failed',
            data: {
              accessToken: '-',
              refreshToken: '-'
            }
          }
        }
    },
    'GET /menu': {
      statusCode: "200", statusMessage: "succcess", data: 
      [{
        menuId: "1-1",
        menuType: 1,
        menuName: 'AIX system',
        children: [
          {
            menuId: "1-1-1",
            menuType: 2,
            menuName: 'AIXtest1',
            path: '/allsystems',
          },
          {
            menuId: "1-1-2",
            menuType: 2,
            menuName: 'AIXtest2',
            path: '/allsystems',
          }]
      },
      {
          menuId: "1-2",
          menuType: 2,
          menuName: 'Linux system',
          children: [
            {
              menuId: "1-2-1",
              menuType: 2,
              menuName: 'Linuxtest1',
              path: '/allsystems',
            },
            {
              menuId: "1-2-2",
              menuType: 2,
              menuName: 'LinuxXtest2',
              path: '/allsystems',
            }]
      }]
  }
}

export default menu;