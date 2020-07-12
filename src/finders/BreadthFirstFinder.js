var Util = require('../core/Util');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Breadth-First-Search path finder.
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */
function BreadthFirstFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.diagonalMovement = opt.diagonalMovement;

    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) {
            this.diagonalMovement = DiagonalMovement.Never;
        } else {
            if (this.dontCrossCorners) {
                this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
            } else {
                this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
            }
        }
    }
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
// 1. First declare an empty operations array
// 2,3,4. Then push to the operations array whenever
// opened or closed or tested property of a node
// gets changed
// Object to be pushed
// {
//     x: node_name.x,
//     y: node_name.y,
//     attr: 'opened' || 'closed' || 'tested',
//     value: true || false
// }
BreadthFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var operations = [];        // #1
    // console.log("BFS")
    var openList = [],
        diagonalMovement = this.diagonalMovement,
        startNode = grid.getNodeAt(startX, startY),
        endNode = grid.getNodeAt(endX, endY),
        neighbors, neighbor, node, i, l;

    // push the start pos into the queue
    openList.push(startNode);
    startNode.opened = true;
    operations.push({           // #2
        x: startNode.x,
        y: startNode.y,
        attr: 'opened',
        value: true
    })
    // while the queue is not empty
    while (openList.length) {
        // take the front node from the queue
        node = openList.shift();
        node.closed = true;
        operations.push({       // #3
            x: node.x,
            y: node.y,
            attr: 'closed',
            value: true
        })
        // reached the end position
        if (node === endNode) {
            // console.log("operations")
            return Util.backtrace(endNode, operations);
        }

        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            // skip this neighbor if it has been inspected before
            if (neighbor.closed || neighbor.opened) {
                continue;
            }

            openList.push(neighbor);
            neighbor.opened = true; // HEre the opened value of neighbor changed to true
            operations.push({       // #4
                x: neighbor.x,
                y: neighbor.y,
                attr: 'opened',
                value: true
            })
            neighbor.parent = node;
        }
    }
    
    // fail to find the path
    return [];
};

module.exports = BreadthFirstFinder;
