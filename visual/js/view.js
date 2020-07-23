/**
 * The pathfinding visualization.
 * It uses raphael.js to show the grids.
 */

var View = {
    checkpoint: [],
    nodeSize: 30, // width and height of a single node, in pixel
    nodeStyle: {
        normal: {
            fill: '#CFCFCF',
            'stroke-opacity': 0.6, // the border
        },
        pitnode: {

            fill: 'url("images/pit.jpeg")',
            'stroke-opacity': 0.2,

        },
        pitarea: {
            fill: '#004C70',
            "stroke-opacity": 0.1,

        },
        bombnode: {
            fill: 'url("images/bomb.png")',
            "stroke-opacity": 0.2,

        },
        bombarea: {
            fill: 'url("images/bombarea.jpg")',
            "stroke-opacity": 0.1,

        },

        icenode: {
            fill: 'url("images/ice.jpg")',
            'stroke-opacity': 0.2,

        },
        icearea: {
            fill: 'url("images/icearea.png")',
            "stroke-opacity": 0.1,

        },

        blocked: {
            fill: '#47101E',
            'stroke-opacity': 0.2,
        },
        start: {
            fill: 'url("images/moon-rover.png")',
            'stroke-opacity': 0.2,
        },
        end: {
            fill: 'url("images/pin.png")',
            'stroke-opacity': 0.2,
        },
        opened: {
            fill: '#AD3C3C',
            'stroke-opacity': 0.2,
        },
        closed: {
            fill: '#D8B3B3',
            'stroke-opacity': 0.2,
        },
        failed: {
            fill: '#ff8888',
            'stroke-opacity': 0.2,
        },
        tested: {
            fill: '#000066',
            'stroke-opacity': 0.2,
        },
        checkpoint: {
            fill: 'url("images/flag.png")',
            'stroke-opacity': 0.2,
        }
    },
    nodeColorizeEffect: {
        duration: 50,
    },

    nodeZoomEffect: {
        duration: 200,
        transform: 's1.2', // scale by 1.2x
        transformBack: 's1.0',
    },
    pathStyle: {
        stroke: '#FFFDBD',
        'stroke-width': 7,
    },
    supportedOperations: ['opened', 'closed', 'tested'],
    init: function(opts) {
        this.numCols = opts.numCols;
        this.numRows = opts.numRows;
        this.paper = Raphael('draw_area');
        this.$stats = $('#stats');
    },
    /**
     * Generate the grid asynchronously.
     * This method will be a very expensive task.
     * Therefore, in order to not to block the rendering of browser ui,
     * We decomposed the task into smaller ones. Each will only generate a row.
     */
    generateGrid: function(callback) {
        var i, j, x, y,
            rect,
            normalStyle, nodeSize,
            createRowTask, sleep, tasks,
            nodeSize = this.nodeSize,
            normalStyle = this.nodeStyle.normal,
            numCols = this.numCols,
            numRows = this.numRows,
            paper = this.paper,
            rects = this.rects = [],
            $stats = this.$stats;

        paper.setSize(numCols * nodeSize, numRows * nodeSize);

        createRowTask = function(rowId) {
            return function(done) {
                rects[rowId] = [];
                for (j = 0; j < numCols; ++j) {
                    x = j * nodeSize;
                    y = rowId * nodeSize;

                    rect = paper.rect(x, y, nodeSize, nodeSize);
                    rect.attr(normalStyle);
                    rects[rowId].push(rect);
                }
                done(null);
            };
        };

        sleep = function(done) {
            setTimeout(function() {
                done(null);
            }, 0);
        };

        tasks = [];
        for (i = 0; i < numRows; ++i) {
            tasks.push(createRowTask(i));
            tasks.push(sleep);
        }

        async.series(tasks, function() {
            if (callback) {
                callback();
            }
        });
    },
    setStartPos: function(gridX, gridY) {
        var coord = this.toPageCoordinate(gridX, gridY);
        if (!this.startNode) {
            this.startNode = this.paper.rect(
                    coord[0],
                    coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.start, 1000);
        } else {
            this.startNode.attr({ x: coord[0], y: coord[1] }).toFront();
        }
    },
    setCheckPoint: function(gridX, gridY, oldX, oldY, value) {
        var coord = this.toPageCoordinate(gridX, gridY);
        console.log(this.checkpoint)
        if (value) {
            if (this.checkpoint.findIndex(node => node.x == oldX && node.y == oldY) == -1) {
                this.checkpoint.push({
                    x: gridX,
                    y: gridY,
                    paper_el: this.paper.rect(
                            coord[0],
                            coord[1],
                            this.nodeSize,
                            this.nodeSize
                        ).attr(this.nodeStyle.checkpoint)
                        .animate(this.nodeStyle.checkpoint, 1000)
                })
            } else {
                checkindex = this.checkpoint.findIndex(node => node.x == oldX && node.y == oldY);
                this.checkpoint[checkindex].x = gridX;
                this.checkpoint[checkindex].y = gridY;
                this.checkpoint[checkindex].paper_el.attr({ x: coord[0], y: coord[1] }).toFront();
            }
        } else {
            if (this.checkpoint.findIndex(node => node.x == gridX && node.y == gridY) != -1) {
                checkindex = this.checkpoint.findIndex(node => node.x == gridX && node.y == gridY);
                console.log("Check", checkindex, this.rects[gridY][gridX]);
                node = this.rects[gridY][gridX].clone();
                this.rects[gridY][gridX].remove();
                node.attr(this.nodeStyle.normal);
                this.rects[gridY][gridX] = node;
                this.checkpoint.splice(checkindex, 1);
            }
        }
    },
    setPitPos: function(gridX, gridY) {
        var coord = this.toPageCoordinate(gridX, gridY);
        var m2coord = this.toPageCoordinate(gridX - 2, gridY);
        var m1coord = this.toPageCoordinate(gridX - 1, gridY);
        var a2coord = this.toPageCoordinate(gridX + 2, gridY);
        var a1coord = this.toPageCoordinate(gridX + 1, gridY);
        console.log(this.pitNode);
        if (!this.pitNode) {
            console.log(this.blockedNodes[gridY][gridX])
            this.pitNode = this.paper.rect(
                    coord[0],
                    coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.pitnode, 1000);
        } else {

            this.pitNode.attr({ x: coord[0], y: coord[1] }).toFront();

        }
        if (!this.pitm2Node) {
            console.log(this.blockedNodes[gridY][gridX])
            this.pitm2Node = this.paper.rect(
                    m2coord[0],
                    m2coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.pitarea, 1000);
        } else {
            this.pitm2Node.attr({ x: m2coord[0], y: m2coord[1] }).toFront();
        }
        if (!this.pitm1Node) {
            console.log(this.blockedNodes[gridY][gridX])
            this.pitm1Node = this.paper.rect(
                    m1coord[0],
                    m1coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.pitarea, 1000);
        } else {
            this.pitm1Node.attr({ x: m1coord[0], y: m1coord[1] }).toFront();
        }
        if (!this.pita1Node) {
            console.log(this.blockedNodes[gridY][gridX])
            this.pita1Node = this.paper.rect(
                    a1coord[0],
                    a1coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.pitarea, 1000);
        } else {
            this.pita1Node.attr({ x: a1coord[0], y: a1coord[1] }).toFront();
        }
        if (!this.pita2Node) {
            console.log(this.blockedNodes[gridY][gridX])
            this.pita2Node = this.paper.rect(
                    a2coord[0],
                    a1coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.pitarea, 1000);
        } else {
            this.pita2Node.attr({ x: a2coord[0], y: a2coord[1] }).toFront();
        }

    },
    setIcePos: function(gridX, gridY) {
        var coord = this.toPageCoordinate(gridX, gridY);
        var d1coord = this.toPageCoordinate(gridX - 1, gridY + 1);
        var d2coord = this.toPageCoordinate(gridX + 1, gridY + 1);
        console.log(this.iceNode);
        if (!this.iceNode) {

            this.iceNode = this.paper.rect(
                    coord[0],
                    coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.icenode, 1000);
        } else {
            this.iceNode.attr({ x: coord[0], y: coord[1] }).toFront();
        }
        if (!this.iced1Node) {

            this.iced1Node = this.paper.rect(
                    d1coord[0],
                    d1coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.icearea, 1000);
        } else {
            this.iced1Node.attr({ x: d1coord[0], y: d1coord[1] }).toFront();
        }
        if (!this.iced2Node) {

            this.iced2Node = this.paper.rect(
                    d2coord[0],
                    d2coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.icearea, 1000);
        } else {
            this.iced2Node.attr({ x: d2coord[0], y: d2coord[1] }).toFront();
        }
    },
    setBombPos: function(gridX, gridY) {
        var coord = this.toPageCoordinate(gridX, gridY);
        var lcoord = this.toPageCoordinate(gridX - 1, gridY);
        var rcoord = this.toPageCoordinate(gridX + 1, gridY);
        var dcoord = this.toPageCoordinate(gridX, gridY - 1);
        var ucoord = this.toPageCoordinate(gridX, gridY + 1);

        if (!this.bombNode) {
            this.bombNode = this.paper.rect(
                    coord[0],
                    coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.bombnode, 1000);
        } else {
            this.bombNode.attr({ x: coord[0], y: coord[1] }).toFront();
        }
        if (!this.bomblNode) {
            this.bomblNode = this.paper.rect(
                    lcoord[0],
                    lcoord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.bombarea, 1000);
        } else {
            this.bomblNode.attr({ x: lcoord[0], y: lcoord[1] }).toFront();
        }
        if (!this.bombrNode) {
            this.bombrNode = this.paper.rect(
                    rcoord[0],
                    rcoord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.bombarea, 1000);
        } else {
            this.bombrNode.attr({ x: rcoord[0], y: rcoord[1] }).toFront();
        }
        if (!this.bombuNode) {
            this.bombuNode = this.paper.rect(
                    ucoord[0],
                    ucoord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.bombarea, 1000);
        } else {
            this.bombuNode.attr({ x: ucoord[0], y: ucoord[1] }).toFront();
        }
        if (!this.bombdNode) {
            this.bombdNode = this.paper.rect(
                    dcoord[0],
                    dcoord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.bombarea, 1000);
        } else {
            this.bombdNode.attr({ x: dcoord[0], y: dcoord[1] }).toFront();
        }
    },



    setEndPos: function(gridX, gridY) {
        var coord = this.toPageCoordinate(gridX, gridY);
        if (!this.endNode) {
            this.endNode = this.paper.rect(
                    coord[0],
                    coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(this.nodeStyle.end, 1000);
        } else {
            this.endNode.attr({ x: coord[0], y: coord[1] }).toFront();
        }
    },
    /**
     * Set the attribute of the node at the given coordinate.
     */
    setAttributeAt: function(gridX, gridY, attr, value, ob) {
        var color, nodeStyle = this.nodeStyle;
        switch (attr) {
            case 'walkable':
                color = value ? nodeStyle.normal.fill : nodeStyle.blocked.fill;
                this.setWalkableAt(gridX, gridY, value, ob);
                break;
            case 'opened':
                this.colorizeNode(this.rects[gridY][gridX], nodeStyle.opened.fill);
                this.setCoordDirty(gridX, gridY, true);
                break;
            case 'closed':
                this.colorizeNode(this.rects[gridY][gridX], nodeStyle.closed.fill);
                this.setCoordDirty(gridX, gridY, true);
                break;
            case 'tested':
                color = (value === true) ? nodeStyle.tested.fill : nodeStyle.normal.fill;
                this.colorizeNode(this.rects[gridY][gridX], color);
                this.setCoordDirty(gridX, gridY, true);
                break;
            default:
                console.error('unsupported operation: ' + attr + ':' + value);
                return;
        }
    },
    colorizeNode: function(node, color) {
        node.animate({
            fill: color
        }, this.nodeColorizeEffect.duration);
    },

    zoomNode: function(node) {
        node.toFront().attr({
            transform: this.nodeZoomEffect.transform,
        }).animate({
            transform: this.nodeZoomEffect.transformBack,
        }, this.nodeZoomEffect.duration);
    },
    clearallpit: function() {

        if (this.pitNode != null) {
            this.pitNode.remove();
            this.pitNode = null;

        }
        if (this.pitm1Node != null) {
            this.pitm1Node.remove();
            this.pitm1Node = null;

        }
        if (this.pitm2Node != null) {
            this.pitm2Node.remove();
            this.pitm2Node = null;

        }
        if (this.pita1Node != null) {
            this.pita1Node.remove();
            this.pita1Node = null;

        }
        if (this.pita2Node != null) {
            this.pita2Node.remove();
            this.pita2Node = null;

        }
    },
    clearallice: function() {

        if (this.iceNode != null) {
            this.iceNode.remove();
            this.iceNode = null;

        }
        if (this.iced1Node != null) {
            this.iced1Node.remove();
            this.iced1Node = null;

        }
        if (this.iced2Node != null) {
            this.iced2Node.remove();
            this.iced2Node = null;
        }


    },
    clearallbomb: function() {

        if (this.bombNode != null) {
            this.bombNode.remove();
            this.bombNode = null;

        }
        if (this.bombuNode != null) {
            this.bombuNode.remove();
            this.bombuNode = null;

        }
        if (this.bombdNode != null) {
            this.bombdNode.remove();
            this.bombdNode = null;

        }
        if (this.bomblNode != null) {
            this.bomblNode.remove();
            this.bomblNode = null;

        }
        if (this.bombrNode != null) {
            this.bombrNode.remove();
            this.bombrNode = null;

        }
    },



    setWalkableAt: function(gridX, gridY, value, ob) {
        var node, i, blockedNodes = this.blockedNodes;
        if (!blockedNodes) {
            blockedNodes = this.blockedNodes = new Array(this.numRows);
            for (i = 0; i < this.numRows; ++i) {
                blockedNodes[i] = [];
            }
        }
        node = blockedNodes[gridY][gridX];
        if (value) {
            // clear blocked node
            if (node) {
                console.log(node)

                this.colorizeNode(node, this.rects[gridY][gridX].attr('fill'));
                this.zoomNode(node);
                setTimeout(function() {
                    node.remove();
                }, this.nodeZoomEffect.duration);
                blockedNodes[gridY][gridX] = null;
            }
        } else {
            // draw blocked node
            if (node) {
                return;
            }
            node = blockedNodes[gridY][gridX] = this.rects[gridY][gridX].clone();
            console.log("my object", ob);
            if (ob == "wall") {
                this.colorizeNode(node, this.nodeStyle.blocked.fill);
            } else if (ob == "pit") {
                console.log("pit style");
                this.colorizeNode(node, this.nodeStyle.pitnode.fill);
            } else if (ob == "ice") {
                console.log("ice style");
                this.colorizeNode(node, this.nodeStyle.icenode.fill);
            } else if (ob == "bomb") {
                this.colorizeNode(node, this.nodeStyle.bombnode.fill);
            } else if (ob == "bombarea") {
                this.colorizeNode(node, this.nodeStyle.bombarea.fill);
            } else if (ob == "icearea") {
                this.colorizeNode(node, this.nodeStyle.icearea.fill);
            } else if (ob == "pitarea") {
                this.colorizeNode(node, this.nodeStyle.pitarea.fill);
            }
            this.zoomNode(node);
        }
    },
    setPitAt: function(gridX, gridY, value) {
        var node, i, blockedNodes = this.blockedNodes;
        if (!blockedNodes) {
            blockedNodes = this.blockedNodes = new Array(this.numRows);
            for (i = 0; i < this.numRows; ++i) {
                blockedNodes[i] = [];
            }
        }
        node = blockedNodes[gridY][gridX];
        if (value) {
            // clear blocked node
            if (node) {
                this.colorizeNode(node, this.rects[gridY][gridX].attr('fill'));
                this.zoomNode(node);
                setTimeout(function() {
                    node.remove();
                }, this.nodeZoomEffect.duration);
                blockedNodes[gridY][gridX] = null;
            }
        } else {
            // add pit to Node
            if (node) {
                return;
            }
            node = blockedNodes[gridY][gridX] = this.rects[gridY][gridX].clone();
            this.colorizeNode(node, this.nodeStyle.pitnode.fill);
            this.zoomNode(node);
        }
    },

    clearFootprints: function() {
        var i, x, y, coord, coords = this.getDirtyCoords();
        for (i = 0; i < coords.length; ++i) {
            coord = coords[i];
            x = coord[0];
            y = coord[1];
            this.rects[y][x].attr(this.nodeStyle.normal);
            this.setCoordDirty(x, y, false);
        }
    },
    clearBlockedNodes: function() {
        var i, j, blockedNodes = this.blockedNodes;
        if (!blockedNodes) {
            return;
        }
        for (i = 0; i < this.numRows; ++i) {
            for (j = 0; j < this.numCols; ++j) {
                if (blockedNodes[i][j]) {
                    blockedNodes[i][j].remove();
                    blockedNodes[i][j] = null;
                }
            }
        }
    },
    drawPath: function(path) {
        if (!path.length) {
            return;
        }
        var svgPath = this.buildSvgPath(path);
        console.log(svgPath)
        this.path = this.paper.path(svgPath).attr(this.pathStyle);
    },
    /**
     * Given a path, build its SVG represention.
     */
    buildSvgPath: function(path) {
        var i, strs = [],
            size = this.nodeSize;

        strs.push('M' + (path[0][0] * size + size / 2) + ' ' +
            (path[0][1] * size + size / 2));
        for (i = 1; i < path.length; ++i) {
            strs.push('L' + (path[i][0] * size + size / 2) + ' ' +
                (path[i][1] * size + size / 2));
        }

        return strs.join('');
    },
    clearPath: function() {
        if (this.path) {
            this.path.remove();
        }
    },
    /**
     * Helper function to convert the page coordinate to grid coordinate
     */
    toGridCoordinate: function(pageX, pageY) {
        return [
            Math.floor(pageX / this.nodeSize),
            Math.floor(pageY / this.nodeSize)
        ];
    },
    /**
     * helper function to convert the grid coordinate to page coordinate
     */
    toPageCoordinate: function(gridX, gridY) {
        return [
            gridX * this.nodeSize,
            gridY * this.nodeSize
        ];
    },
    showStats: function(opts) {
        var texts = [

            '<b>Length: </b>' + Math.round(opts.pathLength * 100) / 100,
            '<b>Time: </b>' + opts.timeSpent + 'ms',
            '<b>Operations: </b>' + opts.operationCount
        ];
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 10000,
            timerProgressBar: true,
            onOpen: (to) => {
                to.addEventListener('mouseenter', Swal.stopTimer);
                to.addEventListener('mouseleave', Swal.resumeTimer);
            }
        })
        Toast.fire({
            icon: 'success',
            html: texts.join('<br>')
        })
    },
    setCoordDirty: function(gridX, gridY, isDirty) {
        var x, y,
            numRows = this.numRows,
            numCols = this.numCols,
            coordDirty;

        if (this.coordDirty === undefined) {
            coordDirty = this.coordDirty = [];
            for (y = 0; y < numRows; ++y) {
                coordDirty.push([]);
                for (x = 0; x < numCols; ++x) {
                    coordDirty[y].push(false);
                }
            }
        }
        this.coordDirty[gridY][gridX] = isDirty;
    },
    getDirtyCoords: function() {
        var x, y,
            numRows = this.numRows,
            numCols = this.numCols,
            coordDirty = this.coordDirty,
            coords = [];

        if (coordDirty === undefined) {
            return [];
        }

        for (y = 0; y < numRows; ++y) {
            for (x = 0; x < numCols; ++x) {
                if (coordDirty[y][x]) {
                    coords.push([x, y]);
                }
            }
        }
        return coords;
    },
};