# Space_Invaders
## Project 1: NAVIGATE THE MARS ROVER
Help the Mars Curiosity Rover find the shortest path between two points while avoiding obstacles on the way.

## Introduction
This is the Javascript based webapp for navigating the mars rover using various pathfinding algorithms. It lets the user visualize route found using various algorithms, add checkpoints along the way, mazes to confuse the rover and drag start, checkpoints and endpoints in real time.

## Features
### Multiple Destinations
- Ctrl+ Click on grid cells to add checkpoints.
- The agent covers the checkpoints in shortest path order and reaches destination.
- Rendering using Travelling salesman algorithm.
- Dynamic Rendering of path through just drag and drop The shortest path is dynamically visible if user even after search is over drags the nodes.
	
![Test Image 1](https://github.com/Akshayakayy/Space_Invaders/blob/master/visual/images/gifs/checkpoints.gif)
![Test Image 1](https://github.com/Akshayakayy/Space_Invaders/blob/master/visual/images/gifs/search.gif)
![Test Image 1](https://github.com/Akshayakayy/Space_Invaders/blob/master/visual/images/gifs/clearall.gif)

### Speed of visualization for pathfinder: Draggable speed control for the Rover

![Test Image 1](https://github.com/Akshayakayy/Space_Invaders/blob/master/visual/images/gifs/speed.gif)

### Mazes of various patterns
Implemented various types of mazes using algorithms:
- Random Maze
- Stair Maze
- Dense Recursive Maze
- Sparse Recursive Maze

![Test Image 1](https://github.com/Akshayakayy/Space_Invaders/blob/master/visual/images/gifs/maze.gif)

### Searching algorithms:

*  `AStarFinder` 
*  `BestFirstFinder`
*  `BreadthFirstFinder` 
*  `DijkstraFinder` 
*  `IDAStarFinder.js` 
*  `JumpPointFinder` 
*  `OrthogonalJumpPointFinder` 
*  `BiAStarFinder`
*  `BiBestFirstFinder`
*  `BiBreadthFirstFinder` 
*  `BiDijkstraFinder` 
*  `CollaborativeLearningAgentsFinder` 

The prefix `Bi` for the last four finders in the above list stands for the bi-directional searching strategy.

### Other features:
* Music loop in game
* Interactive Guide using SweetAlert 
* Landing Page
* TARS bot to provide instructions to the user 


## Running the Project and Local installation:

The project is deployed in Azure. You can access it here: https://tathagataraha.z13.web.core.windows.net/

#### Local running:
- At first clone the repository:

``git clone https://github.com/Akshayakayy/Space_Invaders``

``cd Space_Invaders``

- You can open the visual/landing.html to test it in the browser.

- For development and changing files in the src folder, follow these steps:

`` npm install`` (install the required modules)

``gulp compile && mv lib/pathfinding-browser.min.js visual/lib`` (to compile the src folder)

------

## Technologies Used

* Gulp - We have used gulp to compile the src folder to form a .min.js file
* Bootstrap - We have used Bootstrap for decoration of the UI.
* Sweetalert - Sweetalert is mainly used for the guide and showing the stats in the end.
* Raphael - Raphael is used for generating the grid on which the whole thing happens.
* Npm - It is used for using node modules.
* Git - It is used for version control.
* HTML, CSS, JS and other basic web dev tools are used to write the whole project.


## Project Layout
------------

Layout:

    .
    ├── lib          # browser distribution
    ├── src          # source code (algorithms only)
    	├──  core     # includes grid, node layout with heuristics and utils
	├──  finders  # includes searching algorithms
	├──  mazes    # includes maze algorithms
    ├── visual       # visualization
    	├──  css      # css libraries
	├──  error404 # http 404 error page
	├──  images   # static images and gifs
	├──  js	     # js libraries for agent control and visualization

* [lib](./lib)	` browser distribution `
* [src](./src)	` source code (algorithms only) `
   * [core](./src/core)	` includes grid, node layout with heuristics and utils `
   * [finders](./src/finders)	` includes searching algorithms`
   * [mazes](./src/mazes)		`includes maze algorithms`
* [visual](./visual)	`visualization`
   * [css](./visual/css)	`css libraries`
   * [error404](./visual/error404)	`http 404 error page`
   * [images](./visual/images) `static images and gifs
   * [js](./visual/js)	 `js libraries for agent control and visualization



## Programming Paradigm: 

Object-Oriented Programming

#### Classes

* Agent

Our agent is defined in the visual/js/agent.js file. Based on the user inputs from the panel and the grid, the agent performs the job required.
If any maze algorithm is selected, the agent clears all the obstacles and renders that particular maze algo.
If any search algorithm is selected, the agent searches for the destination accordingly.
On changing the speed, the speed of deploying the speed changes.
The user inputs in the grid-like the start position and the end position and checkpoints. While finding the path it considers the checkpoints and the obstacles placed on the way.
After the path is found, dragging the checkpoint or start or endpoints renders the path in real-time.
These are some of the functions of the agent. We can call the agent a rational agent because here the user inputs and the grid state functions as the precepts of the agent and the agents take the decision and perform the actions based on the perceived environment.

* Mazes

The mazes are defined in the src/mazes folder. Each of the 3 mazes has its classes. 
Input: Depending on the maze user chooses, the agent initializes the class of that particular maze.
Action: After the maze is initialized, each class takes the grid and other things as input and forms the maze on the grid. In case of the recursive mazes, it takes the density as input too.

* Finder

The finders are defined in the src/finders folder. Each of the 10 finders has their own classes.
Input: Depending on the finder the user chooses and the parameters of the finder, the agent initialize the class of that particular finder.
Output: The classes take in the current state grid and other parameters as input and tries to find the 

* Bot

The Bot class is defined in the visual/js/bot.js file. 
Input: It receives the action performed by the agent as input and sets the display text
Action: According to the bot state set due to the input, it changes the innerHTML of the bot’s content to appropriate messages. These messages disappear automatically after the set time if the close button is not pressed through setTimeout function. 

Since the control shifts to these functions after the set time, to avoid clashes between one message to another, the original text and current text are compared. In this way, a message has the power to only delete itself. Result messages are given message IDs because they stay on screen for longer, and shouldn't hide a more recent result message.

* View

The View class is in the visual/js/view.js file. It handles most of the inputs and outputs in the Raphael grid. 
* Panel

The Panel class is in the visual/js/panel.js file. This comprises of all the elements in the navbar. It handles the user inputs from the navigation also responsible for initialization of the correct finder.

* Guide

The Guide class is in the visual/js/guide.js file. Sweetalert’s help is taken to display the tutorial aesthetically. It contains an async function backAndForth that decides which message and gif to display according to which step the user is in the guide.


=======
# Space_Invaders
Repository for project "NAVIGATE THE MARS ROVER" under Microsoft Mars Colonization Program 2020
