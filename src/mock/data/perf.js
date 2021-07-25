const perfdata = {
    'GET /cpuperf': {
        statusCode: "200", statusMessage: "succcess", data: 
        [
            {
                name: 'user',
                type: 'line',
                smooth: true,
                data: [3,28,32,34,12,10,11,9,8,18,14,12,
                13,10,13,9,23,21,16,14,13,15,17,14]
            },
            {
                name: 'sys',
                type: 'line',
                smooth: true,
                data: [8,14,18,16,10,9,9,6,7,13,15,22,
                18,19,23,29,33,31,21,17,14,19,11,9]
            },
            {
                name: 'idel',
                type: 'line',
                smooth: true,
                data: [89,58,50,50,78,81,80,85,85,69,71,66,
                69,71,64,62,44,48,63,69,73,66,72,77]
            },
            {
                name: 'iowait',
                type: 'line',
                smooth: true,
                data: [1,7,8,6,8,5,6,3,2,3,1,1,0,3,0,2,1,3,7,4,1,4,2,1]
            },
            {
                name: 'entc',
                type: 'line',
                smooth: true,
                data: [11,42,50,50,22,19,20,15,15,31,29,34,
                31,29,36,38,56,52,37,31,27,34,28,23]
            }
        ]
    },
}

export default perfdata;