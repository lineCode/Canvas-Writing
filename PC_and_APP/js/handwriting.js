var canvasWidth = Math.min(800,$(window).width()-20);
var canvasHeight = canvasWidth;
// 检测是否按下鼠标
var isMouseDown = false;
// 保存上一次鼠标的坐标
var lastLoc = {x:0,y:0};
// 保存上一笔的时间
var lastTimestamp = 0;
// 记录上一次笔的宽度
var lastLineWidth = -1;
// 选择颜色
var strokeColor = "black";

var canvas = document.getElementById("canvas");
var context = canvas.getContext('2d');

canvas.width = canvasWidth;
canvas.height = canvasHeight;
$('#controller').css({
	width: canvasWidth+'px'
});

drowGrid();
$('#clear_btn').click(function(e) {
	context.clearRect(0,0,canvasWidth,canvasHeight);
	drowGrid();
});
$('.color_btn').click(function(e) {
	$('.color_btn').removeClass("color_btn_selected");
	$(this).addClass('color_btn_selected');
	strokeColor = $(this).css("background-color");
});

function beginStroke(point) {
	isMouseDown = true;
	// 得到canvas坐标系
	lastLoc = windowToCanvas(point.x,point.y);
	lastTimestamp = new Date().getTime();
}

function endStroke() {
	isMouseDown = false;
}

function moveStroke(point) {
	var curLoc = windowToCanvas(point.x,point.y);
	var curTimestamp = new Date().getTime();
	// 计算写字时两个点之间的距离，以便得到根据速度变化笔的粗细
	var s = calcDistance(curLoc,lastLoc);
	var t = curTimestamp - lastTimestamp;

	var lineWidth = calcLineWidth(s,t);

	// draw
	context.beginPath();
	context.moveTo(lastLoc.x,lastLoc.y);
	context.lineTo(curLoc.x,curLoc.y);
	context.strokeStyle = strokeColor;
	context.lineWidth = lineWidth;
	context.lineCap = "round";//直线段的两端
	context.lineJoin = "round";//当两条线交汇时边角的样式
	context.stroke();

	lastLoc = curLoc;
	lastTimestamp = curTimestamp;
	lastLineWidth = lineWidth;
}

canvas.onmousedown = function(e) {
	// 阻止默认的web app行为
	e.preventDefault();
	beginStroke({x:e.clientX,y:e.clientY});
}
canvas.onmouseup = function(e) {
	e.preventDefault();
	endStroke();
}
canvas.onmouseout = function(e) {
	e.preventDefault();
	endStroke();
}
canvas.onmousemove = function(e) {
	e.preventDefault();
	if(isMouseDown) {
		moveStroke({x:e.clientX,y:e.clientY});
	}
}

// web app手指操作
canvas.addEventListener('touchstart',function(e) {
	e.preventDefault();
	touch = e.touches[0];
	beginStroke({x:touch.pageX,y:touch.pageY});
});
canvas.addEventListener('touchmove',function(e) {
	e.preventDefault();
	if(isMouseDown) {
		touch = e.touches[0];
		moveStroke({x:touch.pageX,y:touch.pageY});
	}
});
canvas.addEventListener('touchend',function(e) {
	e.preventDefault();
	endStroke();
});

// 计算运笔的粗细
var maxlineWidth = 20;
var minlineWidth = 1;
var maxStrokeV = 10;
var minStrokeV = 0.1;
function calcLineWidth(s,t) {
	var v = s/t;

	var resultLineWidth;
	if( v <= minStrokeV) {
		resultLineWidth = maxlineWidth;
	}else if(v >= maxStrokeV) {
		resultLineWidth =minlineWidth;
	}else {
		resultLineWidth = maxlineWidth - (v - minStrokeV)/(maxStrokeV - minStrokeV) * (maxlineWidth - minlineWidth);
	}
	if(lastLineWidth == -1) {
		return resultLineWidth;
	}
	// 使得笔更加平滑
	return lastLineWidth*2/3 + resultLineWidth*1/3;
}

// 计算绘制的两点间的距离
function calcDistance(loc1,loc2) {
	return Math.sqrt((loc1.x - loc2.x) * (loc1.x - loc2.x) + (loc1.y - loc2.y) * (loc1.y - loc2.y));
}

function windowToCanvas(x,y) {
	var bbox = canvas.getBoundingClientRect();
	return {
		x:Math.round(x-bbox.left),
		y:Math.round(y-bbox.top)
	};
}

// 绘制米字格
function drowGrid() {
	context.save();

	context.strokeStyle = "rgb(230,11,9)";

	// 绘制最外边边框
	context.beginPath();
	context.moveTo(3, 3);
	context.lineTo(canvasWidth - 3,3);
	context.lineTo(canvasWidth - 3,canvasHeight - 3);
	context.lineTo(3, canvasHeight - 3);
	context.closePath();
	context.lineWidth = 6;
	context.stroke();

	// 绘制米字格
	context.beginPath();
	context.moveTo(0, 0);
	context.lineTo(canvasWidth, canvasHeight);

	context.moveTo(canvasWidth, 0);
	context.lineTo(0, canvasHeight);

	context.moveTo(canvasWidth/2, 0);
	context.lineTo(canvasWidth/2, canvasHeight);

	context.moveTo(0, canvasHeight/2);
	context.lineTo(canvasWidth, canvasHeight/2);

	context.setLineDash([5,10]);
	context.lineWidth = 1;
	context.stroke();

	context.restore();
}

