(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["admin"],{"456d":function(e,t,a){var r=a("4bf8"),n=a("0d58");a("5eda")("keys",function(){return function(e){return n(r(e))}})},"459d":function(e,t,a){"use strict";a.r(t);var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("div",{staticClass:"main"},[a("div",{staticStyle:{"overflow-y":"auto"},style:{height:e.mainHeight}},[a("router-view")],1)]),a("app-aside",{attrs:{tabs:e.tabs}})],1)},n=[],i=a("d225"),o=a("308d"),l=a("6bb5"),s=a("4e2b"),c=a("9ab4"),u=a("2fe1"),p=a("3d13"),d=a("cda1"),m=a("2b0e"),f=function(e){function t(){var e;return Object(i["a"])(this,t),e=Object(o["a"])(this,Object(l["a"])(t).apply(this,arguments)),e.tabs=[{title:"管理员",to:"/admin/list",icon:"el-icon-user"},{title:"增加人员",to:"/admin/add",icon:"el-icon-circle-plus-outline"}],e}return Object(s["a"])(t,e),t}(m["default"]);c["a"]([Object(d["a"])("mainHeight")],f.prototype,"mainHeight",void 0),f=c["a"]([Object(u["b"])({components:{"app-aside":p["a"]}})],f);var b=f,h=b,v=a("2877"),g=Object(v["a"])(h,r,n,!1,null,null,null);t["default"]=g.exports},5178:function(e,t,a){"use strict";a.r(t);var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticStyle:{"padding-left":"5%","padding-top":"3%"}},[a("h3",{staticStyle:{color:"#009688"}},[e._v("管理员基础信息")]),a("el-form",{ref:"form",staticStyle:{width:"80%"},attrs:{model:e.form,rules:e.rules,"label-width":"auto"}},[a("el-form-item",{attrs:{label:"管理者名称：",prop:"adminName"}},[a("el-input",{model:{value:e.form.adminName,callback:function(t){e.$set(e.form,"adminName",t)},expression:"form.adminName"}})],1),a("el-form-item",{attrs:{label:"用户姓名：",prop:"userName"}},[a("el-input",{model:{value:e.form.userName,callback:function(t){e.$set(e.form,"userName",t)},expression:"form.userName"}}),a("el-input",{staticClass:"hidden"})],1),a("el-form-item",{attrs:{label:"登录密码：",prop:"password"}},[a("el-input",{staticClass:"hidden",attrs:{type:"password"}}),a("el-input",{attrs:{type:"password"},model:{value:e.form.password,callback:function(t){e.$set(e.form,"password",t)},expression:"form.password"}})],1),a("el-form-item",{attrs:{label:"性别：",prop:"sex"}},[a("el-radio-group",{model:{value:e.form.sex,callback:function(t){e.$set(e.form,"sex",t)},expression:"form.sex"}},[a("el-radio",{attrs:{label:1}},[e._v("男")]),a("el-radio",{attrs:{label:0}},[e._v("女")])],1)],1),a("el-form-item",{attrs:{label:"所属部门：",prop:"department","inline-message":!0}},[a("el-input",{model:{value:e.form.department,callback:function(t){e.$set(e.form,"department",t)},expression:"form.department"}})],1),a("el-form-item",{attrs:{label:"职位",prop:"job","inline-message":!0}},[a("el-input",{model:{value:e.form.job,callback:function(t){e.$set(e.form,"job",t)},expression:"form.job"}})],1),a("el-form-item",{attrs:{label:"职位等级",prop:"level"}},[a("el-radio-group",{model:{value:e.form.level,callback:function(t){e.$set(e.form,"level",t)},expression:"form.level"}},[a("el-radio",{attrs:{label:"T1"}}),a("el-radio",{attrs:{label:"T2"}}),a("el-radio",{attrs:{label:"T3"}})],1)],1),a("el-form-item",{attrs:{label:"电话号码：",prop:"phone"}},[a("el-input",{attrs:{type:"number"},model:{value:e.form.phone,callback:function(t){e.$set(e.form,"phone",e._n(t))},expression:"form.phone"}})],1),a("el-form-item",{attrs:{label:"工号：",prop:"workNo"}},[a("el-input",{model:{value:e.form.workNo,callback:function(t){e.$set(e.form,"workNo",t)},expression:"form.workNo"}})],1),a("el-form-item",{attrs:{label:"系统权限"}},[a("permission",{ref:"permission"})],1),a("el-form-item",[a("el-button",{attrs:{type:"primary"},on:{click:e.onSubmit}},[e._v("立即创建")]),a("el-button",{on:{click:e.reset}},[e._v("重置")])],1)],1)],1)},n=[],i=(a("456d"),a("ac6a"),a("d225")),o=a("b0b4"),l=a("308d"),s=a("6bb5"),c=a("4e2b"),u=a("9ab4"),p=a("2fe1"),d=a("2b0e"),m=a("56e8"),f=function(e){function t(){var e;return Object(i["a"])(this,t),e=Object(l["a"])(this,Object(s["a"])(t).apply(this,arguments)),e.form={adminName:"",userName:"",password:"",sex:1,department:"",job:"",level:"T1",phone:"",workNo:""},e.rules={},e}return Object(c["a"])(t,e),Object(o["a"])(t,[{key:"created",value:function(){var e=this;Object.keys(this.form).forEach(function(t){if("sex"!==t&&"level"!==t){var a=[{required:!0,message:"必填项不能为空",trigger:"change"}];"phone"===t&&a.push({pattern:/^1[3456789]\d{9}$/,message:"无效电话号",trigger:"change"}),e.rules[t]=a}})}},{key:"onSubmit",value:function(){var e=this,t=this.$refs.form;t.validate(function(t){if(t){var a=Date.now(),r=Object.assign({},e.form,{createTime:a,updateTime:a,role:JSON.stringify(e.$refs.permission.parse())});e.$http.post("/api/admin/addAdmin",r,{"Content-Type":"application/json"}).then(function(){e.$message.success("添加成功"),e.reset()}).catch(console.log)}})}},{key:"reset",value:function(){this.$refs.form.resetFields()}}]),t}(d["default"]);f=u["a"]([Object(p["b"])({components:{permission:m["a"]}})],f);var b=f,h=b,v=a("2877"),g=Object(v["a"])(h,r,n,!1,null,null,null);t["default"]=g.exports},"56e8":function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("el-tree",{ref:"tree",attrs:{load:e.loadNode,props:{isLeaf:"isLeaf"},"default-checked-keys":e.defaultChecked,"show-checkbox":"",lazy:"","node-key":"id"}})},n=[],i=(a("456d"),a("6762"),a("2fdb"),a("ac6a"),a("d225")),o=a("b0b4"),l=a("308d"),s=a("6bb5"),c=a("4e2b"),u=a("9ab4"),p=a("2b0e"),d=a("60a3"),m=function(e){function t(){var e;return Object(i["a"])(this,t),e=Object(l["a"])(this,Object(s["a"])(t).apply(this,arguments)),e.oneLevels=["admin","fence","camera","protocol","base","people","map","alarm"],e}return Object(c["a"])(t,e),Object(o["a"])(t,[{key:"loadNode",value:function(e,t){return 0===e.level?t([{label:"管理员设置",id:"admin"},{label:"区域管理",id:"fence"},{label:"摄像机管理",id:"camera"},{label:"通信协议",id:"protocol"},{label:"设备管理",id:"base"},{label:"标签管理",id:"people"},{label:"地图管理",id:"map"},{label:"警报信息",id:"alarm"}]):e.level>1?t([]):void t([{label:"增",id:e.key+":put",isLeaf:!0},{label:"删",id:e.key+":delete",isLeaf:!0},{label:"改",id:e.key+":post",isLeaf:!0},{label:"查",id:e.key+":get",isLeaf:!0}])}},{key:"parse",value:function(){var e=this.$refs.tree,t=e.getCheckedKeys(),a=e.getCheckedKeys(!0),r={};return this.oneLevels.forEach(function(e){r[e]={put:!0,delete:!0,post:!0,get:!0},t.includes(e)||Object.keys(r[e]).forEach(function(t){a.includes("".concat(e,":").concat(t))||(r[e][t]=!1)})}),r}},{key:"defaultChecked",get:function(){if(!this.role)return this.oneLevels;var e=[],t={};try{t=JSON.parse(this.role)}catch(a){console.error(a)}return this.oneLevels.forEach(function(a){var r=[];["put","delete","post","get"].forEach(function(e){t[a]&&(t[a][e]||Array.isArray(t[a])&&t[a].includes(e))&&r.push("".concat(a,":").concat(e))}),4===r.length?e.push(a):e.push.apply(e,r)}),e}}]),t}(p["default"]);u["a"]([Object(d["d"])()],m.prototype,"role",void 0),m=u["a"]([d["a"]],m);var f=m,b=f,h=a("2877"),v=Object(h["a"])(b,r,n,!1,null,null,null);t["a"]=v.exports},"5eda":function(e,t,a){var r=a("5ca1"),n=a("8378"),i=a("79e5");e.exports=function(e,t){var a=(n.Object||{})[e]||Object[e],o={};o[e]=t(a),r(r.S+r.F*i(function(){a(1)}),"Object",o)}},cbd3:function(e,t,a){"use strict";a.r(t);var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticStyle:{padding:"5%",height:"100%"}},[a("el-card",{ref:"table",staticClass:"card"},[a("app-table",{attrs:{"max-height":e.maxHeight,"table-data":e.tableData,"col-cfg":e.colCfg,"total-count":e.totalCount,op:e.op,"op-width":160},on:{del:e.del,setting:function(t){e.admin=t},updateData:e.getData,toExcel:e.toExcel}})],1),e.admin?[a("el-dialog",{attrs:{title:"更改管理员信息",visible:!!e.admin,"modal-append-to-body":!1},on:{close:function(t){e.admin=null}}},[a("el-form",{ref:"form",attrs:{model:e.admin,"label-width":"auto"}},[a("el-form-item",{attrs:{label:"管理员名称",required:"",prop:"adminName"}},[a("el-input",{staticStyle:{width:"70%"},model:{value:e.admin.adminName,callback:function(t){e.$set(e.admin,"adminName",t)},expression:"admin.adminName"}})],1),a("el-form-item",{attrs:{label:"系统权限"}},[a("permission",{ref:"permission",attrs:{role:e.admin.role}})],1)],1),a("template",{slot:"footer"},[a("el-button",{on:{click:function(t){e.admin=null}}},[e._v("取 消")]),a("el-button",{attrs:{type:"primary"},on:{click:e.submit}},[e._v("确 定")])],1)],2)]:e._e()],2)},n=[],i=(a("96cf"),a("3b8d")),o=a("d225"),l=a("b0b4"),s=a("308d"),c=a("6bb5"),u=a("4e2b"),p=a("9ab4"),d=a("2fe1"),m=a("ae85"),f=a("56e8"),b=function(e){function t(){var e;return Object(o["a"])(this,t),e=Object(s["a"])(this,Object(c["a"])(t).apply(this,arguments)),e.colCfg=[{prop:"id",label:"ID",sortable:!0,width:100},{prop:"adminName",label:"管理员名称",width:140},{prop:"sexName",label:"性别",width:120},{prop:"department",label:"部门",width:160},{prop:"job",label:"职位",width:140},{prop:"level",label:"等级",sortable:!0,width:120},{prop:"phone",label:"电话号码",width:200},{prop:"workNo",label:"工号",width:100}],e.admin=null,e}return Object(u["a"])(t,e),Object(l["a"])(t,[{key:"del",value:function(e){var t=this;this.$confirm("删除".concat(e.adminName,"?")).then(function(){return t.$http.post("/api/admin/deleteAdmin",{id:e.id})}).then(function(){t.$message.success("删除成功"),t.refresh()}).catch(console.log)}},{key:"submit",value:function(){var e=this,t=this.$refs.form;t.validate(function(t){if(t){var a=Date.now();Object.assign(e.admin,{updateTime:a,role:JSON.stringify(e.$refs.permission.parse())}),e.$http.post("/api/admin/updateAdmin",e.admin,{"Content-Type":"application/json"}).then(function(){return e.$message.success("修改管理员信息成功")}).catch(console.log)}})}},{key:"fetch",value:function(){var e=Object(i["a"])(regeneratorRuntime.mark(function e(t,a){var r,n,i;return regeneratorRuntime.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return r=[],n=0,e.prev=2,e.next=5,this.$http.get("/api/admin/getall",{pageSize:a,currentPage:t});case 5:i=e.sent,r=i.pagedData.datas.map(function(e){return e.sexName=e.sex?"男":"女",e}),n=i.pagedData.totalCount,e.next=13;break;case 10:e.prev=10,e.t0=e["catch"](2),console.log(e.t0);case 13:return e.abrupt("return",{count:n,data:r});case 14:case"end":return e.stop()}},e,this,[[2,10]])}));function t(t,a){return e.apply(this,arguments)}return t}()},{key:"isDisable",value:function(e){var t=sessionStorage.getItem("user");return!t||(t=JSON.parse(t),e.id===t.id||e.userName===t.userName)}},{key:"op",get:function(){var e=[];return this.permission.delete&&e.push({type:"danger",name:"del",desc:"删除",isDisable:this.isDisable}),this.permission.put&&e.push({type:"primary",name:"setting",desc:"配置",isDisable:this.isDisable}),e}}]),t}(Object(d["c"])(m["a"]));b=p["a"]([Object(d["b"])({components:{permission:f["a"]}})],b);var h=b,v=h,g=a("2877"),y=Object(g["a"])(v,r,n,!1,null,null,null);t["default"]=y.exports}}]);
//# sourceMappingURL=admin.65366364.js.map