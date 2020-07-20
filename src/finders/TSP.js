/**
 * Random maze generator. It goes through all the grids and assigns it as a wall with prob 0.2.
 * @param {Object} opt
 * @param {number} opt.xlim Width of the grid
 * @param {number} opt.ylim Height of the grid
 * @param {number} opt.startX x co-ordinate of the source
 * @param {number} opt.starty y co-ordinate of the source
 * @param {number} opt.endX x co-ordinate of the destination
 * @param {number} opt.endY y co-ordinate of the destination
 */
function TSP(opt) {
    opt = opt || {};
    this.startX = opt.startX;
    this.startY = opt.startY;
    this.endX = opt.endX;
    this.endY = opt.endY;
    this.checkpoints = opt.checkpoints;
    this.grid = opt.grid;
    this.finder = opt.finder;
};
/** 
 * This creates the random maze
 * @return {Array<number>} Returns the mazewalls
 */
TSP.prototype.permfinder = function (checkpoints) {
    let perms = [];
    for (let i = 0; i < checkpoints.length; i = i + 1) {
        let rest = this.permfinder(checkpoints.slice(0, i).concat(checkpoints.slice(i + 1)));
        if (!rest.length) {
            perms.push([checkpoints[i]]);
        } else {
            for (let j = 0; j < rest.length; j = j + 1) {
                perms.push([checkpoints[i]].concat(rest[j]));
            }
        }
    }
    return perms;
};
/** 
 * This creates the random maze
 * @return {Array<number>} Returns the mazewalls
 */
TSP.prototype.onTSP = function () {
    let perms = this.permfinder(this.checkpoints);
    var mindist = 999999;
    var minperm = [];
    // this.pathfound = 1
    for (let i = 0; i < perms.length; i = i + 1) {
        var totaldist = 0;
        for (let j = -1; j < (perms[i].length); j = j + 1) {
            if (j == -1) {
                var originX = this.startX;
                var originY = this.startY;
            } else {
                var originX = perms[i][j].x;
                var originY = perms[i][j].y;
            }
            if (j == this.checkpoints.length - 1) {
                var destX = this.endX;
                var destY = this.endY;
            } else {
                var destX = perms[i][j + 1].x;
                var destY = perms[i][j + 1].y;
            }
            // var originX = perms[i][j].x;
            // var originY = perms[i][j].y;
            // var destX = perms[i][j + 1].x;
            // var destY = perms[i][j + 1].y;
            var grid = this.grid.clone();
            var res = this.finder.findPath(
                originX, originY, destX, destY, grid
            );
            if (!res['path'] || res['path'].length == 1) {
                console.log("path not")
                return [this.checkpoints, 0];
            }
            totaldist += PF.Util.pathLength(res['path']);
        }
        if (totaldist < mindist) {
            mindist = totaldist;
            minperm = perms[i];
        }
    }
    console.log(minperm)
    this.checkpoints = minperm;
    return [minperm, 1];
};


module.exports = TSP;