var Util = require('../core/Util');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Bi-directional Breadth-First-Search path finder.
 * @constructor
 * @param {object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */
function BiBreadthFirstFinder(opt) {
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
BiBreadthFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var startNode = grid.getNodeAt(startX, startY),
        endNode = grid.getNodeAt(endX, endY),
        startOpenList = [], endOpenList = [],
        neighbors, neighbor, node,
        diagonalMovement = this.diagonalMovement,
        BY_START = 0, BY_END = 1,
        i, l;
        var operations = [];

    // push the start and end nodes into the queues
    startOpenList.push(startNode);
    startNode.opened = true;
    startNode.by = BY_START;
    operations.push({
        x: startNode.x,
        y: startNode.y,
        attr: 'opened',
        value: true
    });

    endOpenList.push(endNode);
    endNode.opened = true;
    endNode.by = BY_END;
    operations.push({
        x: endNode.x,
        y: endNode.y,
        attr: 'opened',
        value: true
    });
    // while both the queues are not empty
    while (startOpenList.length && endOpenList.length) {

        // expand start open list

        node = startOpenList.shift();
        node.closed = true;
        operations.push({
            x: node.x,
            y: node.y,
            attr: 'closed',
            value: true
        });

        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.closed) {
                continue;
            }
            if (neighbor.opened) {
                // if this node has been inspected by the reversed search,
                // then a path is found.
                if (neighbor.by === BY_END) {
                    return Util.biBacktrace(node, neighbor, operations);
                }
                continue;
            }
            startOpenList.push(neighbor);
            neighbor.parent = node;
            neighbor.opened = true;
            neighbor.by = BY_START;
            operations.push({
                x: neighbor.x,
                y: neighbor.y,
                attr: 'opened',
                value: true
            });
        }

        // expand end open list

        node = endOpenList.shift();
        node.closed = true;
        operations.push({
            x: node.x,
            y: node.y,
            attr: 'closed',
            value: true
        });
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.closed) {
                continue;
            }
            if (neighbor.opened) {
                if (neighbor.by === BY_START) {
                    return Util.biBacktrace(neighbor, node, operations);
                }
                continue;
            }
            endOpenList.push(neighbor);
            neighbor.parent = node;
            neighbor.opened = true;
            neighbor.by = BY_END;
            operations.push({
                x: neighbor.x,
                y: neighbor.y,
                attr: 'opened',
                value: true
            });
        }
    }

    // fail to find the path
    return [];
};

module.exports = BiBreadthFirstFinder;
