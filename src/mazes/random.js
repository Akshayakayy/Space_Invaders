function RandomMaze(opt){
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
	RandomMaze.prototype.findmaze = function()
	{
		console.log("I am in randommaze");
		var x = 0,
            y = 0;
		while (x < this.xlim) {
	        while (y < this.ylim) {
	            if ((x == this.startX && y == this.startY) || (x == this.endX && y == this.endY))
	                y++;
	            else if (Math.random() > 0.8) {
	               	this.mazeWalls.push({
	                    x: x,
	                    y: y
	                });
	                //setTimeout(this.createMazeWall, 300, this, x, y);
	                //this.controller.createMazeWall(x,y);
	                y++;
	            } else {
	                y++;
	            }
	        }
	        y = 0;
	        x++;
	    }
	return this.mazeWalls;
	}
module.exports=RandomMaze;