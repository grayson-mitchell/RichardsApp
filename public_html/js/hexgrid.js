//globals
var stars;

window.onload = function() {
    var canvas = document.getElementById('hexCanvas');	
                 
    canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;                
                 
    $.getJSON("stars.json", function(response) {
       stars = response;
       //NOTE: need to call hexgrid AFTER stars loaded
       hexgrid(canvas);
   });    
     
};

window.onresize = function(event) {
    var canvas = document.getElementById('hexCanvas');
    
    canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;   
    
    hexgrid(canvas);
};


// --------------------------------------------------------------------------------------------------------------------
// Utilities
// --------------------------------------------------------------------------------------------------------------------
	

// LPAD function doesn't seem to exist in javascript
function lpad (value,padding){
        var zeros = "0";
        for (var i = 0; i < padding; i++) {
                 zeros +- "0";
                 }
        return (zeros + value).slice(padding * -1);
}
	
// --------------------------------------------------------------------------------------------------------------------
// Main Grid Processing
// --------------------------------------------------------------------------------------------------------------------

// Main Function to manage Grid



function hexgrid(canvas){
	           											
    // ----- Variables ------ // 
	var ctx = canvas.getContext('2d');	
	//var canvas.width = canvas.height;
	//var canvas.height = canvas.width;
	var displayCords = "Offset";
	var r = 30; //  size of one side of hex, i.e. width is 2 r
	var sqrt_3_2 = Math.sqrt(3) / 2;		

	// used for calculating grid move	
	var clickDown = [0,0];   // location in canvas where the mouse down action occurred
	var moveGrid = 'N';
	//var gridPosX = 0;
	//var gridPosY = 0;
	
	// variables to manage grid position and scrolling	
	var swipeOffset = [0,0]; // the amount to move gird on current swipe (mouse down and move)
	var clickOffset = [0,0]; 	// total movement from prior swipes
	var totalOffset = [0,0];	
	
        
       

	// Constructor function for Hex object				
	function Hex()  {
		this.x = 0;
		this.y = 0;
		this.cord = "Axial";		
		this.background ="black";
		this.edge ="white";
		this.size = r;
		this.fill = true;
		this.line = 0.3;
		this.draw = function(ctx){
				ctx.moveTo(this.x, this.y);
				ctx.beginPath();
				for (var i=0; i<=6; i++) {
					angle = Math.PI / 3 * i; 
					xi =  this.x + this.size * Math.cos(angle);
					yi =  this.y + this.size * Math.sin(angle);				
					if (i === 0) {
						ctx.moveTo(xi, yi);
						}
					else {
						ctx.lineTo(xi, yi)
						}
				}
				ctx.closePath();
				if (this.fill){
					ctx.fillStyle = this.background;
					ctx.fill();
					}
				ctx.strokeStyle = this.edge;
				ctx.lineWidth = this.line;
				ctx.stroke();	
			}	
		};


	// Get Mouse position on canvas 
	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
		  x: evt.clientX - rect.left,
		  y: evt.clientY - rect.top
		};
	};
	
	// draw Border
	function drawBorder(x,y,side){
	//console.log ("drawBorder: x="  + x + ", y=" +y + ", side=" + side);
		ctx.moveTo(x, y);
		ctx.beginPath();
		
		switch (side) {
			case "top" :
				i = 4;
				break;
			case "top_right":
				i=5;
				break;
			case "bottom_right":
				i=6;
				break;
			case "bottom":
				i=1;
				break;
			case "bottom_left":
				i=2;
				break;
			case "top_left":				
				i=3;
				break;
			default:
				null;
			}	

			angle = Math.PI / 3 * i; 
			xi =  x + r * Math.cos(angle);
			yi =  y + r * Math.sin(angle);				
			ctx.moveTo(xi, yi);

			angle = Math.PI / 3 *  (i+1); 
			xi =  x + r * Math.cos(angle);
			yi =  y + r * Math.sin(angle);	
			ctx.lineTo(xi, yi);
			
			ctx.strokeStyle = "red";
			ctx.lineWidth = 2;
			ctx.stroke();	
			ctx.closePath();				
	}
		
	// drawSpot 
	function drawSpot  (x,y,radius,color){
		ctx.beginPath();
		ctx.arc(x,y,radius,0,2*Math.PI);
		ctx.fillStyle = color; 
		ctx.fill();			
		ctx.stroke();	
	}
	
	// return nearest hex at a given point		
	function getHex(p,q){
		var x,y,z, result;
	
		x = (2 / 3 * p / r) ;
		y = ((1/3 * Math.sqrt(3) * q) - (1/3 * p )) / r;
		z =  - x - y;
                
               

		console.log("getHex: totalOffset[0]=" + totalOffset[0] + ", totalOffset[1]=" + totalOffset[0] );	
		console.log("getHex: q=" + q + ", p=" + p  + ", r=" + r);
		console.log("getHex: x=" + x + ", y=" + y + ", z=" + z);		
		result = hex_round(x,y,z);
                
                if (Math.abs(result[0] % 2) === 1) {
                    result[1] = result[1] + 1;
                }

		return result;
	}

	// return hex at a given point // centre of hex
	function getPoint(p,q){
	
		var x,y,p,q,offset,result;

		var x = Math.round ((p * 1.5 * r) - (totalOffset[0]));			
		var y = Math.round((sqrt_3_2 * 2 * r * q)- totalOffset[1] );
		var offset = - Math.round(sqrt_3_2 * r); 

		if (Math.abs(p % 2) === 1) {  // need absolute because -1 mod 2 = -1, not 1
			y = y + offset;
			}
		
		//console.log("getPoint: x=" + x + ", y=" + y);			
		result = [x,y];
		return result;
	}	
	
	
	function writeHex(text,x,y) {
		ctx.font = '7pt arial';
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText(text,x, y);
	}

	
	function writeCoordinates (center_x,center_y,x,y) {
		var c;
		var cw;
						
		if  (displayCords === "Offset") {
			x = x%8;
			
			if (x===0){
				x=8;
			}
			y = y%10;
			
			if (y===0){
				y=10;
			}
			
			cw = lpad(x,2) + lpad(y,2);
		}
		else if  (displayCords === "Axial") {
			c = offset2Axiel([x,y]);
			cw = c[0]  + "," + c[1];
		}
		else { // Cube
			c= offset2Cube([x,y]); 
			cw = c[0]  + "," + c[1] + "," + c[2];
		}
		writeHex(cw,center_x, center_y);
	}
        
