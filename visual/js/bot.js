/**
 * The Message bot panel.
 * It displays messages to instruct the user.
 */
var Bot = {
    init: function () {
        this.botPan = document.getElementById('bot_panel');
        this.botMsg = document.getElementById('bot_msg');
    },
    botText: function (text, duration) {
        this.botMsg.innerHTML = text;
        this.botPan.style.visibility = 'visible';
        this.botMsg.style.visibility = 'visible';
        setTimeout(function () { //hide the panel after <duration> milliseconds
            if (this.botMsg.innerHTML == text) {
                this.botPan.style.visibility = 'hidden';
                this.botMsg.style.visibility = 'hidden';
            }
        }.bind(this), duration)
    },
    /**
     * The mapping of bot messages with Agent states.
     */
    botState: function (state,checkPointInfo) {
        text = "";
        switch (state) {
            case 0:
                text = "Search Started! <br><br> You can pause or restart anytime you want."
                break;
            case 1:
                text = "Search Started! <br><br> You can pause anytime you want."
                break;
            case 2:
                text = "Search Paused! <br><br> You can come back anytime to resume, or cancel search."
                break;
            case 3:
                text = "Search Resumed! <br><br> You can pause or restart anytime."
                break;
            case 4:
                text = "Search Canceled!"
                break;
            case 5:
                text = "Congratulations! Base Found!<br><br> Try moving the rover/ base to render path in real time!\
                <br><br> Try adding checkpoints (Ctrl+Click) and obstacles as well"
                break;
            case 6:
                text = "Path Cleared! <br><br> Modify the current map and search again"
                break;
            case 7:
                text = "Obstacles cleared! <br><br> Create with a fresh map!"
                break;
            case 8:
                text = "Cleared all checkpoints! <br><br> You can add "+String(checkPointInfo)+" checkpoints now! (Ctrl+Click)"
                break;
            case 9:
                text = "Removed a checkpoint <br><br> You can add "+String(checkPointInfo)+" checkpoints now!"
                break;
            case 10:
                text = "Added a checkpoint <br><br> Checkpoints left: "+String(checkPointInfo)+"<br><br> You can remove a checkpoint using Ctrl+Click"
                break;
            
        }
        this.botText(text, 4000);

    }

}