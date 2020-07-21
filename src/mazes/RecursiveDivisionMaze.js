/**
 * Recursive division maze generator. Based on https://gist.github.com/jamis/761525
 * @param {Object} opt
 * @param {number} opt.xlim Width of the grid
 * @param {number} opt.ylim Height of the grid
 * @param {number} opt.startX x co-ordinate of the source
 * @param {number} opt.startY y co-ordinate of the source
 * @param {number} opt.endirectionX x co-ordinate of the destination
 * @param {number} opt.endirectionY y co-ordinate of the destination
 * @param {Array<Object>} opt.checkpoints array of checkpoints on the grid
 */
function RecDivMaze(opt) {
	opt = opt || {};
	this.mazeWalls = [];
	this.xlim = opt.xlim;
	this.ylim = opt.ylim;
	this.startX = opt.startX;
	this.startY = opt.startY;
	this.endX = opt.endX;
	this.endY = opt.endY;
	this.checkpoints = opt.checkpoints;
	this.horizontalFlag = 1;
	this.verticalFlag = 2;
	this.southFlag = 1;
	this.eastFlag = 2;
}

/** 
 * This chooses the orientation to create the next wall: horizontal or vertical
 * @param {number} width
 * @param {number} height
 * @return {number} Returns the orientation
 */
RecDivMaze.prototype.choose_orientation = function (width, height) {
	if (width < height)
		return this.horizontalFlag;
	else if (height < width)
		return this.verticalFlag;
	else
		return Math.floor(Math.random() * 2) == 0 ? this.horizontalFlag : this.verticalFlag;
}
/** 
 * This recursively divides the grid 
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} orientation
 */
RecDivMaze.prototype.divide = function (x, y, width, height, orientation) {
	if (width < 4 || height < 4)
		return;
	var horizontal = orientation == this.horizontalFlag;
	var wallX = x + (horizontal ? 0 : Math.floor(Math.random() * (width - 2)));
	var wallY = y + (horizontal ? Math.floor(Math.random() * (height - 2)) : 0);
	var passageX = wallX + (horizontal ? Math.floor(Math.random() * width) : 0);
	var passageY = wallY + (horizontal ? 0 : Math.floor(Math.random() * height));
	var directionX = horizontal ? 1 : 0;
	var directionY = horizontal ? 0 : 1;
	var length = horizontal ? width : height;
	var perpDirection = horizontal ? this.southFlag : this.eastFlag;
	for (let i = 0; i < length; i++) {
		if (wallX != passageX || wallY != passageY) {
			var ind = 0;
			for (let i = 0; i < this.checkpoints.length; i++) {
				if (this.checkpoints[i].x == wallX && this.checkpoints[i].y == wallY) {
					ind = -1;
					break;
				}
			}
			if ((wallX == this.startX && wallY == this.startY) || (wallX == this.endX && wallY == this.endY) || (ind == -1)) {} else {
				this.mazeWalls.push({
					x: wallX,
					y: wallY
				});
			}
		}
		wallX += directionX;
		wallY += directionY;

	}
	var nextX = x,
		nextY = y;
	var nextWidth = horizontal ? width : (wallX - x + 1);
	var nextHeight = horizontal ? (wallY - y + 1) : height;
	this.divide(nextX, nextY, nextWidth, nextHeight, this.choose_orientation(nextWidth, nextHeight));
	nextX = horizontal ? x : wallX + 1;
	nextY = horizontal ? wallY + 1 : y;
	nextWidth = horizontal ? width : (x + width - wallX - 1);
	nextHeight = horizontal ? (y + height - wallY - 1) : height;
	this.divide(nextX, nextY, nextWidth, nextHeight, this.choose_orientation(nextWidth, nextHeight));
}
/** 
 * This creates the random maze
 * @return {Array<Object>} Returns the mazewalls
 */
RecDivMaze.prototype.createMaze = function () {
	this.divide(0, 0, this.xlim, this.ylim, this.choose_orientation(this.xlim, this.ylim));
	return this.mazeWalls;
}
module.exports = RecDivMaze;