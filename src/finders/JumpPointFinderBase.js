/**
 * @author imor / https://github.com/imor
 */
var Heap       = require('heap');
var Util       = require('../core/Util');
var Heuristic  = require('../core/Heuristic');
var DiagonalMovement = require('../core/DiagonalMovement');


/**
 * Base class for the Jump Point Search algorithm
 * @param {object} opt
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */
function JumpPointFinderBase(opt) {
    opt = opt || {};
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.trackJumpRecursion = opt.trackJumpRecursion || false;
    console.log("recursion",this.trackJumpRecursion)
}

/**
 * Find and return the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
JumpPointFinderBase.prototype.findPath = function(startX, startY, endX, endY, grid) {     
    // console.log("JumpPoint1");
    var openList = this.openList = new Heap(function(nodeA, nodeB) {
            return nodeA.f - nodeB.f;
        }),
        startNode = this.startNode = grid.getNodeAt(startX, startY),
        endNode = this.endNode = grid.getNodeAt(endX, endY), node;

    this.grid = grid;
    var operations = [];

    // set the `g` and `f` value of the start node to be 0
    startNode.g = 0;
    startNode.f = 0;

    // push the start node into the open list
    openList.push(startNode);
    startNode.opened = true;
    operations.push({           
        x: startNode.x,
        y: startNode.y,
        attr: 'opened',
        value: true
    })

    // while the open list is not empty
    while (!openList.empty()) {
        // pop the position of node which has the minimum `f` value.
        node = openList.pop();
        node.closed = true;
        operations.push({       
            x: node.x,
            y: node.y,
            attr: 'closed',
            value: true
        })

        if (node === endNode) {
            res = {
                path : Util.expandPath(Util.backtrace(endNode,operations)['path']),
                operations : operations
            }
            // console.log(res)
            return res
            // return Util.expandPath(Util.backtrace(endNode,operations));
        }

        operations = this._identifySuccessors(node, operations);
    }

    // fail to find the path
    res = {
        path : [],
        operations : operations
    }
    return res
};

/**
 * Identify successors for the given node. Runs a jump point search in the
 * direction of each available neighbor, adding any points found to the open
 * list.
 * @protected
 */
JumpPointFinderBase.prototype._identifySuccessors = function(node, operations) {
    //var operations = [];        // #1
    // console.log("JumpPoint2");
    var grid = this.grid,
        heuristic = this.heuristic,
        openList = this.openList,
        endX = this.endNode.x,
        endY = this.endNode.y,
        neighbors, neighbor,
        jumpPoint, i, l,
        x = node.x, y = node.y,
        jx, jy, dx, dy, d, ng, jumpNode,
        abs = Math.abs, max = Math.max;

    neighbors = this._findNeighbors(node);
    for(i = 0, l = neighbors.length; i < l; ++i) {
        neighbor = neighbors[i];
        // console.log("a",operations)
        res = this._jump(neighbor[0], neighbor[1], x, y, operations);
        jumpPoint = res['jumppoint']
        operations = res['operations']
        // console.log("b",res)
        if (jumpPoint) {

            jx = jumpPoint[0];
            jy = jumpPoint[1];
            jumpNode = grid.getNodeAt(jx, jy);

            if (jumpNode.closed) {
                continue;
            }

            // include distance, as parent may not be immediately adjacent:
            d = Heuristic.octile(abs(jx - x), abs(jy - y));
            ng = node.g + d; // next `g` value

            if (!jumpNode.opened || ng < jumpNode.g) {
                jumpNode.g = ng;
                jumpNode.h = jumpNode.h || heuristic(abs(jx - endX), abs(jy - endY));
                jumpNode.f = jumpNode.g + jumpNode.h;
                jumpNode.parent = node;

                if (!jumpNode.opened) {
                    openList.push(jumpNode);
                    jumpNode.opened = true;
                    operations.push({       // #4
                    x: jumpNode.x,
                    y: jumpNode.y,
                    attr: 'opened',
                    value: true
                    });
                } else {
                    openList.updateItem(jumpNode);
                }
            }
        }
    }
    return operations;
};

module.exports = JumpPointFinderBase;
