// JavaScript code for polygon annotation tool


const django_data = document.currentScript.dataset;
// const image_str = 'data:image/png;base64,'+django_data.image
// const image = document.createElement('img');
// image.src = image_str;

const canvas = document.getElementById('annotationCanvas');
const ctx = canvas.getContext('2d');
// const image = document.getElementById('annotatableImage');
const selectPolygonArea = document.getElementById('polygonArea');
const scaleFactor = 1.05; // Adjust the scale factor as needed

window.onload = initCanvas;



// const function_server_ip = '140.117.164.100';
const function_server_ip = '192.168.195.98';
let isDrawing = false;
let points = [];
let isEditing = false;
let scale = 1;
let canvasBackground = 'rgb(225, 225, 225)';

let view = '';

let _polygonAreaPoints = {
    'LAM': {
        points: [],
        color: 'rgb(255, 0, 0)',
        checkbox: false,
        namel: '左心房心肌'
    },
    'LA': {
        points: [],
        color: 'rgb(0, 255, 0)',
        checkbox: false,
        name: '左心房'
    },
    'LVM': {
        points: [],
        color: 'rgb(0, 0, 255)',
        checkbox: false,
        name: '左心室心肌'
    },
    'LV': {
        points: [],
        color: 'rgb(255, 255, 0)',
        checkbox: false,
        name: '左心室'
    },
}

let polygonAreaColor = {
    'LAM': 'rgb(255, 0, 0)',
    'LA': 'rgb(0, 255, 0)',
    'LVM': 'rgb(0, 0, 255)',
    'LV': 'rgb(255, 255, 0)',
}

let targetArea = '';

let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let imgTopX = 0;
let imgTopY = 0;


// set the annotation line color, point color, fill color and edit point color
let linecolor = 'rgb(255,125,225)';
let pointcolor = 'rgb(255,125,225)';
let fillcolor = 'rgba(255, 0, 0, 0.5)';
let editpointcolor = 'black';



function initCanvas() {
	
	
	createImage(django_data.image);
    // console.log('image.width: ' + image.width);
    let area = selectPolygonArea.value;
    // console.log('area: ' + area);
    // console.log('image.height: ' + image.height);
    // console.log('canvas.width: ' + canvas.width);
    // console.log('canvas.height: ' + canvas.height);
    // canvas.width = image.width;
    // canvas.height = image.height;
    // ctx.fillStyle = canvasBackground;
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.drawImage(image, 0, 0);
    drawImage();
    view = document.getElementById('view_select').value;
	LAMSegMthChange();
	
}

selectPolygonArea.addEventListener('change', choosePolygonArea);

function choosePolygonArea() {
    annoateArea = selectPolygonArea.value;
    console.log('area: ' + annoateArea);

}

function createImage(image_64encode) {
	// console.log('createImage');
	image_str = 'data:image/png;base64,'+image_64encode;
	image = document.createElement('img');
	image.src = image_str;
	// console.log('image size : ' + image.width + ' ' + image.height);
}




// Function to start annotation
// document.getElementById('startAnnotation').addEventListener('click', () => {
//     isDrawing = true;
//     isEditing = false;
//     points = [];
//     // ctx.clearRect(0, 0, canvas.width, canvas.height);
//     // ctx.drawImage(image, 0, 0);
//     drawImage();
//     canvas.style.cursor = 'crosshair'; // Set crosshair cursor when drawing starts
// });

document.getElementById('startAnnotation').addEventListener('click', startAnnotation);

document.addEventListener('keydown', keydownDectect);


// Function to clear the annotation
document.getElementById('clearAnnotation').addEventListener('click', clearAnnotation);

// Function to save the annotation (you can implement your save logic here)
document.getElementById('saveAnnotation').addEventListener('click', saveAnnotation);

document.getElementById('getAnnotationFromUNet').addEventListener('click', getAnnotationFromUNet)

