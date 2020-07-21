var Bot = {
    init: function () {
        this.botPan = document.getElementById('bot_panel');
        this.botMsg = document.getElementById('bot_msg');
    },
    botText: function (text, duration) {
        this.botMsg.innerHTML = text;
        this.botPan.style.visibility = 'visible';
        this.botMsg.style.visibility = 'visible';
        setTimeout(function () {
            if (this.botMsg.innerHTML == text) {
                this.botPan.style.visibility = 'hidden';
                this.botMsg.style.visibility = 'hidden';
            }
        }, duration)
    },
    botState: function (state) {
        text = "";
        switch (state) {
            case 0:
                text = "Search Paused! <br><br> Hi, You can come back anytime to resume, or cancel search."
                break;
        }
        this.botText(text, 4000);

    }

}