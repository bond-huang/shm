const modeller = {
    'GET /modeller': {
        statusCode: "200", statusMessage: "succcess", data: {
            total: 12,
            pages: 2,
            content: [{
                modelId: 1,
                modelName: "测试数据集",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 2,
                modelName: "测试数据集1",
                remark: "test data",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 3,
                modelName: "测试数据集2",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 4,
                modelName: "测试数据集3",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 5,
                modelName: "测试数据集4",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 6,
                modelName: "测试数据集5",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 7,
                modelName: "测试数据集6",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 8,
                modelName: "测试数据集7",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 9,
                modelName: "测试数据集8",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 10,
                modelName: "测试数据集9",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 11,
                modelName: "测试数据集10",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 12,
                modelName: "test11",
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
        ]
        }
    },
    'GET /modeller/column/xxx': {
        statusCode: "200", statusMessage: "succcess", data: {
            total: 4,
            pages: 1,
            content: [{
                modelId: 1,
                modelName: "测试数据集",
                identifierCd: "vin",
                identifierLabel: "车架号",
                dataType: 2,
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 1,
                modelName: "测试数据集",
                identifierCd: "userId",
                identifierLabel: "用户ID",
                dataType: 2,
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 1,
                modelName: "测试数据集",
                identifierCd: "speed",
                identifierLabel: "车速",
                dataType: 2,
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            },
            {
                modelId: 1,
                modelName: "测试数据集",
                identifierCd: "project_id",
                identifierLabel: "项目编号",
                dataType: 2,
                remark: "",
                updateDate: "2019-12-25 12:00:00",
                updateBy: "admin"
            }]
        }
    },
}

export default modeller;