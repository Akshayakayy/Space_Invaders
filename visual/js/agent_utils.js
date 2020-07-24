//pathnotfound
//do something about grouping obstacles
//clearAllcheckpoints
//all clear functions
//pls for heaven's sake do something about obstacles. under mousedown
//maybe create a file with only mousedown, mousemove n mouseup functionalities (triggered from inside agent.js but the functions elsewhere)
//all the set<Obstacles> should be out , ALL OF THEM
var clearFunctions = {
    init: function (opts) {
        // this.botPan = document.getElementById('bot_panel');
        // this.botMsg = document.getElementById('bot_msg');
        // this.msgs = 0;
        this.checkPointsleft = opt.checkPointsleft;
        this.checkpoints = opt.checkpoints;
        this.endstatus = opt.endstatus;
        
    },
    clearAllCheckPoints: function (checkpoints) {
        //console.log("Clearing all checkpoints!");
        for (let i = 0; i < this.checkpoints.length; i++)
            View.setCheckPoint(this.checkpoints[i].x, this.checkpoints[i].y, -1, -1, false);
        this.checkpoints.splice(0, this.checkpoints.length);
        console.log("leftover checkpoints:", this.checkpoints);
        this.checkPointsleft = 4;
        this.currCheckpoint = -1;
        if (this.endstatus == 1)
            this.findPath(1);

        Bot.botState(8, this.checkPointsleft);
    },
}


