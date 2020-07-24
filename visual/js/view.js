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
            this.startNode.attr({
                x: coord[0],
                y: coord[1]
            }).toFront();
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
                this.checkpoint[checkindex].paper_el.attr({
                    x: coord[0],
                    y: coord[1]
                }).toFront();
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
        this.pitNode = this.nodedrag(this.pitNode, coord, this.nodeStyle.pitnode);
        this.pitm2Node = this.nodedrag(this.pitm2Node, m2coord, this.nodeStyle.pitarea);
        this.pitm1Node = this.nodedrag(this.pitm1Node, m1coord, this.nodeStyle.pitarea);
        this.pita2Node = this.nodedrag(this.pita2Node, a2coord, this.nodeStyle.pitarea);
        this.pita1Node = this.nodedrag(this.pita1Node, a1coord, this.nodeStyle.pitarea);

    },


    setIcePos: function(gridX, gridY) {
        var coord = this.toPageCoordinate(gridX, gridY);
        var d1coord = this.toPageCoordinate(gridX - 1, gridY + 1);
        var d2coord = this.toPageCoordinate(gridX + 1, gridY + 1);
        this.iceNode = this.nodedrag(this.iceNode, coord, this.nodeStyle.icenode);
        this.iced1Node = this.nodedrag(this.iced1Node, d1coord, this.nodeStyle.icearea);
        this.iced2Node = this.nodedrag(this.iced2Node, d2coord, this.nodeStyle.icearea);
    },
    setBombPos: function(gridX, gridY) {
        var coord = this.toPageCoordinate(gridX, gridY);
        var lcoord = this.toPageCoordinate(gridX - 1, gridY);
        var rcoord = this.toPageCoordinate(gridX + 1, gridY);
        var dcoord = this.toPageCoordinate(gridX, gridY - 1);
        var ucoord = this.toPageCoordinate(gridX, gridY + 1);
        this.bombNode = this.nodedrag(this.bombNode, coord, this.nodeStyle.bombnode);
        this.bomblNode = this.nodedrag(this.bomblNode, lcoord, this.nodeStyle.bombarea);
        this.bombrNode = this.nodedrag(this.bombrNode, rcoord, this.nodeStyle.bombarea);
        this.bombdNode = this.nodedrag(this.bombdNode, dcoord, this.nodeStyle.bombarea);
        this.bombuNode = this.nodedrag(this.bombuNode, ucoord, this.nodeStyle.bombarea);
    },
    nodedrag: function(Node, coord, style) {
        if (!Node) {
            Node = this.paper.rect(
                    coord[0],
                    coord[1],
                    this.nodeSize,
                    this.nodeSize
                ).attr(this.nodeStyle.normal)
                .animate(style, 1000);
        } else {
            Node.attr({
                x: coord[0],
                y: coord[1]
            }).toFront();
        }
        return Node;

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
            this.endNode.attr({
                x: coord[0],
                y: coord[1]
            }).toFront();
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
    clearallobstacles: function() {
        this.clearallpit();
        this.clearallbomb();
        this.clearallice();
    },
    clearallpit: function() {
        this.pitNode = this.clearob(this.pitNode);
        this.pitm1Node = this.clearob(this.pitm1Node);
        this.pitm2Node = this.clearob(this.pitm2Node);
        this.pita1Node = this.clearob(this.pita1Node);
        this.pita2Node = this.clearob(this.pita2Node);

    },
    clearob: function(Node) {
        if (Node != null) {
            Node.remove();
            Node = null;
        }
        return Node;
    },

    clearallice: function() {
        this.iceNode = this.clearob(this.iceNode);
        this.iced1Node = this.clearob(this.iced1Node);
        this.iced2Node = this.clearob(this.iced2Node);

    },
    clearallbomb: function() {
        this.bombNode = this.clearob(this.bombNode);
        this.bombuNode = this.clearob(this.bombuNode);
        this.bombdNode = this.clearob(this.bombdNode);
        this.bomblNode = this.clearob(this.bomblNode);
        this.bombrNode = this.clearob(this.bombrNode);
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