// Function to delete the annotation
document.getElementById('btn_delete_LV').addEventListener('click', deleteAnnotationArea('LV'));
document.getElementById('btn_delete_LA').addEventListener('click', deleteAnnotationArea('LA'));
document.getElementById('btn_delete_LVM').addEventListener('click', deleteAnnotationArea('LVM'));
document.getElementById('btn_delete_LAM').addEventListener('click', deleteAnnotationArea('LAM'));

// Function to change the view
document.getElementById('view_select').addEventListener('change', viewChange);

document.getElementById('select_LAM_mth').addEventListener('change', LAMSegMthChange);






// Event listeners for mouse actions
// Edit the annotation points
canvas.addEventListener('mousedown', (e) => {
    let canvas_x = e.clientX - canvas.getBoundingClientRect().left;
    let canvas_y = e.clientY - canvas.getBoundingClientRect().top;

    // absoulte position
    let x = (canvas_x - imgTopX) / scale;
    let y = (canvas_y - imgTopY) / scale;

    // absolute position on the image
    // absolute_x_img = x - imgTopX;
    // absolute_y_img = y - imgTopY;
    let absolute_x_img = x;
    let absolute_y_img = y;

    if (e.button === 1) {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }

    if (isDrawing) {
        // console.log('absolute_x_img: ' + absolute_x_img + ' absolute_y_img: ' + absolute_y_img);
        // console.log('x: ' + x + ' y: ' + y);

        // if listen to shortcut key 'n', then finish the annotation
        if (e.keyCode === 78) {
            isDrawing = false;
            drawImage();
            return;
        }

        if (e.button === 1) {
            isDrawing = false;
            drawImage();
            return;
        }

        points.push({
            x: absolute_x_img,
            y: absolute_y_img
        });
        drawImage();
        // console.log('mousdown ---- ')
    } else if (isDrawingMedSAM) {
        console.log('isDrawingMedSAM');
        points = [];
        points.push({
            x: absolute_x_img,
            y: absolute_y_img
        });
        points.push({
            x: absolute_x_img,
            y: absolute_y_img
        });
        drawImage();
    }


    // if isEditing, then select the point to edit
    // if the mouse is close to a point, then select it
    // if the mouse is close to a line, then add a new point
    // if the mouse is close to the first point, then finish the annotation
    // if the mouse is close to the polygon, then do nothing
    else {

        if (targetArea != '' && _polygonAreaPoints[targetArea].checkbox == true) {
            selectedPointIndex = findCloestPointInTargetArea(x, y, _polygonAreaPoints[targetArea].points);
            // console.log('selectedPointIndex: ' + selectedPointIndex);

            // delete the point
            if (e.altKey && selectedPointIndex != -1) {
                if (_polygonAreaPoints[targetArea].points.length <= 3) {
                    selectPointIndex = -1;
                    isEditing = false;
                    alert('The polygon area should have at least 3 points!');
                    return;
                }

                _polygonAreaPoints[targetArea].points.splice(selectedPointIndex, 1); // Remove the selected point
                selectedPointIndex = -1;
                // drawImage(); // Redraw the polygon without the removed point
            }
        }


        detectMouseInArea(canvas_x, canvas_y, true);

        // selectedPointIndex = findClosestPoint(absolute_x_img, absolute_y_img);
        drawImage();
        // console.log('x: ' + x + ' y: ' + y);
        //
        // if selectedPointIndex not equal to -1, then print the selected point
        // if (selectedPointIndex !== -1) {
        //     console.log('points[selectedPointIndex].x: ' + points[selectedPointIndex].x + ' points[selectedPointIndex].y: ' + points[selectedPointIndex].y);
        // }

        // console.log('x: ' + x + ' y: ' + y);
    }
});

// Function to handle the click event
canvas.addEventListener('click', (e) => {
    let x = e.clientX - canvas.getBoundingClientRect().left;
    let y = e.clientY - canvas.getBoundingClientRect().top;

    // absoulte position
    x = (x - imgTopX) / scale;
    y = (y - imgTopY) / scale;

});

