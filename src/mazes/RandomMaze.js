/**
 * Random maze generator. It goes through all the grid and assigns it as a wall with prob 0.2.
 * @param {Object} opt
 * @param {number} opt.xlim Width of the grid
 * @param {number} opt.ylim Height of the grid
 * @param {number} opt.startX x co-ordinate of the source
 * @param {number} opt.startY y co-ordinate of the source
 * @param {number} opt.endX x co-ordinate of the destination
 * @param {number} opt.endY y co-ordinate of the destination
 * @param {Array<Object>} opt.checkpoints array of checkpoints on the grid
 */

function RandomMaze(opt) {
	opt = opt || {};
	this.mazeWalls = [];
	this.xlim = opt.xlim;
	this.ylim = opt.ylim;
	this.startX = opt.startX;
	this.startY = opt.startY;
	this.endX = opt.endX;
	this.endY = opt.endY;
	this.checkpoints = opt.checkpoints;
}
/** 
 * This creates the random maze
 * @return {Array<Object>} Returns the mazewalls
 */

RandomMaze.prototype.createMaze = function () {
	var x = 0,
		y = 0;
	while (x < this.xlim) {
		while (y < this.ylim) {
			var ind = 0;
			for (let i=0;i<this.checkpoints.length;i++){
				if (this.checkpoints[i].x==x && this.checkpoints[i].y==y){
					ind = -1;
					break;
				}
			}
			if ((x == this.startX && y == this.startY) || (x == this.endX && y == this.endY) || (ind == -1))
				y++;
			else if (Math.random() > 0.8) {
				this.mazeWalls.push({
					x: x,
					y: y
				});
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
module.exports = RandomMaze;