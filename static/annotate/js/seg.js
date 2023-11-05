document.getElementById('btn_UNet').addEventListener('click', UNetGetSeg);

document.getElementById('btn_viewClassify').addEventListener('click', viewClassify);

document.getElementById('btn_LAM_seg').addEventListener('click', EqualLAMSeg);

document.getElementById('btn_MedSAM').addEventListener('click', function() {
    isDrawingMedSAM = true;
    canvas.style.cursor = 'crosshair';
});

let isDrawingMedSAM = false;

function errorAlert() {
	var email = 'justin11223350@gmail.com'
	alert('ERROR!!!\n'+'連線失敗，請連絡管理員\n'+'Email: '+email);
}


function UNetGetSeg() {
    // console.log('testPostImage');
    // var imageDataURL = image.toDataURL('image/png');

    data = {
        // 'csrfmiddlewaretoken': '{{ csrf_token }}',
        'img': image.src,
        'view': view
    }

    $.ajax({
        type: "POST",
        url: "http://"+function_server_ip+":8080/CAMUSegmentation",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
        success: function(response) {
            // alert(response);
            // console.log(response['la_polygon_points']);
            // console.log(response['la_polygon_points']);
            tmp = []
            for (let key in response['la_polygon_points']) {
                tmp.push({
                    x: response['la_polygon_points'][key][0],
                    y: response['la_polygon_points'][key][1]
                })
            }
            _polygonAreaPoints['LA'].points = tmp;
            _polygonAreaPoints['LA'].checkbox = true;

            tmp = []
            for (let key in response['lv_polygon_points']) {
                tmp.push({
                    x: response['lv_polygon_points'][key][0],
                    y: response['lv_polygon_points'][key][1]
                })
            }
            _polygonAreaPoints['LV'].points = tmp;
            _polygonAreaPoints['LV'].checkbox = true;
            drawImage();
			saveRemind = true;
        },
		error: function(jqxHR, status, error) {
			if (jqxHR.status == 400) {
				errorAlert();
			}
			else{
				errorAlert();
			}

		}
    })
}


function viewClassify() {
    console.log('viewClassify');
    data = {
        'img': image.src,
        'view': view
    }

    $.ajax({
        type: "POST",
        url: "http://"+function_server_ip+":8080/viewClassification",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
        success: function(response) {
            console.log(response);
            document.querySelector('#view_select').value = response['view'];
            view = response['view'];
			saveRemind = true;
        },
		error: function(jqxHR, status, error) {
			if (jqxHR.status == 400) {
				errorAlert();
			}
			else{
				errorAlert();
				
			}
		}
			
    })
}


function MedSAMGetSeg(prompt_bbox) {
    // console.log('MedSAMGetSeg', prompt_bbox);
    data = {
        'img': image.src,
        'prompt_bbox': prompt_bbox
    }

    $.ajax({
        type: "POST",
        // url: "http://192.168.195.98:8888/MedSAMSegmentation",
        url: "http://"+function_server_ip+":8888/MedSAMSegmentation",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
        success: function(response) {
            // console.log(response['polygon_points']);

            tmp = []
            for (let key in response['polygon_points']) {
                tmp.push({
                    x: response['polygon_points'][key][0],
                    y: response['polygon_points'][key][1]
                })
            }
            _polygonAreaPoints[selectPolygonArea.value].points = tmp;
            _polygonAreaPoints[selectPolygonArea.value].checkbox = true;
            drawImage();
			saveRemind = true;
        },
		error: function(jqxHR, status, error) {
			if (jqxHR.status == 400) {
				errorAlert();
			}
			else{
				errorAlert();
				
			}
		}

    })
}


function EqualLAMSeg(params) {
    console.log('EqualLAMSeg', params);
	lam_seg_value = document.getElementById('LAM_seg_value').value

	key_points_list = []
	for (let i in key_points) {
		if (key_points[i].x !=null && key_points[i].y !=null) {
			key_points_list.push([key_points[i].x, key_points[i].y])
		}
	}

	console.log(key_points_list);

    data = {
        'img': image.src,
        'LA': _polygonAreaPoints['LA'].points,
        'LV': _polygonAreaPoints['LV'].points,
        'key_points': key_points_list,
		'lam_seg_value': lam_seg_value,
    }

    LAM_seg_meth = document.getElementById('select_LAM_mth').value;
    console.log(LAM_seg_meth);


    if (LAM_seg_meth == 'EqualLAM') {
        $.ajax({
            type: "POST",
            // url: "http://192.168.195.98:8887/EqualLAMSegmentation",
            url: "http://"+function_server_ip+":8887/EqualLAMSegmentation",
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            success: function(response) {
                // console.log(response);
                if (response['success'] == false) {
                    alert('EqualLAMSeg failed.\n'+response['message']);
                    return;
                } else if (response['success'] == true) {
                    tmp = []
                    for (let key in response['polygon_points']) {
                        tmp.push({
                            x: response['polygon_points'][key][0],
                            y: response['polygon_points'][key][1]
                        })
                    }
                    _polygonAreaPoints['LAM'].points = tmp;
                    _polygonAreaPoints['LAM'].checkbox = true;
                    drawImage();
					saveRemind = true;
                }

            },
		error: function(jqxHR, status, error) {
			if (jqxHR.status == 400) {
				errorAlert();
			}
			else{
				errorAlert();
				
			}
		}

        })

    } 
	else if (LAM_seg_meth == 'SnakeLAM') {
        $.ajax({
                type: "POST",
                url: "http://"+function_server_ip+":8887/SnakeLAMSegmentation",
                data: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
            success: function(response) {
                // console.log(response);
                if (response['success'] == false) {
                    alert('SnakeLAM failed.\n'+response['message']);
                    return;
                } else if (response['success'] == true) {
                    tmp = []
                    for (let key in response['polygon_points']) {
                        tmp.push({
                            x: response['polygon_points'][key][0],
                            y: response['polygon_points'][key][1]
                        })
                    }
                    _polygonAreaPoints['LAM'].points = tmp;
                    _polygonAreaPoints['LAM'].checkbox = true;
                    drawImage();
					saveRemind = true;
                }

            },
		error: function(jqxHR, status, error) {
			if (jqxHR.status == 400) {
				errorAlert();
			}
			else{
				errorAlert();
				
			}
		}

        })
	}
}