//var GetStarArray = function(id) {
//    var i = null;
//    for (i = 0; stars.star.length > i; i += 1) {
//        if (stars.star[i].id === id) {
//            return i;
//        }
//    }
//     
//    return -1;
//};        
	
	function drawgrid(){
	
                        
            
		// r = length of each vertices, there for width is 2r
		// hight is root 3 over 2 r from centre to top, so total hight root 3 times r
		// Horizontal distance between hexes is 1 1/2 * r
		//var r = document.getElementById('gridSize').value;
		var hx,hy,center,px,py;
		var cStar ; // coordinate of the star in offset if it exists
		
		var maxX = (canvas.width /  r  / 3 * 2) +1;
		var maxY = (canvas.height /  (r  *  sqrt_3_2 * 2 ))+1;
		var h = new Hex();
		
		// clear canvas to be redrawn
		ctx.clearRect(0, 0, canvas.width,canvas.height);		
		
		totalOffset[0] = clickOffset[0] + swipeOffset[0];
		totalOffset[1] = clickOffset[1] + swipeOffset[1];
		
		//document.getElementById("totalOffset").innerHTML = "Total Amount of Grid Move: " + Math.round(totalOffset[0])  + "," + Math.round(totalOffset[1]);
		//document.getElementById("clickOffset").innerHTML = "Amount at Click: " + Math.round(clickOffset[0]) + "," + Math.round(clickOffset[1]);
		//document.getElementById("swipeOffset").innerHTML = "Current of Grid Move: " + Math.round(swipeOffset[0]) + "," + Math.round(swipeOffset[1]);
		
		hx = Math.round(totalOffset[0] /  r  / 3 * 2);  // Hex offset x
		hy = Math.round(totalOffset[1] /  (r  *  sqrt_3_2 * 2 ));  // Hex offset y		
		
		for (var y=hy+1; y<= maxY + hy; y++) {
			for (var x=hx+1; x<= maxX + hx; x++) {			
				
				if ( x < 33 && y < 41 ) {			// Limit size to one sector of 32 x 40	
					center = getPoint(x,y);
					px = center[0];
					py = center[1];
					// Draw Hex
					h.x = px;
					h.y = py;			
					h.background ="black";
					h.edge ="white";
					h.draw(ctx);
					
					// Draw Stars
					cStar = lpad(x,2) + lpad(y,2);
                                        //var cStar = GetStarArray(cStar);
                                        if(stars.star.hasOwnProperty(cStar)){
					//if(stars.hasOwnProperty(cStar)){
						drawSpot(center[0],center[1],5,"yellow");	
						writeHex(stars.star[cStar].worldCode.substr(0,1),px,py+20) ;
					}			
					writeCoordinates( px, py - (sqrt_3_2 * r ) + 10,x,y);	 // 10 from the top of the hex
				}
			}
		}
		
		// Draw sub-sector boarders
		
		for (var y=hy; y<= maxY + hy; y++) {
			for (var x=hx; x<= maxX + hx; x++) {			
				
				if (x > 0 && y > 0 && x < 33 && y < 41 ) {			// Limit size to one sector of 32 x 40	
				//	console.log ("Math.abs(x)%8="  + Math.abs(x)%8);
					center = getPoint(x,y);
					
					// draw left border
					if  (Math.abs(x)%8 === 1)  {
						drawBorder(center[0],center[1],"top_left");
						drawBorder(center[0],center[1],"bottom_left");
						}
					// draw top border	
					if (Math.abs(y)%10 === 1)  {
						drawBorder(center[0],center[1],"top");
						if (Math.abs(x)%2 === 1) {
							drawBorder(center[0],center[1],"top_left");
							drawBorder(center[0],center[1],"top_right");
						}
					}
					// draw bottom border
					if (y === 40)  {
						drawBorder(center[0],center[1],"bottom");
						if (Math.abs(x)%2 === 0) {
							drawBorder(center[0],center[1],"bottom_left");
							drawBorder(center[0],center[1],"bottom_right");
						}						
						
					}	
				}
			}
		}	
		// Draw stars
		// drawstars();
		
	}

	
