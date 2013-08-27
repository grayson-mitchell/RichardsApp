/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
//

//cant work out how to use a function as a viewmodel definition... binding errors
//function AppViewModel() {
//    var self = this;
//    self.gridSize = ko.observable("30");
//    self.UpdateMousePosition = function(data, event) {
//        if (event.shiftKey) {
//            alert(event.clientX);
//        } else {
//           //do normal action
//        }
//    }
//}
//ko.applyBindings(new AppViewModel());

var GridViewModel = {
    hexSize: ko.observable("30"),
    canvasWidth: ko.observable("600"),
    canvasHeight: ko.observable("600"),
    displayCoords: ko.observable("Axial"),
    pixel: ko.observable("0"),
    hex: ko.observable("0"), 
};
ko.applyBindings(GridViewModel );

function UpdateMousePos(data, event) {
    var mousePos = getMousePos(canvas, event);
    var gridPos = getHex([mousePos.x, mousePos.y]);
    GridViewModel.hex(Math.round(gridPos[0]) + "," + Math.round(gridPos[1]));
    GridViewModel.pixel(mousePos.x + "," + mousePos.y); // not sure why mousePos.y isn't a whole number
    drawgrid();

    drawSpot(mousePos.x, mousePos.y, 8, "blue");    
}

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth;
GridViewModel.canvasWidth(canvas.width);
canvas.height = window.innerHeight;

drawgrid();

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - Math.floor(rect.top)
    };
}

function changeCords(system) {
    displayCords = system;
    //console.log("displayCords=" + system);
    drawgrid();
}

function offsetCords() {
    changeCords("Offset");
}

function cubeCords() {
    changeCords("Cube");
}

function axialCords() {
    changeCords("Axial");
}

function drawSpot(center_x, center_y, radius, color) {
    context.beginPath();
    context.arc(center_x, center_y, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
    context.stroke();
}

function drawHalo(center_x, center_y, radius) {
    drawSpot(center_x, center_y, radius + 3, "orange");
    drawSpot(center_x, center_y, radius, "black");
}

// draw hex
function drawHex(center_x, center_y, size) {
    context.moveTo(center_x, center_y);
    context.beginPath();
    for (var i = 0; i <= 6; i++) {
        angle = 2 * Math.PI / 6 * i;
        x_i = center_x + size * Math.cos(angle);
        y_i = center_y + size * Math.sin(angle);
        if (i === 0) {
            context.moveTo(x_i, y_i);
       } else {
            context.lineTo(x_i, y_i);
        }
    }
    context.strokeStyle = "white";
    context.lineWidth = 0.3;
    context.stroke();
}

function getHex(point) {
    var x = point[0];
    var y = point[1];
    var size = GridViewModel.hexSize();
    var q = 2 / 3 * x / size;
    var r = ((1 / 3 * Math.sqrt(3) * y) - (1 / 3 * x)) / size;
    var result = [q, r];
    return result;
}



function drawgrid() {
    //console.log("function=drawgrid");
    context.clearRect(0, 0, GridViewModel.canvasWidth(), GridViewModel.canvasHeight());

    function offset2Cube(cords) {
        var x = cords[0]; // q
        var y = cords[1] - (x - (Math.abs(x) % 2)) / 2; // cords[1] = r
        //var z = - x - y ;
        var z = x + y;
        var result = [x, y, z];
        return result;
    }

    function offset2Axiel(cords) {
        var x = cords[0]; // q
        var y = cords[1] - (x - (Math.abs(x) % 2)) / 2; // cords[1] = r
        var result = [x, y];
        return result;
    }

    // draw hex
    function writeCoordinates(center_x, center_y, x, y) {
        var c;
        var cw;

        if (GridViewModel.displayCoords() === "Offset") {
            cw = x + "," + y;
        } else if (GridViewModel.displayCords === "Axial") {
            c = offset2Axiel([x, y]);
            cw = c[0] + "," + c[1];
        } else { // Cube
            c = offset2Cube([x, y]);
            cw = c[0] + "," + c[1] + "," + c[2];
        }

        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText(cw, center_x, center_y);
    }


    var r = GridViewModel.hexSize();
    var sqrt_3_2 = Math.sqrt(3) / 2;
    var maxX = GridViewModel.canvasWidth() / r / 3 * 2;
    var maxY = GridViewModel.canvasHeight() / (r * sqrt_3_2 * 2);

    for (var y = 0; y <= maxY; y++) {
        for (var x = 0; x <= maxX; x++) {
            var xpos = x * 3 / 4 * 2 * r;
            var ypos = sqrt_3_2 * 2 * r * y;
            var offset = sqrt_3_2 * r;
            if (x % 2 === 1) {
                ypos = ypos + offset;
            }
            drawHex(xpos, ypos, r);
            drawHalo(xpos, ypos, 4);
            writeCoordinates(xpos, ypos - (sqrt_3_2 * r) + 10, x, y);

        }

    }

}

//canvas.addEventListener('mousemove', function (evt) {
//    
//
//}, false);



//canvas.addEventListener('mousedown', function (evt) {
//    var mousePos = getMousePos(canvas, evt);
//    document.getElementById("mouse_click").innerHTML = "Mouse Down Clicked";
//}, false);



//canvas.addEventListener('mouseup', function (evt) {
//    var mousePos = getMousePos(canvas, evt);
//    document.getElementById("mouse_click").innerHTML = "Mouse Up Clicked";
//}, false);



//canvas.addEventListener('mousewheel', function (evt) {
//    var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
    //wheelDelta Chrome // -detail Firefox
//    var input = document.getElementById('gridSize').value;
//    document.getElementById('gridSize').value = Math.max(30, parseInt(input) + delta);
//    drawgrid();
//}, false);
