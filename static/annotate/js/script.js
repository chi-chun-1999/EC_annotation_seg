// JavaScript code for polygon annotation tool
const canvas = document.getElementById('annotationCanvas');
const ctx = canvas.getContext('2d');
const image = document.getElementById('annotatableImage');
const scaleFactor = 1.05; // Adjust the scale factor as needed

window.onload = initCanvas;


let isDrawing = false;
let points = [];
let isEditing = false;
let scale = 1;

function initCanvas() {
	console.log('image.width: ' + image.width);
	console.log('image.height: ' + image.height);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
	ctx.fillStyle = 'rgb(125, 125, 125)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	console.log('canvas.width: ' + canvas.width);
	console.log('canvas.height: ' + canvas.height);
}

// Function to start annotation
document.getElementById('startAnnotation').addEventListener('click', () => {
    isDrawing = true;
    isEditing = false;
    points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    canvas.style.cursor = 'crosshair'; // Set crosshair cursor when drawing starts
});

// Function to clear the annotation
document.getElementById('clearAnnotation').addEventListener('click', () => {
    isDrawing = false;
    isEditing = false;
    points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    canvas.style.cursor = 'auto';
});

// Function to save the annotation (you can implement your save logic here)
document.getElementById('saveAnnotation').addEventListener('click', () => {
    isDrawing = false;
    // Save the 'points' array or send it to your server for storage
});


// Event listeners for mouse actions
canvas.addEventListener('mousedown', (e) => {
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    if (isDrawing) {

        // if listen to shortcut key 'n', then finish the annotation
        if (e.keyCode === 78) {
            isDrawing = false;
            drawPolygon();
            return;
        }

        if (e.button === 1) {
            isDrawing = false;
            drawPolygon();
            return;
        }

        points.push({
            x,
            y
        });
        drawPolygon();
        // console.log('mousdown ---- ')
    }

    // if isEditing, then select the point to edit
    // if the mouse is close to a point, then select it
    // if the mouse is close to a line, then add a new point
    // if the mouse is close to the first point, then finish the annotation
    // if the mouse is close to the polygon, then do nothing
    else {
        selectedPointIndex = findClosestPoint(x, y);
    }
});

// Function to handle the click event
canvas.addEventListener('click', (e) => {
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    if (e.altKey) {
        // Check if the "Option" (Alt) key is pressed
        const closestIndex = findClosestPoint(x, y);
        if (closestIndex !== -1) {
            points.splice(closestIndex, 1); // Remove the selected point
            drawPolygon(); // Redraw the polygon without the removed point
        }
    }
});




function findClosestPoint(x, y) {
    let closestPointIndex = -1;
    let closestDistance = 10;

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
        points[selectedPointIndex].x = e.clientX - canvas.getBoundingClientRect().left;
        points[selectedPointIndex].y = e.clientY - canvas.getBoundingClientRect().top;
        console.log('selectedPointIndex: ' + selectedPointIndex);
        drawPolygon();
    }
});

canvas.addEventListener('mouseup', () => {
    if (isEditing) {
        isEditing = false;
        selectedPointIndex = -1;
        drawPolygon();
    }
});

// addEventListener for keyboard actions
// if listen to shortcut key 'n', then finish the annotation
// if listen to shortcut key 'c', then clear the annotation
// if listen to shortcut key 's', then start the annotation
//
// Note: if you want to use shortcut key, you need to click the canvas first
// to make it focused

document.addEventListener('keydown', (e) => {
    if (isDrawing) {

        // if listen to shortcut key 'n', then finish the annotation
        if (e.keyCode === 78) {
            isDrawing = false;
            drawPolygon();
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
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);
        }
        canvas.style.cursor = 'auto';
        return;
    }

    // if listen to shortcut key 'c', then clear the annotation
    if (e.keyCode === 67) {
        console.log('c ---- ');
        isDrawing = false;
        points = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        return;
    }

    // if listen to shortcut key 's', then start the annotation
    if (e.keyCode === 83) {
        isDrawing = true;
        points = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        canvas.style.cursor = 'crosshair'; // Set crosshair cursor when drawing starts
        return;
    }

});




// show the annotation polygon borders and points on the image
function drawPolygon() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    if (points.length < 2)
        return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    // let closepath fill with transparent red color
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 3, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();
    }

    // Draw points for editing
    if (isEditing) {
        ctx.fillStyle = 'blue';
        for (let i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
// Function to draw the image on the canvas
function drawImage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width * scale, canvas.height * scale);
}

// canvas.addEventListener('mousemove', (e) => {
//     if (isEditing && selectedPointIndex !== -1) {
//         // Update the position of the selected point
//         points[selectedPointIndex].x = e.clientX - canvas.getBoundingClientRect().left;
//         points[selectedPointIndex].y = e.clientY - canvas.getBoundingClientRect().top;
//         drawPolygon();
//     }
// });

// save annotation using ajax to django server
function saveAnnotation() {
    // get the annotation points
    var annotationPoints = JSON.stringify(points);
    console.log('annotationPoints: ' + annotationPoints);

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

// Function to save the annotation (you can implement your save logic here)
document.getElementById('saveAnnotation').addEventListener('click', () => {
    isDrawing = false;
    // Save the 'points' array or send it to your server for storage
    saveAnnotation();
});


// Event listener for mouse wheel scrolling
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    // Adjust the scale factor based on the scroll direction
    if (e.deltaY < 0) {
        scale *= scaleFactor; // Zoom in
    } else {
        scale /= scaleFactor; // Zoom out
    }

    // Limit the minimum and maximum scale values (adjust as needed)
    scale = Math.min(Math.max(scale, 0.1), 3.0);

    // Redraw the image at the new scale
    drawImage();
});


