var devices = {
	real3anchor: null,
	tags: [],
	taglength: 2,
	tagi: 0,
	currenttagaddr: "",
	outcount: 0,
	receivedata: function(t) {
		
		this.real3anchor = JSON.parse(t), this.currenttagaddr = this.real3anchor.tagaddr, void 0 == this.tags[this.real3anchor.tagaddr] && (this.tagi++, this.tags[this.real3anchor.tagaddr] = []);
		
	},
	setTags: function(t) {
		if(0 != this.tags[this.currenttagaddr])
			
			if(
				Math.sqrt(
					(this.tags[this.currenttagaddr][0].tx - t.px)
					* 
					(this.tags[this.currenttagaddr][0].tx - t.px)
					+ 
					(this.tags[this.currenttagaddr][0].ty - t.py)
					* 
					(this.tags[this.currenttagaddr][0].ty - t.py)
				) > 5) {
					
				if(
					console.log("dist>5"),
					this.outcount++, 
					this.outcount < 5
				)
				return !1
			} 
			else this.outcount = 0;
		return console.log(222222), this.tags[this.currenttagaddr].unshift({
			tx: t.px,
			ty: t.py,
			v_val: t.v_val,
			act: t.act,
			lock: t.lock
		}),console.log(this.tags[this.currenttagaddr]) ,this.tags[this.currenttagaddr].length > this.taglength 
		&&
		(this.tags[this.currenttagaddr].length = this.taglength), !0
	},
	tagsavg: function(t) {
		
		var a = 0,
			s = 0;
		for(var r in this.tags[t]) a += this.tags[t][r].tx, s += this.tags[t][r].ty;
		console.log(
			111111111,
			 a / this.tags[t].length,
			s / this.tags[t].length
		)
		return "" != t && {
			x: a / this.tags[t].length,
			y: s / this.tags[t].length
		}
	},
	devicesflow: function(t) {
		return this.receivedata(t), !!this.setTags(this.real3anchor) && this.tagsavg(this.currenttagaddr)
	}
	
};
module.exports = devices;