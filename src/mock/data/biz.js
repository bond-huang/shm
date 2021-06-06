const hostdata = {
    'GET /allsystems': {
        statusCode: "200", statusMessage: "succcess", data: {
            total: 12,
            pages: 2,
            content: [{
                HostId: 1,
                HostType: "AIX",
                HostName: "AIXtest1",
                IPadd: "192.168.100.100",
                Description: "IBM AIX test system",
                StatusInfo:"Health",
            },
            {
                HostId: 2,
                HostType: "AIX",
                HostName: "AIXtest2",
                IPadd: "192.168.100.101",
                Description: "IBM AIX test system",
                StatusInfo:"Warning",
            },
            {
                HostId: 3,
                HostType: "AIX",
                HostName: "AIXtest3",
                IPadd: "192.168.100.102",
                Description: "IBM AIX test system",
                StatusInfo:"Health"
            },
            {
                HostId: 4,
                HostType: "AIX",
                HostName: "AIXtest4",
                IPadd: "192.168.100.103",
                Description: "IBM AIX test system",
                StatusInfo:"Severe"
            },
            {
                HostId: 5,
                HostType: "AIX",
                HostName: "AIXtest5",
                IPadd: "192.168.100.104",
                Description: "IBM AIX test system",
                StatusInfo:"Health"
            },
            {
                HostId: 6,
                HostType: "AIX",
                HostName: "AIXtest6",
                IPadd: "192.168.100.105",
                Description: "IBM AIX test system",
                StatusInfo:"Health"
            },
            {
                HostId: 7,
                HostType: "AIX",
                HostName: "AIXtest7",
                IPadd: "192.168.100.106",
                Description: "IBM AIX test system",
                StatusInfo:"Health"
            },
            {
                HostId: 8,
                HostType: "Linux",
                HostName: "Linuxtest1",
                IPadd: "192.168.100.107",
                Description: "Red Hat Enterprise Linux",
                StatusInfo:"Health"
            },
            {
                HostId: 9,
                HostType: "Linux",
                HostName: "Linuxtest2",
                IPadd: "192.168.100.108",
                Description: "Red Hat Enterprise Linux",
                StatusInfo:"Health"
            },
            {
                HostId: 10,
                HostType: "Linux",
                HostName: "Linuxtest3",
                IPadd: "192.168.100.109",
                Description: "Red Hat Enterprise Linux",
                StatusInfo:"Health"
            },
            {
                HostId: 11,
                HostType: "Linux",
                HostName: "Linuxtest4",
                IPadd: "192.168.100.110",
                Description: "Red Hat Enterprise Linux",
                StatusInfo:"Health"
            },
            {
                HostId: 12,
                HostType: "Linux",
                HostName: "Linuxtest5",
                IPadd: "192.168.100.111",
                Description: "Red Hat Enterprise Linux",
                StatusInfo:"Health"
            },]
        }
    },
    'GET /statistics': {
        statusCode: "200", statusMessage: "succcess", data: {
            allHosts: 100,
            healthHosts: 73,
            warningHosts: 15,
            severeHosts:2,
        }
    },
}

export default hostdata;