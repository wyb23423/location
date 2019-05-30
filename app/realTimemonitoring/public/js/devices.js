var devices = {
	anchorobj: null,
	fenceobj: null,
	anchorsmap: null,
	real3anchor: null,
	lastreal3anchor: [],
	lasttagaddr: "",
	r3aarray: [],
	avgtags: {},
	avgtaglength: 0,
	tags: [],
	taglength: 8,
	tagi: 0,
	currenttagaddr: "",
	existtags: [],
	taglist: [],
	alertsongobj: null,
	forarrlist: function(t) {
		console.log(t)
		for(var a = 0; a < t.length; a++) {
			this.receivedata(t[a])
		}
	},
	receivedata: function(t) {
		(
			this.real3anchor = t,
			this.currenttagaddr = this.real3anchor.tagaddr,
			this.lastreal3anchor[this.currenttagaddr] = this.real3anchor,
			this.lasttagaddr = this.currenttagaddr,
			undefined == this.tags[this.real3anchor.tagaddr]
		) &&
		(
			this.tagi++, this.tags[this.real3anchor.tagaddr] = [],
			$("#mapdiv").append('<div class="tagtooltip" id="tagtip' + this.currenttagaddr + "\"><img width='66' height='66'/><br><span class='tagspan1'></span><br><span class='tagspan2'></span><br><span class='tagspan3'></span><br><span class='tagspan4'></span><br><span class='tagspan5'></span></div>")
		);
		var tagaddrinfo = this.real3anchor;
		
		this.tags[this.currenttagaddr] = {
			tagaddr: tagaddrinfo.tagaddr,
			x: tagaddrinfo.x,
			y: tagaddrinfo.y,
			v_val: tagaddrinfo.v_val,
			act: tagaddrinfo.act,
			locke: tagaddrinfo.locke,
			gjdate:tagaddrinfo.gjdate

		};
		
		this.init(this.tags[this.currenttagaddr])

	},
	setTags: function(t) {
		if(0 != this.tags[this.currenttagaddr].length && Math.sqrt((this.tags[this.currenttagaddr][0].tx - t.px) * (this.tags[this.currenttagaddr][0].tx - t.px) + (this.tags[this.currenttagaddr][0].ty - t.py) * (this.tags[this.currenttagaddr][0].ty - t.py)) > 5) return console.log("dist > 5"), !1;
		this.tags[this.currenttagaddr].unshift({
			tx: t.px,
			ty: t.py,
			v_val: t.v_val,
			act: t.act,
			lock: t.lock
		}), this.tags[this.currenttagaddr].length > this.taglength && (this.tags[this.currenttagaddr].length = this.taglength)
	},
	tagsavg: function(t) {
		var a = 0,
			s = 0;
		for(var r in this.tags[t]) a += this.tags[t][r].tx, s += this.tags[t][r].ty;
		return "" == t ? {
			x: 0,
			y: 0
		} : {
			x: a / this.tags[t].length,
			y: s / this.tags[t].length
		}
	},
	songrbf: function() {
		this.alertsongobj.currentTime = 0
	},
	songbf: function() {
		null !== this.alertsongobj && this.alertsongobj.paused && this.alertsongobj.play()
	},
	"flistdata": null,
	dataArr: [

	], // 用来装标签数据的数组
	keyarr: [],
	keytag: null,
	keyadddata: function(key) {
		for(var i = 0; i < this.keyarr.length; i++) {
			if(key == this.keyarr[i]) {
				return this.keytag = this.keyarr[i]
			}
		}
		return false
	},
	//判断是否为第一次进入的数据， 
	init: function(data) {
		//						console.log(this.keyarr)

		if(flistnum == false) {
			this.flistadddata(data)
		} else {
			this.nextadddata(data)
		}
	},
	flistadddata: function(data) { // 将第一次进入的数据存在数组
		this.dataArr.push(data);
		this.keyarr.push(data.tagaddr);
		//							console.log(this.keyarr)
		flistnum = true
	},
	nextadddata: function(data) { //假如当前标签数据为第二次进来，将这次标签的数据与第一次进来的数据进行对比，如果相同则改变相同数组的值等于这次进来的数据，   后续进来数据同理

		var newdataname = data.tagaddr;
		var thistag = this.keyadddata(newdataname);
		if(thistag != false) {
			for(var j = 0; j < this.dataArr.length; j++) {
				if(this.dataArr[j].tagaddr == thistag) {
					this.dataArr[j] = data
				}
			}
		} else {
			this.dataArr.push(data);
			this.keyarr.push(data.tagaddr)
		}

	}
};