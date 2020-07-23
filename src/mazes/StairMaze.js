/**
 * Stair maze generator. It forms a stair shaped maze.
 * @param {Object} opt
 * @param {number} opt.xlim Width of the grid
 * @param {number} opt.ylim Height of the grid
 * @param {number} opt.startX x co-ordinate of the source
 * @param {number} opt.startY y co-ordinate of the source
 * @param {number} opt.endX x co-ordinate of the destination
 * @param {number} opt.endY y co-ordinate of the destination
 * @param {Array<Object>} opt.checkpoints array of checkpoints on the grid
 */
function StairMaze(opt) {
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
StairMaze.prototype.createMaze = function () {
	var y = Math.floor(Math.random() * this.ylim / 2),
		x = 0;
	var startPos = y;
	for (let i = 0; i < 5; i++) {
		var downward_boundx = (i == 0) ? this.xlim / 3 : this.xlim;
		//Construct downward stair
		while (y < this.ylim * 2 / 3 && x < downward_boundx) {
			var ind = 0;
			for (let i = 0; i < this.checkpoints.length; i++) {
				if (this.checkpoints[i].x == x && this.checkpoints[i].y == y) {
					ind = -1;
					break;
				}
			}
			if ((x == this.startX && y == this.startY) || (x == this.endX && y == this.endY) || (ind == -1)) {} else {
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
		var upward_boundx = (i == 0) ? this.xlim * 2 / 3 : this.xlim;
		//Construct upward stair
		while (x < upward_boundx && y > startPos) {
			var ind = 0;
			for (let i = 0; i < this.checkpoints.length; i++) {
				if (this.checkpoints[i].x == x && this.checkpoints[i].y == y) {
					ind = -1;
					break;
				}
			}
			if ((x == this.startX && y == this.startY) || (x == this.endX && y == this.endY) || (ind == -1)) {} else {
				this.mazeWalls.push({
					x: x,
					y: y
				});
			}
			y--;
			x++;
		}
	}
	return this.mazeWalls;
}
module.exports = StairMaze;