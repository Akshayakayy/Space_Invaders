
var JumpPointFinderBase = require('./JumpPointFinderBase');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Path finder using the Jump Point Search algorithm allowing only horizontal
 * or vertical movements.
 */
function JPFNeverMoveDiagonally(opt) {
    JumpPointFinderBase.call(this, opt);
}

JPFNeverMoveDiagonally.prototype = new JumpPointFinderBase();
JPFNeverMoveDiagonally.prototype.constructor = JPFNeverMoveDiagonally;

/**
 * Search recursively in the direction (parent -> child), stopping only when a
 * jump point is found.
 * @protected
 * @return {Array<Array<number>>} The x, y coordinate of the jump point
 *     found, or null if not found
 */
JPFNeverMoveDiagonally.prototype._jump = function (x, y, px, py, operations) {
    var grid = this.grid,
        dx = x - px, dy = y - py;
        
    if (!grid.isWalkableAt(x, y)) {
        res = {
            jumppoint: null,
            operations: operations
        }
        // console.log("res1",res)
        return res
    }

    if (this.trackJumpRecursion === true) {
        grid.getNodeAt(x, y).tested = true;
        operations.push({
            x: x,
            y: y,
            attr: 'tested',
            value: true
        });
        // console.log(operations)
    }

    if (grid.getNodeAt(x, y) === this.endNode) {
        res = {
            jumppoint: [x, y],
            operations: operations
        }
        // console.log("res2",res)
        return res
    }

    if (dx !== 0) {
        if ((grid.isWalkableAt(x, y - 1) && !grid.isWalkableAt(x - dx, y - 1)) ||
            (grid.isWalkableAt(x, y + 1) && !grid.isWalkableAt(x - dx, y + 1))) {
            res = {
                jumppoint: [x, y],
                operations: operations
            }
            // console.log("res3",res)
            return res
        }
    }
    else if (dy !== 0) {
        if ((grid.isWalkableAt(x - 1, y) && !grid.isWalkableAt(x - 1, y - dy)) ||
            (grid.isWalkableAt(x + 1, y) && !grid.isWalkableAt(x + 1, y - dy))) {
            res = {
                jumppoint: [x, y],
                operations: operations
            }
            // console.log("res4",res)
            return res
        }
        //When moving vertically, must check for horizontal jump points
        check1 = this._jump(x + 1, y, x, y, operations)
        if (check1) {
            res = {
                jumppoint: [x, y],
                operations: check1['operations']
            }
            // console.log("res5",res)
            return res
        }
        check2 = this._jump(x - 1, y, x, y, check1['operations'])
        if (check2) {
            res = {
                jumppoint: [x, y],
                operations: check2['operations']
            }
            // console.log("res6",res)
            return res
        }
    }
    else {
        throw new Error("Only horizontal and vertical movements are allowed");
    }

    return this._jump(x + dx, y + dy, x, y, operations);
};

/**
 * Find the neighbors for the given node. If the node has a parent,
 * prune the neighbors based on the jump point search algorithm, otherwise
 * return all available neighbors.
 * @return {Array<Array<number>>} The neighbors found.
 */
JPFNeverMoveDiagonally.prototype._findNeighbors = function (node) {
    var parent = node.parent,
        x = node.x, y = node.y,
        grid = this.grid,
        px, py, nx, ny, dx, dy,
        neighbors = [], neighborNodes, neighborNode, i, l;

    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
        px = parent.x;
        py = parent.y;
        // get the normalized direction of travel
        dx = (x - px) / Math.max(Math.abs(x - px), 1);
        dy = (y - py) / Math.max(Math.abs(y - py), 1);

        if (dx !== 0) {
            if (grid.isWalkableAt(x, y - 1)) {
                neighbors.push([x, y - 1]);
            }
            if (grid.isWalkableAt(x, y + 1)) {
                neighbors.push([x, y + 1]);
            }
            if (grid.isWalkableAt(x + dx, y)) {
                neighbors.push([x + dx, y]);
            }
        }
        else if (dy !== 0) {
            if (grid.isWalkableAt(x - 1, y)) {
                neighbors.push([x - 1, y]);
            }
            if (grid.isWalkableAt(x + 1, y)) {
                neighbors.push([x + 1, y]);
            }
            if (grid.isWalkableAt(x, y + dy)) {
                neighbors.push([x, y + dy]);
            }
        }
    }
    // return all neighbors
    else {
        neighborNodes = grid.getNeighbors(node, DiagonalMovement.Never);
        for (i = 0, l = neighborNodes.length; i < l; ++i) {
            neighborNode = neighborNodes[i];
            neighbors.push([neighborNode.x, neighborNode.y]);
        }
    }

    return neighbors;
};

module.exports = JPFNeverMoveDiagonally;
