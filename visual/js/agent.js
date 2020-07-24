/**
 * The visualization Agent will works as a state machine.
 * See files under the `doc` folder for transition descriptions.
 * See https://github.com/jakesgordon/javascript-state-machine
 * for the document of the StateMachine module.
 */
var Agent = StateMachine.create({
    initial: 'none',
    events: [{
            name: 'init',
            from: 'none',
            to: 'ready'
        },
        {
            name: 'search',
            from: 'starting',
            to: 'searching'
        },
        {
            name: 'pause',
            from: 'searching',
            to: 'paused'
        },
        {
            name: 'finish',
            from: 'searching',
            to: 'finished'
        },
        {
            name: 'resume',
            from: 'paused',
            to: 'searching'
        },
        {
            name: 'cancel',
            from: 'paused',
            to: 'ready'
        },
        {
            name: 'modify',
            from: 'finished',
            to: 'modified'
        },
        {
            name: 'reset',
            from: '*',
            to: 'ready'
        },
        {
            name: 'clear',
            from: ['finished', 'modified'],
            to: 'ready'
        },
        {
            name: 'start',
            from: ['ready', 'modified', 'restarting'],
            to: 'starting'
        },
        {
            name: 'restart',
            from: ['searching', 'finished'],
            to: 'restarting'
        },
        {
            name: 'dragStart',
            from: ['ready', 'finished'],
            to: 'draggingStart'
        },
        {
            name: 'dragEnd',
            from: ['ready', 'finished'],
            to: 'draggingEnd'
        },
        {
            name: 'dragCheckpoint',
            from: ['ready', 'finished'],
            to: 'draggingCheckpoint'
        },

        {
            name: 'drawWall',
            from: ['ready', 'finished'],
            to: 'drawingWall'
        },
        {
            name: 'eraseWall',
            from: ['ready', 'finished'],
            to: 'erasingWall'
        },
        {
            name: 'rest',
            from: ['draggingStart', 'draggingEnd', 'drawingWall', 'erasingWall', 'draggingCheckpoint'],
            to: 'ready'
        },
        {
            name: 'startMaze',
            from: ['ready', 'finished'],
            to: 'ready'
        }
    ],
});

