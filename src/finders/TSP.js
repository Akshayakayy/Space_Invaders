/**
 * Travelling Salesman optimizer. It gives the permutation of checkpoints that gives minimum total distance travelled.
 * @param {Object} opt
 * @param {number} opt.xlim Width of the grid
 * @param {number} opt.ylim Height of the grid
 * @param {number} opt.startX x co-ordinate of the source
 * @param {number} opt.startY y co-ordinate of the source
 * @param {number} opt.endX x co-ordinate of the destination
 * @param {number} opt.endY y co-ordinate of the destination
 * @param {Array<Object>} opt.checkpoints array of checkpoints on the grid
 * @param {Array<Array<Object>} opt.grid Grid object
 * @param {Object} opt.finder Finder object
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
 * This finds all possible permutations of the checkpoints
 * @param {Array<Object>} checkpoints array of checkpoints on the grid
 * @return {Array<Array<Object>>} Returns all possible permutations of checkpoints
 */
TSP.prototype.permutationFinder = function (checkpoints) {
    let permutations = [];
    for (let i = 0; i < checkpoints.length; i = i + 1) {
        let rest = this.permutationFinder(checkpoints.slice(0, i).concat(checkpoints.slice(i + 1)));
        if (!rest.length) {
            permutations.push([checkpoints[i]]);
        } else {
            for (let j = 0; j < rest.length; j = j + 1) {
                permutations.push([checkpoints[i]].concat(rest[j]));
            }
        }
    }
    return permutations;
};
/** 
 * This performs the Travelling Salesman optimisation on the Graph formed
 * by the checkpoints, start and destination nodes
 * @param {Array<Object>} checkpoints array of checkpoints on the grid
 * @return {Array<Object>} Returns the permutation of checkpoints giving minimum total distance
 */
TSP.prototype.onTSP = function () {
    let permutations = this.permutationFinder(this.checkpoints);
    var minDistance = 999999;
    var minPermutation = [];
    for (let i = 0; i < permutations.length; i = i + 1) {
        var totalDistance = 0;
        for (let j = -1; j < (permutations[i].length); j = j + 1) {
            if (j == -1) {
                var originX = this.startX;
                var originY = this.startY;
            } else {
                var originX = permutations[i][j].x;
                var originY = permutations[i][j].y;
            }
            if (j == this.checkpoints.length - 1) {
                var destX = this.endX;
                var destY = this.endY;
            } else {
                var destX = permutations[i][j + 1].x;
                var destY = permutations[i][j + 1].y;
            }
            var grid = this.grid.clone();
            var possiblePath = this.finder.findPath(
                originX, originY, destX, destY, grid
            );
            if (!possiblePath['path'] || possiblePath['path'].length == 1) {
                //console.log("path not")
                return [this.checkpoints, 0];
            }
            totalDistance += PF.Util.pathLength(possiblePath['path']);
        }
        if (totalDistance < minDistance) {
            minDistance = totalDistance;
            minPermutation = permutations[i];
        }
    }
    //console.log(minPermutation)
    this.checkpoints = minPermutation;
    return [minPermutation, 1];
};


module.exports = TSP;