function findCloestPointInTargetArea(x, y, area_points) {
    let closestPointIndex = -1;
    let closestDistance = 5;

    for (let i = 0; i < area_points.length; i++) {
        const distance = Math.sqrt(
            Math.pow(x - area_points[i].x, 2) + Math.pow(y - area_points[i].y, 2)
        );
        if (distance < closestDistance) {
            closestPointIndex = i;
            closestDistance = distance;
            isEditing = true;
        }
    }
    // console.log('closestPointIndex: ' + closestPointIndex);

    return closestPointIndex;
}




function findClosestPoint(x, y) {
    let closestPointIndex = -1;
    let closestDistance = 5;

    for (let i = 0; i < points.length; i++) {
        const distance = Math.sqrt(
            Math.pow(x - points[i].x, 2) + Math.pow(y - points[i].y, 2)
        );
        if (distance < closestDistance) {
            closestPointIndex = i;
            closestDistance = distance;
            isEditing = true;
        }
    }

    return closestPointIndex;
}

canvas.addEventListener('mousemove', (e) => {
    if (isEditing && selectedPointIndex !== -1) {

        // Update the position of the selected point
        _polygonAreaPoints[targetArea].points[selectedPointIndex].x = e.clientX - canvas.getBoundingClientRect().left;
        _polygonAreaPoints[targetArea].points[selectedPointIndex].y = e.clientY - canvas.getBoundingClientRect().top;


        // points[selectedPointIndex].x = e.clientX - canvas.getBoundingClientRect().left;
        // points[selectedPointIndex].y = e.clientY - canvas.getBoundingClientRect().top;

        // absoulte position
        _polygonAreaPoints[targetArea].points[selectedPointIndex].x = (_polygonAreaPoints[targetArea].points[selectedPointIndex].x - imgTopX) / scale;
        _polygonAreaPoints[targetArea].points[selectedPointIndex].y = (_polygonAreaPoints[targetArea].points[selectedPointIndex].y - imgTopY) / scale;
        // points[selectedPointIndex].x = (points[selectedPointIndex].x - imgTopX) / scale;
        // points[selectedPointIndex].y = (points[selectedPointIndex].y - imgTopY) / scale;
        // console.log('selectedPointIndex: ' + selectedPointIndex);
        drawImage();
    }
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        offsetX += deltaX;
        offsetY += deltaY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        drawImage();
    }
    if (isDrawingMedSAM) {
        if (points.length == 2) {
            let canvas_x = e.clientX - canvas.getBoundingClientRect().left;
            let canvas_y = e.clientY - canvas.getBoundingClientRect().top;

            // absoulte position
            let x = (canvas_x - imgTopX) / scale;
            let y = (canvas_y - imgTopY) / scale;

            // absolute position on the image
            // absolute_x_img = x - imgTopX;
            // absolute_y_img = y - imgTopY;
            let absolute_x_img = x;
            let absolute_y_img = y;

            points[1] = {
                x: absolute_x_img,
                y: absolute_y_img
            };
            drawImage();

        }
    } else {
        // find mouse in which area
        let x = e.clientX - canvas.getBoundingClientRect().left;
        let y = e.clientY - canvas.getBoundingClientRect().top;
        detectMouseInArea(x, y);
        drawImage();

    }
    // console.log('target' + targetArea);
});

canvas.addEventListener('mouseup', () => {
    if (isEditing) {
        isEditing = false;
        selectedPointIndex = -1;
        drawImage();
    }

    if (isDragging) {
        isDragging = false;
    }

    if (isDrawingMedSAM) {
        isDrawingMedSAM = false;
		canvas.style.cursor = 'auto';
        MedSAMGetSeg(points)
        points = [];
        drawImage();

    }


});


function deleteAnnotationArea(area) {
    return function() {
        console.log('deleteAnnotationArea: ' + area);
        _polygonAreaPoints[area].points = [];
        _polygonAreaPoints[area].checkbox = false;
        document.getElementById('div_checkbox_' + area).style.display = 'none';
        drawImage();
    }
}

function viewChange() {

    view = document.getElementById('view_select').value;
    // console.log('view: ' + view);

}





