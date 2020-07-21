/**
 * The initial guide/tutorial using sweetalert.
 */
async function backAndForth() {
    const values = []
    let currentStep
    var title = ""
    var text = ""
    for (currentStep = 0; currentStep < steps.length;) {
        switch (currentStep) {
            case 0:
                title = "Welcome to Space invaders!"
                text = "Navigate the Mars Rover to reach its base \
                avoiding various types of ridges, mazes and detouring through pitstops for maintenance along\
                the way! Click Next to view the guide."
                imageUrl = "images/gifs/mars.gif"
                break;
            case 1:
                title = "Draw Ridges"
                text = "You are the Chief Engineer with the map of the Mars environment. You need to program the\
                map into the rover! Click and drag to draw ridges for your rover to avoid."
                imageUrl = "images/gifs/walls.gif"
                break;
            case 2:
                title = "Insert and Clear Pitstops"
                text = "Ctrl + Click to place upto 4 pitstops for the rover to undergo maintenance\
                en route to its base! Ctrl + Click on existing pitstops clears them."
                imageUrl = "images/gifs/checkpoints.gif"
                break;
            case 3:
                title = "Adjust speed"
                text = "Drag slider to adjust the speed controls for the rover."
                imageUrl = "images/gifs/speed.gif"
                break;
            case 4:
                title = "Explore Mazes"
                text = "Oh no! There are mazes of so many patterns along the way! Can \
                the rover find its way in these puzzling mazes?"
                imageUrl = "images/gifs/maze.gif"
                break;
            case 5:
                title = "Choose Search Algorithm"
                text = "As the Chief Engineer, you can choose between various state-of-the-art \
                PathFinding algorithms to find the shortest route for the rover to reach its base. "
                break;
            case 6:
                title = "Start searching for shortest route"
                text = "The rover is all set! Base locations, pitstop locations and routing algorithms have been \
                all programmed into the rover. Let's start searching for the shortest route!"
                imageUrl = "images/gifs/search.gif"
                break;
            case 7:
                title = "Pause and resume search"
                text = "An engineer's brain always checks and rechecks for bugs. Why don't you calm\
                yourself down with a pause in the search, get some coffee and check if the search is \
                progressing as planned? You can resume the routing anytime."
                imageUrl = "images/gifs/halt.gif"
                break;
            case 8:
                title = "Drag endpoints and pitstops"
                text = "Communication from the basestation is noisy as anything! Drag the endpoints \
                and pitstop markers to quickly instruct the rover to reroute to new destinations and avoid\
                duststorm affected pitstops. Saves you the trouble of reprogramming the rover for each \
                noisy instruction! "
                imageUrl = "images/gifs/clear.gif"
                break;
            case 9:
                title = "Clear pitstops and obstacles"
                text = "Time to explore new maps! Ctrl + Click on pitstops to clear them or clear \
                all obstacles and pitstops at once from the control panel above."
                imageUrl = "images/gifs/clearall.gif"
                break;
        
        }
        const result = await swalQueueStep.fire({
            title: title,
            text: text,
            imageUrl: imageUrl,
            showCancelButton: currentStep > 0,
            currentProgressStep: currentStep
        })

        if (result.value) {
            values[currentStep] = result.value
            currentStep++
        } else if (result.dismiss === 'cancel') {
            currentStep--
        } else {
            break
        }
    }
}