// --------------------------------------------------------------------------------------------------------------------
// HTML Button Functions
// --------------------------------------------------------------------------------------------------------------------		

	function changeCords(system) {
		
			displayCords = system;	
		//	console.log("displayCords=" + system);			
			drawgrid();
		}		



// --------------------------------------------------------------------------------------------------------------------
// Event Listeners
// --------------------------------------------------------------------------------------------------------------------	
var prevX = -1;
var prevY = -1;
var prevHex;
        
	canvas.addEventListener('mousemove', function(evt) {
		var mousePos = getMousePos(canvas, evt);
		var gridPos, p, q,center;
		var cube,offset;
		var cStar;
                 
                
		
		p = mousePos.x + totalOffset[0];
		q = mousePos.y + totalOffset[1];

		cube = getHex(p,q);  // this is returned in cube/axial
		offset = Axiel2Offset([cube[0],cube[1]]); // Converted to Offset

		if (moveGrid == 'Y') {
			swipeOffset[0] =  (Math.round(mousePos.x) -  clickDown[0]);
			swipeOffset[1] = (Math.round(mousePos.y) -  clickDown[1]);
		}

                //redraw selection
                if (prevX > -1 & prevY > -1) {
                    ctx.putImageData(prevHex, prevX, prevY)    
                }
                    
                
  			
		// highlight hex under mouse pointer
		center = getPoint(offset[0],offset[1]);
		h = new Hex();				
			h.x = center[0];
			h.y  =  center[1];
			h.fill =false;
			h.size = r * 0.5
			h.line = 1;
			h.edge ="white";
                
                //capture prev hex
             
            
               //reset prevX, Y
                prevX = h.x-r;
                prevY = h.y-r;   
                
                //this line causes distortion!!!
                prevHex = ctx.getImageData(prevX, prevY, r*2, r*2);
                        
		h.draw(ctx);
		
		cStar = lpad(Math.round(offset[0]),2) + lpad(Math.round(offset[1]),2);
                document.getElementById("location").innerHTML = "location: " + cStar;
                
                if(stars.star.hasOwnProperty(cStar)){
			document.getElementById("sub_sector").innerHTML = "Sector: " + stars.star[cStar].sector;
			document.getElementById("system_name").innerHTML = "System Name: " + stars.star[cStar].name;
			document.getElementById("world_code").innerHTML = "World Code: " + stars.star[cStar].worldCode;
			document.getElementById("sytstem_notes").innerHTML = "System Notes: " + stars.star[cStar].notes;							
			}
		else {
		// Should use some sort of hide method here, but not worrying to much about formatting yet
			document.getElementById("sub_sector").innerHTML = "";
			document.getElementById("system_name").innerHTML = "";
			document.getElementById("world_code").innerHTML = "";
			document.getElementById("sytstem_notes").innerHTML = "";
		}
		
		
		// draw spot at mouse pointer location
		//if (moveGrid == 'Y') {
		//	drawSpot(mousePos.x,mousePos.y,8,"green");
		//	}
		//else {
		//	drawSpot(mousePos.x,mousePos.y,8,"blue");
		//}
		
		// Write mouse positions to HTML
		document.getElementById("mouse_position").innerHTML = "Mouse Position (Pixel): " + mousePos.x + "," + Math.ceil(mousePos.y);	// not sure why mousePos.y isn't a whole number
		document.getElementById("hex_position_offset").innerHTML = "Offset Cords: " + Math.round(offset[0]) + "," + Math.round(offset[1]);
		document.getElementById("hex_position_cube").innerHTML = "Axiel / Cube Cords: " + Math.round(cube[0]) + "," + Math.round(cube[1]) + "," + Math.round(cube[2]) ;
		//document.getElementById("hex_center").innerHTML = "Center of current hex: " + center[0] + "," +  center[1];
		
	}, false);

		
	//canvas.addEventListener('mousewheel', function(evt) {
                        //does not work well with scrolling being mousewheel
			//var delta = Math.max(-1,Math.min(1,(evt.wheelDelta || -evt.detail))); 
			//wheelDelta Chrome // -detail Firefox
			
		//	document.getElementById('gridSize').value = Math.max(30,parseInt(document.getElementById('gridSize').value)  + delta);
		//	r = document.getElementById('gridSize').value;
			//r = Math.max(30,r)  + delta
		//	drawgrid();
	//}, false);

	canvas.addEventListener('mousedown', function(evt) {
		var mousePos = getMousePos(canvas, evt);	
		
		clickDown[0] = Math.round(mousePos.x);
		clickDown[1] = Math.round(mousePos.y);
		moveGrid = 'Y';
//		drawSpot(mousePos.x,mousePos.y,8,"green");
	}, false);

	canvas.addEventListener('mouseup', function(evt) {
	//	document.getElementById("mouse_click").innerHTML =	"Mouse Up Clicked";
		moveGrid = 'N';
		
		clickOffset[0] = clickOffset[0] + swipeOffset[0];
		clickOffset[1] = clickOffset[1] + swipeOffset[1];
		swipeOffset[0] = 0;
		swipeOffset[1] = 0;
		
	}, false);	
		    
    
// --------------------------------------------------------------------------------------------------------------------
// Script begin here
// --------------------------------------------------------------------------------------------------------------------				
		
	document.getElementById("Cube").onclick = function(){changeCords("Cube");};
	document.getElementById("Offset").onclick = function(){changeCords("Offset");};	
	document.getElementById("Axial").onclick = function(){changeCords("Axial");};	

	drawgrid();
	
	//console.log(sector.star[0].name);
}		
