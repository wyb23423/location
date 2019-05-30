// 获取标签列表
var tagarrlists;

function tagarrlist() {
    var urls = "/api/tag/getall"
    $.ajax({
        type: "get",
        url: urls,
        datatype: "jsonp",
        data: {
            currentPage: 1,
            pageSize: 10000,
        },
        success: function (red) {
            tagarrlists = red.pagedData.datas
        }
    });
}
var tagfor = []

function fortag(tagno) {

    tagfor.length = 0;
    for (var a = 0; a < tagarrlists.length; a++) {
        if (tagno == tagarrlists[a].tagNo) {
            tagfor.push(tagarrlists[a]);
        }
    }
    if (tagfor.length == 0) {
        var s_ = {
            avatar: "../../../public/image/F.png",
            createTime: null,
            createUser: null,
            department: "犯人1",
            iBbattery: 53,
            id: 34,
            job: "4",
            leader: null,
            level: null,
            locked: null,
            name: "00000001",
            phone: null,
            reason: null,
            sex: 1,
            tagNo: "00000001",
            type: 1,
            updateTime: null,
            updateUser: null,
            zone: "22",
        }
        tagfor.push(s_)
    }
    // }

}
tagarrlist()