/**
 * 基站补偿值算法
 * 主机站为第一位
 * 注意标签到基站的距离与标签的原始数据 顺序要与基站顺序一致
 */
var compensation = {
	T_: [], // 基站距离
	B_: [], // 标签距离
	C0_: 29970254700,     //光速
	Time: [],			  // 时间戳
	timeGrid:15.65e-12,   //时间格子
	T1: null,
	that:this,
	anchoname:[],
	anchoMain:null,   	  // 主机站的时间
	antotagtime:null,	  //主机站到标签的时间
	correctionArr: [],
	init: function(listData) {
		this.T_=[],this.B_=[],
		this.time=[],
		this.T1=[]
		this.correctionArr=[]
		var anchorCoord = listData.anchorCoord, //基站坐标
			inputCm = listData.inputCm, 		//标签到基站距离
			tagCoord = listData.tagCoord, 		//标签实际距离
			tagName = listData.tagName; 		//标签编号
			for(var a=0;a<anchorCoord.length;a++){
				if(anchorCoord[a].main==1){
					compensation.anchoname=listData.anchorCoord[a]
				}
			}
			compensation.Time=listData.Time; 				//时间戳
			compensation.T_get(anchorCoord)
			compensation.C_Tag(tagCoord,anchorCoord);
			compensation.E_(compensation.Time	)
			compensation.D_();
	},
	T_get: function(data) { //基站
		for(var a =0; a < data.length; a++) {
			var t1 = compensation.A_(compensation.anchoname, data[a], a)/compensation.C0_;
			var Cms={
				t1:t1,
				name:data[a].name,
				main:data[a].main
			}
			compensation.T_.push(Cms)
		}

	},
	C_Tag: function(tagObj, anchoData) { //标签
		for(var a = 0; a < anchoData.length; a++) {
			var t2 = compensation.A_(tagObj, anchoData[a], a) / compensation.C0_;
			var tagcm={
				t2:t2,
				name:anchoData[a].name,
				main:anchoData[a].main
			}
			compensation.B_.push(tagcm)
		}
	},
	A_: function(C, D) { // 距离算法
		return Math.sqrt(Math.pow(C.x - D.x, 2) + Math.pow(C.y - D.y, 2)+Math.pow(C.z - D.z, 2));
	},
	D_: function() { //每个基站
	
		for(var a = 0; a < compensation.B_.length; a++) {
			if(compensation.B_[a].main!=1){
				console.log(compensation.B_)
				var mainTime=this.anchoMain,
					maintotagTime=this.antotagtime,
					tagtoanchoTime=this.B_[a].t2,
					anchoTime=this.Time[a].time*this.timeGrid,
					maintoacnho=this.T_[a].t1;
				var G_=this.F_(mainTime,maintotagTime,tagtoanchoTime,anchoTime,maintoacnho);
				
				var correction={
					name:compensation.B_[a].name,
					value:G_
				}
				this.correctionArr.push(correction)	
			}
		}
	},
	
	E_: function(time) { //主机站
		// timeStamp(1,1)-2*t2(1,1)
		var timestap,cm,name;  //CM=>标签到主机站的时间
	
		for(var a=0;a<time.length;a++){
			if(time[a].main==1){
				compensation.anchoMain=time[a].time*compensation.timeGrid;
				name=time[a].name
			}
			if(compensation.B_[a].main==1){
				compensation.antotagtime=cm=compensation.B_[a].t2
			}
		}
		console.log(name)
		var times = (compensation.anchoMain - 2 * compensation.antotagtime)
		var correction={
			name:name,
			value:times
		}
		this.T1 = times
		this.correctionArr.push(correction)
	},
	F_:function(mainTime,maintotagTime,tagtoanchoTime,anchoTime,maintoacnho){
		/*	mainTime  主机站时间
			maintotagTime 主机站到标签的时间
		 * 	tagtoanchoTime标签到从基站的时间
		 * 	anchoTime     从基站的时间
		 * 	maintoacnho   主机站到从基站的时间
		 * */
		var stime=mainTime-maintotagTime+tagtoanchoTime-anchoTime-maintoacnho;
		return stime
	},
	callback: function() {
		return  this.correctionArr
	}
}