// addEventListener for keyboard actions
// if listen to shortcut key 'n', then finish the annotation
// if listen to shortcut key 'c', then clear the annotation
// if listen to shortcut key 's', then start the annotation
//
// Note: if you want to use shortcut key, you need to click the canvas first
// to make it focused
//
function startAnnotation() {
    _polygonAreaPoints[selectPolygonArea.value].points = [];

    isDrawing = true;
    isEditing = false;
    points = [];
    drawImage();
    canvas.style.cursor = 'crosshair'; // Set crosshair cursor when drawing starts
    console.log('startAnnotation ---- ');
}

function clearAnnotation() {
    isDrawing = false;
    isEditing = false;
    points = [];
    for (let key in _polygonAreaPoints) {
        _polygonAreaPoints[key].points = [];
        _polygonAreaPoints[key].checkbox = false;
    }

    drawImage();
    canvas.style.cursor = 'auto';
    console.log('clearAnnotation ---- ');
}


function keydownDectect(e) {
    if (isDrawing) {

        // if listen to shortcut key 'n', then finish the annotation
        if (e.keyCode === 78) {
            isDrawing = false;
            _polygonAreaPoints[selectPolygonArea.value].points = points.slice(0);
            _polygonAreaPoints[selectPolygonArea.value].checkbox = true;

            points = [];
            drawImage();
            canvas.style.cursor = 'auto';
            console.log('n ---- ');

            return;
        }
    }

    // if listen to shortcut key 'esc', cancel the annotation
    if (e.keyCode === 27) {
        console.log('esc ---- ');

        if (isDrawing) {
            isDrawing = false;
            points = [];
            drawImage();
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            // ctx.drawImage(image, 0, 0);
        }
        canvas.style.cursor = 'auto';
        return;
    }

    // if listen to shortcut key 'c', then clear the annotation
    if (e.keyCode === 67) {
        console.log('c ---- ');
        clearAnnotation();
        return;
    }

    // if listen to shortcut key 's', then start the annotation
    if (e.keyCode === 83) {
        startAnnotation();
        return;
    }
}

// save annotation using ajax to django server
function saveAnnotation() {
    isDrawing = false;
    // get the annotation points
    var annotationPoints = JSON.stringify(_polygonAreaPoints);
    // console.log('annotationPoints: ' + annotationPoints);

    $.ajax({
        type: "POST",
        url: "/saveAnnotation/",
        data: {
            'annotationPoints': annotationPoints,
            'csrfmiddlewaretoken': '{{ csrf_token }}'
        },
        success: function(response) {
            // alert(response);
        },
        error: function(response) {
            // alert(response);
        }
    });
}

function detectMouseInArea(x, y, ismousedown = false) {

    // absoulte position
    x = (x - imgTopX) / scale;
    y = (y - imgTopY) / scale;
    let isInside = false;

    if (isEditing == false) {
        for (let key in _polygonAreaPoints) {
            const vertices = _polygonAreaPoints[key].points;
            for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
                const xi = vertices[i].x,
                    yi = vertices[i].y;
                const xj = vertices[j].x,
                    yj = vertices[j].y;

                const intersect = ((yi > y) != (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) isInside = !isInside;
            }
            if (isInside) {

                targetArea = key;
                break;
            }
        }
        if (isInside == false && ismousedown == true) {
            targetArea = '';
        }
    }

}


// caculate the points position on the image
function calculateDrawPointsPosition(point) {

    // draw_x = (point.x+imgTopX)*scale;
    // draw_y = (point.y+imgTopY)*scale;
    // console.log(point)
    draw_x = point.x * scale + imgTopX;
    draw_y = point.y * scale + imgTopY;



    return {
        x: draw_x,
        y: draw_y
    };
}


