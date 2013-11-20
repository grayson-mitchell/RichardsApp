function offset2Cube(cords){
    var x = cords[0]; // q
    var y = cords[1] - (x - (Math.abs(x)%2))/2; // cords[1] = r
    var z =  - x - y ;
    var result =  [x,y,z];
    return result;		
}

function offset2Axiel(cords){
    var x = cords[0]; // q
    var y = cords[1] - (x - (Math.abs(x)%2))/2; // cords[1] = r
    var result =  [x,y];
    return result;
}
	
function Axiel2Offset(cords){
        var x,y,result;
        x = cords[0];
        y = cords[1] +  (x - (Math.abs(x)%2))/2;
        //console.log("Axiel2Offset: x=" + x + ", y=" + y);
        result = [x,y];
        return result;
}
	
function Cube2Axiel(cords){
// Cube2Axiel doesn't really do anything as the first to values of cube are the axiel co-ordinates
        var x = cords[0];
        var y = cords[1];
        var result =  [x,y];
        return result;					
}
	
function Axiel2Cube(cords){
        var x = cords[0];
        var y = cords[1];
        var z = - x - y;
        var result = [x,y,z];
        return result;
}
	
// round cube points to nearest hex
function hex_round(x,y,z){

        // with cube coordinates x + y + x = 0
        // round all values then discard value which
        // changed the most and set using above equality
        var rx,ry,rz,x_err,y_err,z_err,result;

        rx = Math.round(x);
        ry = Math.round(y);
        rz = Math.round(z);

        x_err = Math.abs(rx - x);
        y_err = Math.abs(ry - y);
        z_err = Math.abs(rz - z);

        if (x_err > y_err && x_err > z_err ) { 
                rx = - ry - rz;
                }
        else if (y_err > z_err) {
                ry = - rx - rz;
                }
        else {
                rz = - rx - ry;
                }

//	console.log("hex_round: rx=" + rx + ", ry=" + ry + ", rz=" + rz);

        result = [rx,ry,rz];

        return result;
}