$.extend(Agent, {
    gridSize: [64, 36], // number of nodes horizontally and vertically
    draggingEndLock: false,
    checkpoints: [],
    path: [],
    operations: [],
    endstatus: 0,
    currCheckpoint: -1,
    mousemoveflag: 0,
    checkPointsleft: 4, // number of checkpoints left to be inserted (max 4)
    /**
     * -----------------------------------------------------------------------
     * Functions to insert and erase walls and obstacles
     * -----------------------------------------------------------------------
     */
    onleavenone: function () {
        var numCols = this.gridSize[0],
            numRows = this.gridSize[1];

        this.grid = new PF.Grid(numCols, numRows);

        View.init({
            numCols: numCols,
            numRows: numRows
        });
        View.generateGrid(function () {
            Agent.setDefaultStartEndPos();
            Agent.bindEvents();
            Agent.transition(); // transit to the next state (ready)

        });
        Bot.init(); //initializing the TARS bot
        this.$buttons = $('.control_button');
        this.$maze_buttons = $('.maze_button');
        return StateMachine.ASYNC;
        // => ready
    },
    ondrawWall: function (event, from, to, gridX, gridY) {
        this.setWalkableAt(gridX, gridY, false, "wall");
        // => drawingWall
    },
    oneraseWall: function (event, from, to, gridX, gridY) {
        this.setWalkableAt(gridX, gridY, true, "wall");
        // => erasingWall
    },
    /**
     * -------------------------------------------------------------------------------
     * Agent functions that get triggered when various buttons on navbar are pressed (buttonpress Event percept)
     * -------------------------------------------------------------------------------
     */
    onsearch: function (event, from, to) { //triggered when Start Search is pressed
        var grid,
            timeStart, timeEnd,
            finder = Panel.getFinder();
        this.finder = finder;
        this.pathfound = 1;
        var TSP = new PF.TSP({
            startX: this.startX,
            startY: this.startY,
            endX: this.endX,
            endY: this.endY,
            checkpoints: this.checkpoints,
            grid: this.grid,
            finder: this.finder
        })
        res = TSP.onTSP()
        this.checkpoints = res[0]
        this.pathfound = res[1]
        for (var i = -1; i < this.checkpoints.length; i++) {
            if (i == -1) {
                var originX = this.startX;
                var originY = this.startY;
            } else {
                var originX = this.checkpoints[i].x;
                var originY = this.checkpoints[i].y;
            }
            if (i == this.checkpoints.length - 1) {
                var destX = this.endX;
                var destY = this.endY
            } else {
                var destX = this.checkpoints[i + 1].x;
                var destY = this.checkpoints[i + 1].y;
            }

            this.finder = finder;
            timeStart = window.performance ? performance.now() : Date.now();
            grid = this.grid.clone();
            var res = finder.findPath(
                originX, originY, destX, destY, grid
            );
            this.path = this.path.concat(res['path']);
            this.operations = this.operations.concat(res['operations']);
            if (this.path.length == 1 || this.path.length == 0) {
                this.pathfound = 0
                break;
            }
            this.operationCount = this.operations.length;
            timeEnd = window.performance ? performance.now() : Date.now();
            this.timeSpent = (timeEnd - timeStart).toFixed(4);
            this.loop();
        }
        if (!this.pathfound)
            this.finish()
        // => searching
        Bot.botState(0);
    },

    onrestart: function () { //triggered when Restart Start button is pressed
        // When clearing the colorized nodes, there may be
        // nodes still animating, which is an asynchronous procedure.
        // Therefore, we have to defer the `abort` routine to make sure
        // that all the animations are done by the time we clear the colors.
        // The same reason applies for the `onreset` event handler.
        this.endstatus = 0;
        setTimeout(function () {
            Agent.clearOperations();
            Agent.clearFootprints();
            Agent.start();
        }, View.nodeColorizeEffect.duration * 1.2);
        Bot.botState(1);

        // => restarting
    },
    onpause: function (event, from, to) { //triggered when Pause Search is pressed
        // => paused
        Bot.botState(2);
    },
    onresume: function (event, from, to) { //triggered when Resume Search is pressed
        this.loop();
        // => searching
        Bot.botState(3);
    },
    oncancel: function (event, from, to) { //triggered when Cancel Search is pressed
        this.clearOperations();
        this.clearFootprints();
        // => ready
        Bot.botState(4);
    },
    onfinish: function (event, from, to) { //triggered when the search finishes
        if (!this.pathfound) {
            this.pathnotfound()
        } else {
            View.showStats({
                pathLength: PF.Util.pathLength(this.path),
                timeSpent: this.timeSpent,
                operationCount: this.operationCount,
            });
            View.drawPath(this.path);

            var botpan = document.getElementById('bot_panel');
            var botmsg = document.getElementById('bot_msg');
            Bot.botState(5);
        }
        this.endstatus = 1;
        this.path = [];
        this.operations = [];
        // => finished
    },
    onclear: function (event, from, to) { //triggered when Clear Path is pressed
        this.clearOperations();
        this.clearFootprints();
        // => ready
        Bot.botState(6);
    },
    onreset: function (event, from, to) { //triggered when Clear Obstacles is pressed
        this.endstatus = 0;
        setTimeout(function () {
            Agent.clearOperations();
            Agent.clearAll();
            Agent.buildNewGrid();
        }, View.nodeColorizeEffect.duration * 1.2);
        this.setButtonStates({
            id: 3,
            enabled: true,
        });
        // => ready
        Bot.botState(7);
    },

    /**
     * --------------------------------------------------------------------------
     * Functions called on entering states.
     * --------------------------------------------------------------------------
     */

    initmaze: function (mazetype) { //triggered on transitioning to startMaze
        this.mazetype = mazetype;
        this.startMaze();
    },
    onready: function () { //triggered when agent transitions to Ready
        console.log('=> ready');
        this.setButtonStates({
            id: 0,
            text: 'Start Search',
            enabled: true,
            callback: $.proxy(this.start, this),
        }, {
            id: 1,
            text: 'Pause Search',
            enabled: false,
        }, {
            id: 2,
            text: 'Clear Obstacles',
            enabled: true,
            callback: $.proxy(this.reset, this),
        }, {
            id: 3,
            text: 'Clear checkpoints',
            enabled: true,
            callback: $.proxy(this.clearCheckPoint, this, 1),
        });
        this.setButtonStatesMaze({
            id: 0,
            text: 'Random maze',
            enabled: true,
            callback: $.proxy(this.initmaze, this, 'random'),
        }, {
            id: 1,
            text: 'Dense Recursive maze',
            enabled: true,
            callback: $.proxy(this.initmaze, this, 'dense_recursive'),
        }, {
            id: 2,
            text: 'Stair maze',
            enabled: true,
            callback: $.proxy(this.initmaze, this, 'stair'),
        }, {
            id: 3,
            text: 'Sparse Recursive Maze',
            enabled: true,
            callback: $.proxy(this.initmaze, this, 'sparse_recursive'),
        });
        // => [starting, draggingStart, draggingEnd, draggingPit drawingStart, drawingEnd]
    },
    createMazeWall: function (event, x, y) {
        event.setWalkableAt(x, y, false);
    },
    onstartMaze: function (event, from, to) {
        this.endstatus = 0;
        var mazetype = this.mazetype;
        Agent.clearOperations();
        Agent.clearAll();
        Agent.buildNewGrid();
        this.setButtonStates({
            id: 3,
            enabled: true,
        });
        this.setButtonStates({
            id: 6,
            enabled: false,
        });
        var rows = this.gridSize[0];
        var cols = this.gridSize[1];
        //creates Maze class objects based on the type of Maze selected by user
        if (mazetype == 'random') {
            maze = new PF.RandomMaze({
                xlim: rows,
                ylim: cols,
                startX: this.startX,
                startY: this.startY,
                endX: this.endX,
                endY: this.endY,
                checkpoints: this.checkpoints
            });
        } else if (mazetype == 'dense_recursive') {
            maze = new PF.RecDivMaze({
                xlim: rows,
                ylim: cols,
                startX: this.startX,
                startY: this.startY,
                endX: this.endX,
                endY: this.endY,
                checkpoints: this.checkpoints,
                density: 1
            });
        } else if (mazetype == 'stair') {
            maze = new PF.StairMaze({
                xlim: rows,
                ylim: cols,
                startX: this.startX,
                startY: this.startY,
                endX: this.endX,
                endY: this.endY,
                checkpoints: this.checkpoints
            });
        } else if (mazetype == 'sparse_recursive') {
            maze = new PF.RecDivMaze({
                xlim: rows,
                ylim: cols,
                startX: this.startX,
                startY: this.startY,
                endX: this.endX,
                endY: this.endY,
                checkpoints: this.checkpoints,
                density: 0
            });
        }
        var mazeWall = maze.createMaze();
        for (let i = 0; i < mazeWall.length; i++) {
            setTimeout(this.createMazeWall, 3, this, mazeWall[i].x, mazeWall[i].y);
        }
    },
    onstarting: function (event, from, to) {
        console.log('=> starting');
        this.endstatus = 0;
        // Clears any existing search progress
        this.clearFootprints();
        this.setButtonStates({
            id: 1,
            enabled: true,
        });
        this.search();
        // => searching
    },
    onsearching: function () {

        console.log('=> searching');
        this.setButtonStates({
            id: 0,
            text: 'Restart Search',
            enabled: true,
            callback: $.proxy(this.restart, this),
        }, {
            id: 1,
            text: 'Pause Search',
            enabled: true,
            callback: $.proxy(this.pause, this),
        });
        // => [paused, finished]
    },
    onpaused: function () {
        console.log('=> paused');
        this.setButtonStates({
            id: 0,
            text: 'Resume Search',
            enabled: true,
            callback: $.proxy(this.resume, this),
        }, {
            id: 1,
            text: 'Cancel Search',
            enabled: true,
            callback: $.proxy(this.cancel, this),
        });
        // => [searching, ready]
    },
    onfinished: function () {
        console.log('=> finished');
        this.setButtonStates({
            id: 0,
            text: 'Restart Search',
            enabled: true,
            callback: $.proxy(this.restart, this),
        }, {
            id: 1,
            text: 'Clear Path',
            enabled: true,
            callback: $.proxy(this.clear, this),
        });
    },
    onmodified: function () {
        console.log('=> modified');
        this.setButtonStates({
            id: 0,
            text: 'Start Search',
            enabled: true,
            callback: $.proxy(this.start, this),
        }, {
            id: 1,
            text: 'Clear Path',
            enabled: true,
            callback: $.proxy(this.clear, this),
        });
    },

    /**
     * Define setters and getters of PF.Node, then we can get the operations
     * of the pathfinding.
     */
    bindEvents: function () {
        $('#draw_area').mousedown($.proxy(this.mousedown, this));
        $(window)
            .mousemove($.proxy(this.mousemove, this))
            .mouseup($.proxy(this.mouseup, this));
    },
    loop: function () { //used to adjust agent speed

        speed = Panel.getSpeed();
        var operationsPerSecond = speed * 5;


        var interval = 1000 / operationsPerSecond;
        (function loop() {
            if (!Agent.is('searching')) {
                return;
            }
            Agent.step();
            setTimeout(loop, interval);
        })();
    },
    step: function () {
        var operations = this.operations,
            op, isSupported;

        do {
            if (!operations.length) {
                this.finish(); // transit to `finished` state

                return;
            }
            op = operations.shift();
            isSupported = View.supportedOperations.indexOf(op.attr) !== -1;
        } while (!isSupported);

        View.setAttributeAt(op.x, op.y, op.attr, op.value, false);
    },
    /**
     * ----------------------------------------------------------------------------------------
     * Clear Functions: used to remove path, walls and checkpoints
     * ----------------------------------------------------------------------------------------
     */
    clearOperations: function () {
        this.operations = [];
        this.path = []
    },
    clearFootprints: function () {
        View.clearFootprints();
        View.clearPath();
    },
    clearCheckPoint: function (clearNumber, gridX = 0, gridY = 0) {
        if (clearNumber == 0) {
            const ind = this.checkpoints.findIndex(node =>
                node.x == gridX &&
                node.y == gridY
            );
            if (ind != -1) {
                this.checkpoints.splice(ind, 1);
            }
            this.grid.setWalkableAt(gridX, gridY, true, "");
            View.setCheckPoint(gridX, gridY, -1, -1, false);
        } else {
            for (let i = 0; i < this.checkpoints.length; i++)
                View.setCheckPoint(this.checkpoints[i].x, this.checkpoints[i].y, -1, -1, false);
            this.checkpoints.splice(0, this.checkpoints.length);
            this.checkPointsleft = 4;
            Bot.botState(8, this.checkPointsleft);
        }
        this.currCheckpoint = -1;
        if (this.endstatus == 1)
            this.findPath(1);
    },
    clearAll: function () {
        this.clearFootprints();
        View.clearBlockedNodes();
    },
    buildNewGrid: function () {
        this.grid = new PF.Grid(this.gridSize[0], this.gridSize[1]);
    },
    /** 
     * This function finds the path as per choice of algorithm by the user.
     * In case of checkpoints it first calls TSP to find out what sequence
     * the checkpoints should be visited in. Finally it renders the path 
     * found using drawPath() from View.
     */
    findPath: function (viewoperations) {
        this.clearOperations();
        this.clearFootprints();
        var path = [];
        var operations = [];
        var TSP = new PF.TSP({
            startX: this.startX,
            startY: this.startY,
            endX: this.endX,
            endY: this.endY,
            checkpoints: this.checkpoints,
            grid: this.grid,
            finder: this.finder
        })
        if (this.currCheckpoint != -1) {
            var checkx = this.checkpoints[this.currCheckpoint].x
            var checky = this.checkpoints[this.currCheckpoint].y
        }
        res = TSP.onTSP();
        this.checkpoints = res[0];
        this.pathfound = res[1];
        if (this.currCheckpoint != -1) {
            for (var i = 0; i < this.checkpoints.length; i++)
                if (checkx == this.checkpoints[i].x && checky == this.checkpoints[i].y) {
                    this.currCheckpoint = i;
                    break;
                }
        }
        for (var i = -1; i < this.checkpoints.length; i++) {
            if (i == -1) {
                var originX = this.startX;
                var originY = this.startY;
            } else {
                var originX = this.checkpoints[i].x;
                var originY = this.checkpoints[i].y;
            }
            if (i == this.checkpoints.length - 1) {
                var destX = this.endX;
                var destY = this.endY
            } else {
                var destX = this.checkpoints[i + 1].x;
                var destY = this.checkpoints[i + 1].y;
            }
            var grid = this.grid.clone();
            var res = this.finder.findPath(
                originX, originY, destX, destY, grid
            );
            if (!res['path'] || res['path'].length == 1) {
                this.pathfound = 0;
                break;
            }
            path = path.concat(res['path'])
            operations = operations.concat(res['operations'])
        }
        if (this.pathfound) {
            var op, isSupported;
            if (viewoperations) {
                console.log(operations)
                while (operations.length) {
                    op = operations.shift();
                    View.setAttributeAt(op.x, op.y, op.attr, op.value);
                }
            }
            View.drawPath(path);
        }
    },
    /**
     * ----------------------------------------------------------------------------------------
     * These functions process percepts in form of mouse press, mouseup and cursor motion.
     * ----------------------------------------------------------------------------------------
     */
    mousedown: function (event) { //triggered on pressing on the grid
        var coord = View.toGridCoordinate(event.pageX, event.pageY),
            gridX = coord[0],
            gridY = coord[1],
            grid = this.grid;
        if ((event.ctrlKey) && this.isCheckPoint(gridX, gridY) != -1) {
            this.clearCheckPoint(0, gridX, gridY);
            this.checkPointsleft++;
            Bot.botState(9, this.checkPointsleft);
            return;

        } else if (event.ctrlKey) {
            if (!this.isStartPos(gridX, gridY) && !this.isEndPos(gridX, gridY) && grid.isWalkableAt(gridX, gridY) && this.checkPointsleft > 0) {
                this.setCheckPoint(gridX, gridY, true);
                this.checkPointsleft--;
                if (this.endstatus == 1) {
                    this.findPath(1);
                }
                Bot.botState(10, this.checkPointsleft);
            }
        } else {
            if (this.can('dragStart') && this.isStartPos(gridX, gridY)) {
                this.dragStart();
                return;
            }
            if (this.can('dragEnd') && this.isEndPos(gridX, gridY)) {
                this.dragEnd();
                return;
            }
            if (this.can('dragCheckpoint') && this.isCheckPoint(gridX, gridY) != -1) {
                this.currCheckpoint = this.isCheckPoint(gridX, gridY)
                this.dragCheckpoint();
                return;
            }
            if (this.can('dragStart') && this.isStartPos(gridX, gridY)) {
                this.dragStart();
                return;
            }
            if (this.can('dragEnd') && this.isEndPos(gridX, gridY)) {
                this.dragEnd();
                return;
            }
        }

    },
    mousemove: function (event) { //triggered on moving cursor on the grid
        var coord = View.toGridCoordinate(event.pageX, event.pageY),
            grid = this.grid,
            gridX = coord[0],
            gridY = coord[1];

        if (this.isStartPos(gridX, gridY) && this.isEndPos(gridX, gridY) || this.isCheckPoint(gridX, gridY) != -1) {
            return;
        }
        /**
        * Different behavior based on dragging objects on the grid, e.g Start point, End point or Checkpoints.
        */
        switch (this.current) {
            case 'draggingStart':
                if (grid.isWalkableAt(gridX, gridY)) {
                    this.mousemoveflag = 1
                    this.setStartPos(gridX, gridY);
                    if (this.endstatus == 1)
                        this.findPath(0);
                }
                break;
            case 'draggingEnd':
                if (grid.isWalkableAt(gridX, gridY)) {
                    this.mousemoveflag = 1
                    this.setEndPos(gridX, gridY);
                    if (this.endstatus == 1)
                        this.findPath(0);
                }
                break;
            case 'draggingCheckpoint':
                if (grid.isWalkableAt(gridX, gridY)) {
                    this.mousemoveflag = 1
                    View.setCheckPoint(gridX, gridY, this.checkpoints[this.currCheckpoint].x, this.checkpoints[this.currCheckpoint].y, true)
                    this.checkpoints[this.currCheckpoint].x = gridX;
                    this.checkpoints[this.currCheckpoint].y = gridY;
                    if (this.endstatus == 1) {
                        this.findPath(0);
                    }
                }
                break;
            case 'drawingWall':
                this.setWalkableAt(gridX, gridY, false, "wall");
                break;
            case 'erasingWall':
                this.setWalkableAt(gridX, gridY, true, "wall");
                break;
        }
    },
    mouseup: function (event) { //triggered on realising mouse button on the grid
        if (Agent.can('rest')) {
            var state = this.current;
            Agent.rest();
            var coord = View.toGridCoordinate(event.pageX, event.pageY),
                grid = this.grid,
                gridX = coord[0],
                gridY = coord[1];
            /**
             * Different behavior based on dragging objects on the grid, e.g Start point, End point or Checkpoints.
             */
            switch (state) {
                case 'draggingStart':
                    if (!grid.isWalkableAt(gridX, gridY)) {
                        if (this.endstatus == 1)
                            this.findPath(1);
                    }
                    if (grid.isWalkableAt(gridX, gridY) && !this.isEndPos(gridX, gridY) && this.isCheckPoint(gridX, gridY) == -1) {
                        this.setStartPos(gridX, gridY);
                        if (this.endstatus == 1)
                            this.findPath(1);
                    }
                    break;
                case 'draggingEnd':
                    if (!grid.isWalkableAt(gridX, gridY)) {
                        if (this.endstatus == 1)
                            this.findPath(1);
                    }
                    if (grid.isWalkableAt(gridX, gridY) && !this.isStartPos(gridX, gridY) && this.isCheckPoint(gridX, gridY) == -1) {
                        this.setEndPos(gridX, gridY);
                        if (this.endstatus == 1)
                            this.findPath(1);
                    }
                    break;
                case 'draggingCheckpoint':
                    if (!grid.isWalkableAt(gridX, gridY)) {
                        if (this.endstatus == 1)
                            this.findPath(1)
                    }
                    if (grid.isWalkableAt(gridX, gridY) && !this.isStartPos(gridX, gridY) && !this.isEndPos(gridX, gridY)) {
                        View.setCheckPoint(gridX, gridY, this.checkpoints[this.currCheckpoint].x, this.checkpoints[this.currCheckpoint].y, true)
                        this.checkpoints[this.currCheckpoint].x = gridX;
                        this.checkpoints[this.currCheckpoint].y = gridY;
                        if (this.endstatus == 1) {
                            this.findPath(1);
                        }
                    }
                    break;
            }
        }
    },
    setButtonStates: function () {
        $.each(arguments, function (i, opt) {
            var optid = opt.id;

            var $button = Agent.$buttons.eq(optid);
            if (opt.text) {
                $button.text(opt.text);
            }
            if (opt.callback) {
                $button
                    .unbind('click')
                    .click(opt.callback);
            }
            if (opt.enabled === undefined) {
                return;
            } else if (opt.enabled) {
                $button.removeAttr('disabled');
            } else {
                $button.attr({
                    disabled: 'disabled'
                });
            }
        });
    },
    setButtonStatesMaze: function () {
        $.each(arguments, function (i, opt) {

            var optid = opt.id;
            var $button = Agent.$maze_buttons.eq(optid);
            if (opt.text) {
                $button.text(opt.text);
            }
            if (opt.callback) {
                $button
                    .unbind('click')
                    .click(opt.callback);
            }
            if (opt.enabled === undefined) {
                return;
            } else if (opt.enabled) {
                $button.removeAttr('disabled');
            } else {
                $button.attr({
                    disabled: 'disabled'
                });
            }
        });
    },
    setButtonStatesObstacles: function () {
        $.each(arguments, function (i, opt) {

            var optid = opt.id;
            console.log(opt)
            var $button = Agent.$obstacle_buttons.eq(optid - 1);
            if (opt.text) {
                $button.text(opt.text);
            }
            if (opt.callback) {
                $button
                    .unbind('click')
                    .click(opt.callback);
            }
            if (opt.enabled === undefined) {
                return;
            } else if (opt.enabled) {
                $button.removeAttr('disabled');
            } else {
                $button.attr({
                    disabled: 'disabled'
                });
            }
        });
    },

    /**
     * When initializing, this method will be called to set the positions
     * of start node and end node.
     * It will detect user's display size, and compute the best positions.
     */
    setDefaultStartEndPos: function () {
        var width, height,
            marginRight, availWidth,
            centerX, centerY,
            endX, endY,
            nodeSize = View.nodeSize;

        width = $(window).width();
        height = $(window).height();

        marginRight = $('#algorithm_panel').width();
        availWidth = width - marginRight;

        this.centerX = Math.ceil(availWidth / 2 / nodeSize);
        this.centerY = Math.floor(height / 2 / nodeSize);

        this.setStartPos(this.centerX - 5, this.centerY);
        this.setEndPos(this.centerX + 15, this.centerY + 10);
    },
    setStartPos: function (gridX, gridY) {
        this.startX = gridX;
        this.startY = gridY;
        View.setStartPos(gridX, gridY);
    },
    setEndPos: function (gridX, gridY) {
        this.endX = gridX;
        this.endY = gridY;
        View.setEndPos(gridX, gridY);
    },
    setWalkableAt: function (gridX, gridY, walkable, pit) {
        this.grid.setWalkableAt(gridX, gridY, walkable, pit);
        View.setAttributeAt(gridX, gridY, 'walkable', walkable, "wall");
    },
    setCheckPoint: function (gridX, gridY) {
        this.checkpoints.push({
            x: gridX,
            y: gridY
        })
        View.setCheckPoint(gridX, gridY, -1, -1, true)
    },
    /**
     * ----------------------------------------------------------------------------------------
     * These functions check what type of node the current node is (start,end or checkpoint).
     * ----------------------------------------------------------------------------------------
     */
    isStartPos: function (gridX, gridY) {
        return gridX === this.startX && gridY === this.startY;
    },
    isEndPos: function (gridX, gridY) {
        return gridX === this.endX && gridY === this.endY;
    },
    isCheckPoint: function (gridX, gridY) {
        return this.checkpoints.findIndex(node => node.x == gridX && node.y == gridY);
    },
    /**
     * ----------------------------------------------------------------------------------------
     * Utility functions
     * ----------------------------------------------------------------------------------------
     */
    pathnotfound: function () { //function that returns error when path cannot be found
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 10000,
            timerProgressBar: true,
            onOpen: (to) => {
                to.addEventListener('mouseenter', Swal.stopTimer)
                to.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        Toast.fire({
            icon: 'error',
            title: 'Path not found'
        })
    },
});