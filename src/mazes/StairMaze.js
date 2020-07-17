function StairMaze(opt){
	opt = opt || {};
	this.mazeWalls = [];
	this.xlim = opt.xlim;
	this.ylim = opt.ylim;
	this.startX = opt.startX;
	this.startY = opt.startY;
	this.endX = opt.endX;
	this.endY = opt.endY;
	this.controller = opt.controller;
	}
	StairMaze.prototype.findmaze = function()
	{
		console.log("I am in stairmaze");
		var y = Math.floor(Math.random()*this.ylim/2),
            x = 0;
        var start_pos = y;
        for (let i=0;i<5;i++){
        var bound1x = (i==0)?this.xlim/3:this.xlim;
		while (y < this.ylim*2/3 && x<bound1x) {
            if ((x == this.startX && y == this.startY) || (x == this.endX && y == this.endY)){}
            	else{
                this.mazeWalls.push({
	                    x: x,
	                    y: y
	                });
	            }  
	            y++;
                x++; 
            	       
        	}
        x++;
        y++;
        var bound2x = (i==0)?this.xlim*2/3:this.xlim;
	    while (x < bound2x && y > start_pos) {
            if ((x == this.startX && y == this.startY) || (x == this.endX && y == this.endY)){}
            else{
                this.mazeWalls.push({
	                    x: x,
	                    y: y
	                }); 
            	}
	            y--;
                x++;     
        	}
        }
	    
    console.log(this.mazeWalls);
	return this.mazeWalls;
		}
module.exports=StairMaze;