/**
 * Recursive division maze generator. Based on https://gist.github.com/jamis/761525
 * @param {Object} opt
 * @param {number} opt.xlim Width of the grid
 * @param {number} opt.ylim Height of the grid
 * @param {number} opt.startX x co-ordinate of the source
 * @param {number} opt.starty y co-ordinate of the source
 * @param {number} opt.endX x co-ordinate of the destination
 * @param {number} opt.endY y co-ordinate of the destination
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
}
var hor = 1,
	vert = 2;
var s = 1,
	e = 2;
/** 
 * This creates the random maze
 * @param {number} Width
 * @return {Array<number>} Returns the mazewalls
 */
RecDivMaze.prototype.choose_orientation = function (width, height) {
	if (width < height)
		return hor;
	else if (height < width)
		return vert;
	else
		return Math.floor(Math.random() * 2) == 0 ? hor : vert;
}
/** 
 * This creates the random maze
 * @return {Array<number>} Returns the mazewalls
 */
RecDivMaze.prototype.divide = function (x, y, width, height, orientation) {
	console.log("I am in recdivide");
	if (width < 4 || height < 4)
		return;
	var horizontal = orientation == hor;
	var wx = x + (horizontal ? 0 : Math.floor(Math.random() * (width - 2)));
	var wy = y + (horizontal ? Math.floor(Math.random() * (height - 2)) : 0);
	var px = wx + (horizontal ? Math.floor(Math.random() * width) : 0);
	var py = wy + (horizontal ? 0 : Math.floor(Math.random() * height));
	var dx = horizontal ? 1 : 0;
	var dy = horizontal ? 0 : 1;
	var length = horizontal ? width : height;
	var dir = horizontal ? s : e;
	for (let i = 0; i < length; i++) {
		if (wx != px || wy != py) {
			if ((wx == this.startX && wy == this.startY) || (wx == this.endX && wy == this.endY)) {} else {
				this.mazeWalls.push({
					x: wx,
					y: wy
				});
			}
		}
		wx += dx;
		wy += dy;

	}
	var nx = x,
		ny = y;
	var w = horizontal ? width : (wx - x + 1);
	var h = horizontal ? (wy - y + 1) : height;
	this.divide(nx, ny, w, h, this.choose_orientation(w, h));
	nx = horizontal ? x : wx + 1;
	ny = horizontal ? wy + 1 : y;
	w = horizontal ? width : (x + width - wx - 1);
	h = horizontal ? (y + height - wy - 1) : height;
	this.divide(nx, ny, w, h, this.choose_orientation(w, h));
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