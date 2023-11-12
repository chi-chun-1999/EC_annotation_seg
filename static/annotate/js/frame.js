const task_index = document.currentScript.dataset.taskIndex;
const image_num = document.currentScript.dataset.imageNum;
const frame_information_from_database = document.currentScript.dataset.frameInformation;
const stop_frame = document.currentScript.dataset.stopFrame;

const frame_num_element = document.getElementById('frame_num');
const frame_range_element = document.getElementById('frame_range');

frame_num_element.onchange = frameNumChange;
frame_range_element.oninput = frameRangeChange;

// document.getElementById('frame_range').oninput = frameRangeChange
// document.getElementById('frame_num').onchange = frameNumChange
document.addEventListener('keyup',keyUpDetect);


let frame_polygonAreaPoints = [];
let ori_frame = stop_frame;
let change_frame = stop_frame;

let frame_information = [];




// window.onload = initFrame;
addLoadEvent(initFrame);

function keyUpDetect(event){
	// press key "f"
	if (event.keyCode == 70){
		console.log("press f");

		if (parseInt(frame_num_element.value) < parseInt(frame_num_element.max)){
			frame_num_element.value = parseInt(frame_num_element.value) + 1;
			frameNumChange();
		}
		else{
			console.log('max frame',frame_num_element.max);
			console.log('current frame',frame_num_element.value)
			return;
		}
		

	}
	// press key "d"
	if (event.keyCode == 68){


		console.log("press d");

		if (parseInt(frame_num_element.value) > parseInt(frame_num_element.min)){
			frame_num_element.value = parseInt(frame_num_element.value) - 1;
			frameNumChange();
		}
		else{
			return;
		}
		
	}
}
	



function initFrame() {
    // initCanvas();
    // createEmptyFramePolygonAreaPoints();
    createFramePolygonAreaPointsFromDatabase();
    // setFrameFromPolygonAreaPoints(ori_frame,change_frame);
    if (frame_information[stop_frame]['view'] == '') {
        frame_information[stop_frame]['view'] = '2ch';
    }


    view = frame_information[stop_frame]['view'];
    // document.getElementById('view_select').value = view;
    document.getElementById('radio_' + view).checked = true;


    let area = ['LAM', 'LA', 'LVM', 'LV'];
    for (var i = 0; i < area.length; i++) {

        _polygonAreaPoints[area[i]]['points'] = Object.assign([], frame_information[stop_frame]['polygon_area'][area[i]]);

        if (frame_information[stop_frame]['polygon_area'][area[i]].length != 0) {
            _polygonAreaPoints[area[i]]['checkbox'] = true;
        } else {
            _polygonAreaPoints[area[i]]['checkbox'] = false;
        }

    }
    drawImage();
    // setInfoAreaSelectAndCheckboxStatus();
}



function createEmptyFramePolygonAreaPoints() {
    for (var i = 0; i < image_num; i++) {
        let tmp_polygon_areas = {
            'LAM': [],
            'LA': [],
            'LVM': [],
            'LV': []
        };
        let tmp_information = {
            'key_points': {},
            'polygon_area': tmp_polygon_areas,
            'view': ''
        };
        frame_polygonAreaPoints.push(tmp_polygon_areas);
        frame_information.push(tmp_information);
    }

}

function createFramePolygonAreaPointsFromDatabase() {
    //TODO
    // console.log(frame_information_from_database);
    // console.log(JSON.parse(frame_information_from_database)[0]);
    frame_information = JSON.parse(frame_information_from_database);

}

function setFrameFromPolygonAreaPoints(ori_frame, change_frame) {
    // console.log("setFrameFromPolygonAreaPoints");
    //
    // frame_information[ori_frame]['key_point'] = Object.assign({}, {});
    // frame_information[ori_frame]['key_points'] = {};
    // frame_information[ori_frame]['view'] = view;

    let area = ['LAM', 'LA', 'LVM', 'LV'];

    for (var i = 0; i < area.length; i++) {
        let tmp_polygon_point = _polygonAreaPoints[area[i]]['points'];
        // frame_polygonAreaPoints[ori_frame][area[i]] = tmp_polygon_point;
        // _polygonAreaPoints[area[i]]['points'] = frame_polygonAreaPoints[change_frame][area[i]];
        // frame_polygonAreaPoints[ori_frame][area[i]] = Object.assign([], tmp_polygon_point);
        // _polygonAreaPoints[area[i]]['points'] = Object.assign([], frame_polygonAreaPoints[change_frame][area[i]]);
        //


        frame_information[ori_frame]['polygon_area'][area[i]] = Object.assign([], tmp_polygon_point);
        _polygonAreaPoints[area[i]]['points'] = Object.assign([], frame_information[change_frame]['polygon_area'][area[i]]);


        if (frame_information[change_frame]['polygon_area'][area[i]].length != 0) {
            _polygonAreaPoints[area[i]]['checkbox'] = true;
        } else {
            _polygonAreaPoints[area[i]]['checkbox'] = false;
        }

    }


}

function setFrameView(ori_frame, change_frame) {
	frame_information[ori_frame]['view'] = view;
	view = frame_information[change_frame]['view'];
	// document.getElementById('view_select').value = view;
	document.getElementById('radio_' + view).checked = true;
}

function frameRangeChange() {
    // console.log("frameNumChange");
    var frame = document.getElementById('frame_range').value;
    ori_frame = change_frame;
    change_frame = frame;
    document.getElementById('frame_num').value = frame;
    setFrameFromPolygonAreaPoints(ori_frame, change_frame);
	setFrameView(ori_frame, change_frame);
	saveFrame(ori_frame);
	resetKeyPoint();
    getFrame();
}

function frameNumChange() {
    // console.log("frameNumChange");
    var frame = document.getElementById('frame_num').value;
    ori_frame = change_frame;
    change_frame = frame;
    document.getElementById('frame_range').value = frame;
    setFrameFromPolygonAreaPoints(ori_frame, change_frame);
	setFrameView(ori_frame, change_frame);
    saveFrame(ori_frame);
	resetKeyPoint();
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
    saveRemind = false;


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



window.addEventListener('beforeunload', function(event) {
    //检查是否有未保存的数据
    if (saveRemind) {
        event.preventDefault();
        event.returnValue = '';
    }

    $.ajax({
        type: "POST",
        url: "/task/" + task_index,
        data: {
            'csrfmiddlewaretoken': '{{ csrf_token }}',
            'stop_frame': change_frame,
            'task_index': task_index,
        },
        success: function(response) {
            console.log(response);
            // alert("save success");
        },
        error: function(response) {
            // alert("error");
            console.log("error");

        }

    })
});
