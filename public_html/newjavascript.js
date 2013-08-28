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


var gridViewModel = {
    hexSize: ko.observable("30"),
    canvasWidth: ko.observable("0"),
    canvasHeight: ko.observable("0"),
    displayCoords: ko.observable("Axial"),
    pixel: ko.observable("0"),
    hex: ko.observable("0"),
    triggerRedraw: ko.observable(false)        
};
ko.applyBindings(gridViewModel );

//Gobeldegook code to bind the canvas MVVM style
//http://gistflow.com/posts/382-knockout-js-canvas-and-context-3-knockout-hints
//ko.bindingHandlers.context = {
//  init:function(element, valueAccessor, allBindingsAccessor, viewModel){
//    viewModel.__context__ = element.getContext("2d");
//  },
//  update:function(element, valueAccessor, allBindingsAccessor, viewModel){
//  var callback = ko.utils.unwrapObservable(allBindingsAccessor().contextCallback);
//  callback.call(viewModel, viewModel.__context__);
//  }
//};

function UpdateMousePos(data, event) {
    var mousePos = getMousePos(hexCanvas, event);
    var gridPos = getHex([mousePos.x, mousePos.y]);
    gridViewModel.hex(Math.round(gridPos[0]) + "," + Math.round(gridPos[1]));
    gridViewModel.pixel(mousePos.x + "," + mousePos.y); // not sure why mousePos.y isn't a whole number
    DrawGrid();

    drawSpot(mousePos.x, mousePos.y, 8, "blue");    
    
    optionsContext.rect(0,0, optionsCanvas.width,optionsCanvas.height)
    optionsContext.fillStyle="grey";
    optionsContext.fill();
    
    optionsContext.fillStyle="black";
    optionsContext.font="18px Arial";
    optionsContext.fillText("Traveller Hex Grid",10,20);
    optionsContext.font="14px Arial";
    optionsContext.fillText("hex location: " + gridViewModel.hex(),10,40);
}


//If using JQuery can use $Window to find resize
//var $window = $(window);
//$window.resize(function() {
//    gridViewModel.canvasHeight(canvas.width);
//    gridViewModel.canvasWidth($window.height)
//})

var hexCanvas = document.getElementById('hexCanvas');
var hexContext = hexCanvas.getContext('2d');

var optionsCanvas = document.getElementById('optionsCanvas');
var optionsContext = optionsCanvas.getContext('2d');

DrawGrid();

function getMousePos(hexCanvas, evt) {
    var rect = hexCanvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - Math.floor(rect.top)
    };
}

function changeCords(system) {
    displayCords = system;
    //console.log("displayCords=" + system);
    DrawGrid();
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
    hexContext.beginPath();
    hexContext.arc(center_x, center_y, radius, 0, 2 * Math.PI);
    hexContext.fillStyle = color;
    hexContext.fill();
    hexContext.stroke();
}

function drawHalo(center_x, center_y, radius) {
    drawSpot(center_x, center_y, radius + 3, "orange");
    drawSpot(center_x, center_y, radius, "black");
}

// draw hex
function drawHex(center_x, center_y, size) {
    hexContext.moveTo(center_x, center_y);
    hexContext.beginPath();
    for (var i = 0; i <= 6; i++) {
        angle = 2 * Math.PI / 6 * i;
        x_i = center_x + size * Math.cos(angle);
        y_i = center_y + size * Math.sin(angle);
        if (i === 0) {
            hexContext.moveTo(x_i, y_i);
       } else {
            hexContext.lineTo(x_i, y_i);
        }
    }
    hexContext.strokeStyle = "white";
    hexContext.lineWidth = 0.3;
    hexContext.stroke();
}

function getHex(point) {
    var x = point[0];
    var y = point[1];
    var size = gridViewModel.hexSize();
    var q = 2 / 3 * x / size;
    var r = ((1 / 3 * Math.sqrt(3) * y) - (1 / 3 * x)) / size;
    var result = [q, r];
    return result;
}



function DrawGrid() {
    //console.log("function=drawgrid");
    hexContext.clearRect(0, 0, hexCanvas.width, hexCanvas.height);

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

        if (gridViewModel.displayCoords() === "Offset") {
            cw = x + "," + y;
        } else if (gridViewModel.displayCords === "Axial") {
            c = offset2Axiel([x, y]);
            cw = c[0] + "," + c[1];
        } else { // Cube
            c = offset2Cube([x, y]);
            cw = c[0] + "," + c[1] + "," + c[2];
        }

        hexContext.fillStyle = "white";
        hexContext.textAlign = "center";
        hexContext.fillText(cw, center_x, center_y);
    }


    var r = gridViewModel.hexSize();
    var sqrt_3_2 = Math.sqrt(3) / 2;
    var maxX = gridViewModel.canvasWidth() / r / 3 * 2;
    var maxY = gridViewModel.canvasHeight() / (r * sqrt_3_2 * 2);

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

var resizeTimer;
window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() { ResizeDraw();}, 100);
});

function ResizeDraw() {
    hexCanvas.width  = window.innerWidth;
    hexCanvas.height = window.innerHeight;
    
    optionsCanvas.left = hexCanvas.width - optionsCanvas.width - 10;
    
  
    gridViewModel.canvasWidth(hexCanvas.width);
    gridViewModel.canvasHeight(hexCanvas.height);    
  
    DrawGrid();    
}
    
window.onload = ResizeDraw;
    

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
