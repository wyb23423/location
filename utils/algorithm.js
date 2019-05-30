var algorithm = {
	tdoachan: function(i, t, l) {
		var n = 299702547,
			u = i.mainanchorno, //a0000004
			e = l.eye(i.anchornum); // 生成4*4 的矩阵
		var	y = t[u].x * t[u].x + t[u].y * t[u].y, // -9.46205*-9.46205+7.8689*7.8689
			a = [],
			m = [];
		for(var p in i.diff) {
			var r = t[p].x * t[p].x + t[p].y * t[p].y,
			o = (l.number(i.diff[p]) - l.number(i[u])) * n;	
			console.log(o)
			Math.pow(t[p].x - t[u].x, 2), Math.pow(t[p].y - t[u].y, 2);
			a.push([-(t[p].x - t[u].x), -(t[p].y - t[u].y), -o]), m.push((o * o - r + y) / 2)
		}
		var s = l.transpose(a); // 矩阵转置

		var x = l.inv(e); // inv 矩阵求逆
	
		var d = l.multiply(s, x); // multiply 乘法

		var h = l.multiply(d, a); // multiply 乘法
		
		var v = l.inv(h); // inv 矩阵求逆
		
		var f = l.multiply(v, s); // multiply 乘法
		var b = l.multiply(f, x); // multiply 乘法
		var c = l.multiply(b, m); // multiply 乘法
		var w = (c.subset(l.index(0)), c.subset(l.index(1)), c.subset(l.index(2)));
		var M = l.eye(i.anchornum);
		var g = 0;
		
		for(var j in i.diff) {
			Math.pow(t[j].x - t[u].x, 2), Math.pow(t[j].y - t[u].y, 2);
			var k = w + (o = (l.number(i.diff[j]) - l.number(i[u])) * n);
			M = l.subset(M, l.index(g, g), k), g++
		}
		var q = l.multiply(n * n, M),
			z = l.multiply(q, e),
			A = l.multiply(z, M),
			B = l.inv(A),
			C = l.multiply(s, B),
			D = l.multiply(C, a),
			E = l.inv(D),
			F = l.multiply(E, s),
			G = l.multiply(F, B),
			H = l.multiply(G, m);
		var s1 = H.subset(l.index(0)),
			s2 = H.subset(l.index(1));
		
		return {
			px: H.subset(l.index(0)),
			py: H.subset(l.index(1)),
			state: !0
		}
			
		

	}
};
module.exports = algorithm;