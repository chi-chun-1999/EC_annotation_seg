const task_index = document.currentScript.dataset.taskIndex;
const image_num = document.currentScript.dataset.imageNum;
const frame_information_from_database = document.currentScript.dataset.frameInformation;
const stop_frame = document.currentScript.dataset.stopFrame;

document.getElementById('frame_range').oninput = frameRangeChange
document.getElementById('frame_num').onchange = frameNumChange

let frame_polygonAreaPoints = [];
let ori_frame = 0;
let change_frame = 0;

let frame_information = [];


window.onload = initFrame;


function initFrame() {
	initCanvas();
	// createEmptyFramePolygonAreaPoints();
	createFramePolygonAreaPointsFromDatabase();
	// setFrameFromPolygonAreaPoints(ori_frame,change_frame);
	view = frame_information[stop_frame]['view'];
	
	let area = ['LAM', 'LA', 'LVM', 'LV'];
	for (var i = 0; i < area.length; i++){

		_polygonAreaPoints[area[i]]['points'] = Object.assign([], frame_information[stop_frame]['polygon_area'][area[i]]);

		if (frame_information[stop_frame]['polygon_area'][area[i]].length != 0){
			_polygonAreaPoints[area[i]]['checkbox'] = true;
		}
		else{
			_polygonAreaPoints[area[i]]['checkbox'] = false;
		}
			
	}
}



function createEmptyFramePolygonAreaPoints(){
	for (var i = 0; i < image_num; i++){
		let tmp_polygon_areas = {'LAM': [], 'LA': [], 'LVM': [], 'LV': []};
		let tmp_information = {'key_points':{}, 'polygon_area':tmp_polygon_areas, 'view':''};
		frame_polygonAreaPoints.push(tmp_polygon_areas);
		frame_information.push(tmp_information);
	}
	
}

function createFramePolygonAreaPointsFromDatabase(){
	//TODO
	// console.log(frame_information_from_database);
	// console.log(JSON.parse(frame_information_from_database)[0]);
	frame_information = JSON.parse(frame_information_from_database);

}

function setFrameFromPolygonAreaPoints(ori_frame,change_frame){
	// console.log("setFrameFromPolygonAreaPoints");
	//
	// frame_information[ori_frame]['key_point'] = Object.assign({}, {});
	// frame_information[ori_frame]['key_points'] = {};
	// frame_information[ori_frame]['view'] = view;

	let area = ['LAM', 'LA', 'LVM', 'LV'];

	for (var i = 0; i < area.length; i++){
		let tmp_polygon_point = _polygonAreaPoints[area[i]]['points'];
		// frame_polygonAreaPoints[ori_frame][area[i]] = tmp_polygon_point;
		// _polygonAreaPoints[area[i]]['points'] = frame_polygonAreaPoints[change_frame][area[i]];
		// frame_polygonAreaPoints[ori_frame][area[i]] = Object.assign([], tmp_polygon_point);
		// _polygonAreaPoints[area[i]]['points'] = Object.assign([], frame_polygonAreaPoints[change_frame][area[i]]);

		frame_information[ori_frame]['polygon_area'][area[i]] = Object.assign([], tmp_polygon_point);
		_polygonAreaPoints[area[i]]['points'] = Object.assign([], frame_information[change_frame]['polygon_area'][area[i]]);


		if (frame_information[change_frame]['polygon_area'][area[i]].length != 0){
			_polygonAreaPoints[area[i]]['checkbox'] = true;
		}
		else{
			_polygonAreaPoints[area[i]]['checkbox'] = false;
		}
			
	}

}

function frameRangeChange() {
	// console.log("frameNumChange");
    var frame = document.getElementById('frame_range').value;
	ori_frame = change_frame;
	change_frame = frame;
    document.getElementById('frame_num').value = frame;
	setFrameFromPolygonAreaPoints(ori_frame,change_frame);
    getFrame();
}

function frameNumChange() {
	// console.log("frameNumChange");
    var frame = document.getElementById('frame_num').value;
	ori_frame = change_frame;
	change_frame = frame;
    document.getElementById('frame_range').value = frame;
	setFrameFromPolygonAreaPoints(ori_frame,change_frame);
	saveFrame(ori_frame);
    getFrame();
}


function getFrame() {
    var frame = document.getElementById('frame_num').value;
	let image_64encode = '';
    $.ajax({
        type: "GET",
        url: "/readImage/task/" + task_index + "/" + frame,
        data: {
            'csrfmiddlewaretoken': '{{ csrf_token }}'
        },
        success: function(response) {
            // console.log(response);
            var image_64encode = response['data'];
			createImage(image_64encode);
			// console.log("get frame: " + frame);
			image.onload = drawImage;
			// console.log("polygons",response['polygons']);
			// drawImage();
			// console.log(image_64encode);
        },
        error: function(response) {
            alert("error");
        }
    });
}


function saveFrame(frame) {
	// var frame = document.getElementById('frame_num').value;


	// setFrameFromPolygonAreaPoints(change_frame,ori_frame);
	// area = ['LAM', 'LA', 'LVM', 'LV'];
	// for (var i = 0; i < area.length; i++){
	// 	frame_information[frame]['polygon_area'][area[i]] = Object.assign([], _polygonAreaPoints[area[i]]['points']);
	// }
	

	$.ajax({
		type: "POST",
		url: "/readImage/task/" + task_index + "/" + frame,
		data: {
			'csrfmiddlewaretoken': '{{ csrf_token }}',
			// 'polygons': JSON.stringify(frame_polygonAreaPoints[frame]),
			'polygons': JSON.stringify(frame_information[frame]['polygon_area']),
			'key_points': JSON.stringify(frame_information[frame]['key_points']),
			'view': JSON.stringify(frame_information[frame]['view']),
			// 'view': JSON.stringify(view),
		},
		success: function(response) {
			// console.log(response);
			// alert("save success");
		},
		error: function(response) {
			alert("error");
		}
	});
}
