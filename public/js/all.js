var clicknum=0
$("#leftSilde").click(function(){
	if(clicknum==0){
		$(".left_silde").show()
		clicknum=1
		$(this).css(
			"left","31%")
		$(this).find("span").removeClass("layui-icon-spread-left").addClass("layui-icon-shrink-right")
	}else if(clicknum==1){
		$(".left_silde").hide()
		clicknum=0;
		$(this).css(
			"left","1%")
			$(this).find("span").addClass("layui-icon-spread-left").removeClass("layui-icon-shrink-right")
	
	}
})
$(function(){
	var height=window.screen.availHeight-150;
	$("#fengMap").height(height)
})
