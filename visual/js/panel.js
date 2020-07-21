/**
 * The control panel.
 */
const steps = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
const swalQueueStep = Swal.mixin({
    confirmButtonText: 'Next &rarr;',
    cancelButtonText: 'Back',
    progressSteps: steps,
    width: 800,
    inputAttributes: {
        required: true
    },
    reverseButtons: true,
    backdrop: `
    rgba(0,0,123,0.6)
    url("https://i.gifer.com/ZDci.gif")
    left top
    no-repeat
    `
})
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

var Panel = {
    init: function () {
        var $algo = $('#algorithm_panel');
        $('.panel').draggable();
        $('.accordion').accordion({
            collapsible: false,
        });
        $('.option_label').click(function () {
            $(this).prev().click();
        });
        $('#hide_instructions').click(function () {
            $('#instructions_panel').slideUp();
        });
        $('#play_dropdown').css({
            top: 30,
            left: 300,
        });
        $(document).ready(function () {
            backAndForth()
            // Swal.fire({
            //     title: 'Welcome to Space Invaders! Let\'s move forwards towards the base',
            //     text: '',
            //     confirmButtonText: 'Cool'
            //   })
            // alert("Welcome to Space Invaders! Let's move forwards towards the base");
            $('.dropdown-submenu a.test').on("click", function (e) {
                $(this).next('ul').toggle();
                e.stopPropagation();
                e.preventDefault();
            });
        });
        $('#speed_dropdown').css({
            top: 30,
            left: 600,
        });
        $('#obstacles_panel').css({
            top: $algo.offset().top + $algo.outerHeight() + 140
        });

        $('#button2').attr('disabled', 'disabled');
    },

    getSpeed: function () {
        var speed = $('input[name=speed]').val();
        console.log('speeeeeeed');
        console.log(speed);
        return speed;
    },
    /**
     * Get the user selected path-finder.
     */
    getFinder: function () {
        var finder, selected_header, heuristic, allowDiagonal, biDirectional, dontCrossCorners, weight, trackRecursion, timeLimit;
        selected_header = $(
            '#algorithm_panel ' +
            '.ui-accordion-header[aria-selected=true]'
        ).attr('id');


        switch (selected_header) {

            case 'astar_header':
                allowDiagonal = typeof $('#astar_section ' +
                    '.allow_diagonal:checked').val() !== 'undefined';
                biDirectional = typeof $('#astar_section ' +
                    '.bi-directional:checked').val() !== 'undefined';
                dontCrossCorners = typeof $('#astar_section ' +
                    '.dont_cross_corners:checked').val() !== 'undefined';


                /* parseInt returns NaN (which is falsy) if the string can't be parsed */
                weight = parseInt($('#astar_section .spinner').val()) || 1;
                weight = weight >= 1 ? weight : 1; /* if negative or 0, use 1 */

                heuristic = $('input[name=astar_heuristic]:checked').val();
                console.log(heuristic);
                if (biDirectional) {
                    finder = new PF.BiAStarFinder({
                        allowDiagonal: allowDiagonal,
                        dontCrossCorners: dontCrossCorners,
                        heuristic: PF.Heuristic[heuristic],
                        weight: weight

                    });
                } else {
                    finder = new PF.AStarFinder({
                        allowDiagonal: allowDiagonal,
                        dontCrossCorners: dontCrossCorners,
                        heuristic: PF.Heuristic[heuristic],
                        weight: weight
                    });
                }
                break;

            case 'breadthfirst_header':
                allowDiagonal = typeof $('#breadthfirst_section ' +
                    '.allow_diagonal:checked').val() !== 'undefined';
                biDirectional = typeof $('#breadthfirst_section ' +
                    '.bi-directional:checked').val() !== 'undefined';
                dontCrossCorners = typeof $('#breadthfirst_section ' +
                    '.dont_cross_corners:checked').val() !== 'undefined';
                if (biDirectional) {
                    finder = new PF.BiBreadthFirstFinder({
                        allowDiagonal: allowDiagonal,
                        dontCrossCorners: dontCrossCorners
                    });
                } else {
                    finder = new PF.BreadthFirstFinder({
                        allowDiagonal: allowDiagonal,
                        dontCrossCorners: dontCrossCorners
                    });
                }
                break;

            case 'bestfirst_header':
                allowDiagonal = typeof $('#bestfirst_section ' +
                    '.allow_diagonal:checked').val() !== 'undefined';
                biDirectional = typeof $('#bestfirst_section ' +
                    '.bi-directional:checked').val() !== 'undefined';
                dontCrossCorners = typeof $('#bestfirst_section ' +
                    '.dont_cross_corners:checked').val() !== 'undefined';
                heuristic = $('input[name=bestfirst_heuristic]:checked').val();
                if (biDirectional) {
                    finder = new PF.BiBestFirstFinder({
                        allowDiagonal: allowDiagonal,
                        dontCrossCorners: dontCrossCorners,
                        heuristic: PF.Heuristic[heuristic]
                    });
                } else {
                    finder = new PF.BestFirstFinder({
                        allowDiagonal: allowDiagonal,
                        dontCrossCorners: dontCrossCorners,
                        heuristic: PF.Heuristic[heuristic]
                    });
                }
                break;

            case 'dijkstra_header':
                allowDiagonal = typeof $('#dijkstra_section ' +
                    '.allow_diagonal:checked').val() !== 'undefined';
                biDirectional = typeof $('#dijkstra_section ' +
                    '.bi-directional:checked').val() !== 'undefined';
                dontCrossCorners = typeof $('#dijkstra_section ' +
                    '.dont_cross_corners:checked').val() !== 'undefined';
                if (biDirectional) {
                    finder = new PF.BiDijkstraFinder({
                        trackJumpRecursion: trackRecursion,
                        allowDiagonal: allowDiagonal,
                        dontCrossCorners: dontCrossCorners
                    });
                } else {
                    finder = new PF.DijkstraFinder({
                        allowDiagonal: allowDiagonal,
                        dontCrossCorners: dontCrossCorners
                    });
                }
                break;

            case 'jump_point_header':
                trackRecursion = typeof $('#jump_point_section ' +
                    '.track_recursion:checked').val() !== 'undefined';
                heuristic = $('input[name=jump_point_heuristic]:checked').val();

                finder = new PF.JumpPointFinder({
                    trackJumpRecursion: trackRecursion,
                    heuristic: PF.Heuristic[heuristic],
                    diagonalMovement: PF.DiagonalMovement.IfAtMostOneObstacle
                });
                break;
            case 'orth_jump_point_header':
                trackRecursion = typeof $('#orth_jump_point_section ' +
                    '.track_recursion:checked').val() !== 'undefined';

                heuristic = $('input[name=orth_jump_point_heuristic]:checked').val();

                finder = new PF.JumpPointFinder({
                    trackJumpRecursion: trackRecursion,
                    heuristic: PF.Heuristic[heuristic],
                    diagonalMovement: PF.DiagonalMovement.Never
                });
                break;
            case 'cla_header':
                trackRecursion = typeof $('#cla_section ' +
                    '.track_recursion:checked').val() !== 'undefined';
                heuristic = $('input[name=cla_heuristic]:checked').val();
                console.log(heuristic);
                finder = new PF.CLAFinder({
                    heuristic: PF.Heuristic[heuristic],

                });
                break;
            case 'ida_header':
                allowDiagonal = typeof $('#ida_section ' +
                    '.allow_diagonal:checked').val() !== 'undefined';
                dontCrossCorners = typeof $('#ida_section ' +
                    '.dont_cross_corners:checked').val() !== 'undefined';
                trackRecursion = typeof $('#ida_section ' +
                    '.track_recursion:checked').val() !== 'undefined';

                heuristic = $('input[name=jump_point_heuristic]:checked').val();

                weight = parseInt($('#ida_section input[name=astar_weight]').val()) || 1;
                weight = weight >= 1 ? weight : 1; /* if negative or 0, use 1 */

                timeLimit = parseInt($('#ida_section input[name=time_limit]').val());

                // Any non-negative integer, indicates "forever".
                timeLimit = (timeLimit <= 0 || isNaN(timeLimit)) ? -1 : timeLimit;

                finder = new PF.IDAStarFinder({
                    timeLimit: timeLimit,
                    trackRecursion: trackRecursion,
                    allowDiagonal: allowDiagonal,
                    dontCrossCorners: dontCrossCorners,
                    heuristic: PF.Heuristic[heuristic],
                    weight: weight
                });

                break;
        }

        return finder;
    }
};