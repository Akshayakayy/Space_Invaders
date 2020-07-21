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
        $('#hide_bot').click(function() {
            botpan.style.visibility = 'hidden';
            botmsg.style.visibility = 'hidden';
        });
        $('#play_dropdown').css({
            top: 30,
            left: 300,
        });
        $(document).ready(function () {
            backAndForth()
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