// show the annotation polygon borders and points on the image
function drawNewPolygon() {
    if (isDrawing) {
        if (points.length < 2)
            return;
        ctx.beginPath();

        draw_x = (points[0].x + imgTopX) * scale;
        draw_y = (points[0].y + imgTopY) * scale;

        draw_point = calculateDrawPointsPosition(points[0]);

        // ctx.moveTo(points[0].x, points[0].y);
        // ctx.moveTo(draw_x, draw_y);
        ctx.moveTo(draw_point.x, draw_point.y);

        for (let i = 0; i < points.length; i++) {
            // draw_x = (points[i].x+imgTopX)*scale;
            // draw_y = (points[i].y+imgTopY)*scale;
            // ctx.lineTo(points[i].x, points[i].y);
            // ctx.lineTo(draw_x, draw_y);
            draw_point = calculateDrawPointsPosition(points[i]);
            ctx.lineTo(draw_point.x, draw_point.y);
        }
        ctx.closePath();
        ctx.strokeStyle = linecolor;
        ctx.lineWidth = 2;
        // let closepath fill with transparent red color
        ctx.fillStyle = fillcolor;
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < points.length; i++) {
            ctx.beginPath();
            // draw_x = (points[i].x+imgTopX)*scale;
            // draw_y = (points[i].y+imgTopY)*scale;
            // ctx.arc(points[i].x, points[i].y, 3, 0, 2 * Math.PI);
            // ctx.arc(draw_x, draw_y, 3, 0, 2 * Math.PI);
            draw_point = calculateDrawPointsPosition(points[i]);
            ctx.arc(draw_point.x, draw_point.y, 3, 0, 2 * Math.PI);

            ctx.closePath();
            ctx.fillStyle = pointcolor;
            ctx.fill();
        }

    }


    // Draw points for editing
    if (isEditing) {
        ctx.fillStyle = editpointcolor;


        for (let i = 0; i < points.length; i++) {
            ctx.beginPath();
            // draw_x = (points[i].x+imgTopX)*scale;
            // draw_y = (points[i].y+imgTopY)*scale;
            // ctx.arc(points[i].x, points[i].y, 3, 0, 2 * Math.PI);
            // ctx.arc(draw_x, draw_y, 3, 0, 2 * Math.PI);
            draw_point = calculateDrawPointsPosition(points[i]);
            ctx.arc(draw_point.x, draw_point.y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    if (isDrawingMedSAM) {

        if (points.length == 2) {
            ctx.beginPath();

            draw_point0 = calculateDrawPointsPosition(points[0]);
            draw_point1 = calculateDrawPointsPosition(points[1]);
            ctx.rect(draw_point0.x, draw_point0.y, draw_point1.x - draw_point0.x, draw_point1.y - draw_point0.y);

            // ctx.rect(points[0].x, points[0].y, points[1].x - points[0].x, points[1].y - points[0].y);
            ctx.strokeStyle = linecolor;
            ctx.lineWidth = 2;
            ctx.stroke();

        }
    }
}

function drawArea(area_points, color = 'rgb(255, 0, 0)', istarget = false) {
    if (area_points.length < 2)
        return;
    ctx.beginPath();

    draw_x = (area_points[0].x + imgTopX) * scale;
    draw_y = (area_points[0].y + imgTopY) * scale;

    draw_point = calculateDrawPointsPosition(area_points[0]);

    ctx.moveTo(draw_point.x, draw_point.y);

    for (let i = 0; i < area_points.length; i++) {
        draw_point = calculateDrawPointsPosition(area_points[i]);
        ctx.lineTo(draw_point.x, draw_point.y);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    // let closepath fill with transparent red color
    if (istarget) {
        transparent_color = color.replace('rgb', 'rgba').replace(')', ', 0.5)');
        ctx.fillStyle = transparent_color;
        ctx.fill();
    }
    ctx.stroke();

    if (istarget) {
        // let color become transparent
        // Draw area_points for editing
        if (isEditing) {
            ctx.fillStyle = editpointcolor;
            ctx.beginPath();

            if (selectedPointIndex != -1) {
                draw_point = calculateDrawPointsPosition(area_points[selectedPointIndex])
                ctx.arc(draw_point.x, draw_point.y, 6, 0, 5 * Math.PI);
                ctx.fill();
            }
        }

        for (let i = 0; i < area_points.length; i++) {
            ctx.beginPath();
            draw_point = calculateDrawPointsPosition(area_points[i]);
            ctx.arc(draw_point.x, draw_point.y, 3, 0, 2 * Math.PI);

            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }


    }
}

function showCurrentAnnotationCheckbox(key) {
    let container = document.getElementById('annotationCheckbox');

    if (_polygonAreaPoints[key].points.length != 0) {
        document.getElementById('div_checkbox_' + key).style.display = '';
        document.getElementById('checkbox_' + key).checked = _polygonAreaPoints[key].checkbox;
    }
	else{
		document.getElementById('div_checkbox_' + key).style.display = 'none';
	}

}




// Function to draw the image on the canvas
function drawImage() {
	// console.log('drawImage');
	// console.log('image size : ' + image.width + ' ' + image.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate the scaled image size
    const scaleWidth = image.width * scale;
    const scaleHeight = image.height * scale;

    // Calculate the position to center the image on the canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // calculate the top-left corner of the image
    const imageX = centerX - scaleWidth / 2 + offsetX;
    const imageY = centerY - scaleHeight / 2 + offsetY;

    imgTopX = imageX;
    imgTopY = imageY;
    // console.log('imageX: ' + imageX + ' imageY: ' + imageY);

    ctx.drawImage(image, imageX, imageY, scaleWidth, scaleHeight);
		

    // ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
    drawNewPolygon();

    for (let key in _polygonAreaPoints) {
        let isTarget = false;

        if (key === targetArea) {
            isTarget = true;
        }
        if (_polygonAreaPoints[key].checkbox != false) {
            drawArea(_polygonAreaPoints[key].points, _polygonAreaPoints[key].color, isTarget);
        }
            showCurrentAnnotationCheckbox(key);
    }
}

document.getElementById('checkbox_LA').addEventListener('change', function() {
    if (this.checked) {
        _polygonAreaPoints['LA'].checkbox = true;
    } else {
        _polygonAreaPoints['LA'].checkbox = false;
    }
    drawImage();
});

document.getElementById('checkbox_LV').addEventListener('change', function() {
    if (this.checked) {
        _polygonAreaPoints['LV'].checkbox = true;
    } else {
        _polygonAreaPoints['LV'].checkbox = false;
    }
    drawImage();
});

document.getElementById('checkbox_LAM').addEventListener('change', function() {
    if (this.checked) {
        _polygonAreaPoints['LAM'].checkbox = true;
    } else {
        _polygonAreaPoints['LAM'].checkbox = false;
    }
    drawImage();
});

document.getElementById('checkbox_LVM').addEventListener('change', function() {
    if (this.checked) {
        _polygonAreaPoints['LVM'].checkbox = true;
    } else {
        _polygonAreaPoints['LVM'].checkbox = false;
    }
    drawImage();
});





// Event listener for mouse wheel scrolling
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    //     // Adjust the scale factor based on the scroll direction
    if (e.deltaY < 0) {
        scale *= scaleFactor; // Zoom in
    } else {
        scale /= scaleFactor; // Zoom out
    }

    // Limit the minimum and maximum scale values (adjust as needed)
    scale = Math.min(Math.max(scale, 0.1), 10.0);

    // Redraw the image at the new scale
    drawImage();
});

function getAnnotationFromUNet() {
    console.log('getAnnotationFromUNet');

    // get response from django server
    let response = $.ajax({
        type: "GET",
        url: "/getAnnotationFromUNet/",
        data: {
            'csrfmiddlewaretoken': '{{ csrf_token }}'
        },
        success: function(response) {
            // alert(response);
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
        },
        error: function(response) {
            // alert(response);
        }
    })
}

function LAMSegMthChange() {
	var tmp_mth = document.getElementById('select_LAM_mth').value;
	
	
	if (tmp_mth == 'EqualLAM') {
		document.getElementById('LAM_seg_label').innerHTML = 'LAM width';
		document.getElementById('LAM_seg_value').value = '15';
	}
	else if (tmp_mth == 'SnakeLAM') {
		document.getElementById('LAM_seg_label').innerHTML = 'Snake iteration';
		document.getElementById('LAM_seg_value').value = '25';

	}


	return 1;
}


