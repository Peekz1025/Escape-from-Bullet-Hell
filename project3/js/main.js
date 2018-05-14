// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application(600,600);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// pre-load the images
PIXI.loader.
add(["images/Spaceship.png","images/explosions.png", "images/devil.png"]).
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene,controlScene,ship,scoreLabel,lifeLabel,controlLabel,shootSound,hitSound,fireballSound,boss;
let gameOverScene;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let bosshealth = 50;
let defbosshealth = 50;
let scoreText;
let hScoreLabel;

//variables for local storage
const prefix = "rdp6158-";
const scoreKey = prefix + "0";
const storedScore = localStorage.getItem(scoreKey);

function setup() {
	stage = app.stage;
	// #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
	
	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    
    // #3.5 - Create the 'controls' scene and make it invisible
    controlScene = new PIXI.Container();
    controlScene.visible = false;
    stage.addChild(controlScene);
	
	// #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
	
    // #5 - Create ship
    ship = new Ship();
    gameScene.addChild(ship);
        
	// #6 - Load Sounds
	shootSound = new Howl({
	   src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
        src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
        src: ['sounds/fireball.mp3']
    });    

	// #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();
		
    // #8 - Start update loop
    app.ticker.add(gameLoop);	
    
	// #9 - Start listening for click events on the canvas
	app.view.onclick = fireBullet;
    
    // #10 - Create boss
    boss = new Boss();
    gameScene.addChild(boss);
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Metal Mania",
    });
    
    //sets up 'start Scene'
    //make the top start label
    let startLabel1 = new PIXI.Text("   Escape \n    from \nBullet Hell");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 70,
        fontFamily: "Metal Mania",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });  
    startLabel1.x = 130;
    startLabel1.y = 70;
    startScene.addChild(startLabel1);
    
    //make the start game button
    let startButton = new PIXI.Text("Try to escape...if you DARE!");
    startButton.style = buttonStyle;
    startButton.x = 45;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", e=>e.target.alpha = 0.7);
    startButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);
    
    //make the high score button
    hScoreLabel = new PIXI.Text("High Score: ");
    //local storage stuff
    // if we find a previously set score value, display it
    if (storedScore){
        hScoreLabel.text += storedScore;
    }
    else{
        hScoreLabel.text += "N/A"; // a default value if `scorefield` is not found
    }
    hScoreLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 50,
        fontFamily: "Metal Mania",
        fontStyle: "italic",
    });  
    hScoreLabel.x = 110;
    hScoreLabel.y = 340;
    startScene.addChild(hScoreLabel); 
    
    //make the controls scene button
    let controlButton = new PIXI.Text("Controls");
    controlButton.style = buttonStyle;
    controlButton.x = 205;
    controlButton.y = 425;
    controlButton.interactive = true;
    controlButton.buttonMode = true;
    controlButton.on("pointerup", startControl);
    controlButton.on("pointerover", e=>e.target.alpha = 0.7);
    controlButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(controlButton);
    
    //make the back to start scene button
    let backButton = new PIXI.Text("Back");
    backButton.style = buttonStyle;
    backButton.x = 250;
    backButton.y = 425;
    backButton.interactive = true;
    backButton.buttonMode = true;
    backButton.on("pointerup", startBack);
    backButton.on("pointerover", e=>e.target.alpha = 0.7);
    backButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    controlScene.addChild(backButton);
    
    //style for controls scene
    let controlStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 45,
        fontFamily: "Metal Mania",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    
    //control text
    controlLabel = new PIXI.Text("         Controls \nMovement: Mouse Drag \n    Shoot: Left Click");
    controlLabel.style = controlStyle;
    controlLabel.x = 85;
    controlLabel.y = 150;
    controlScene.addChild(controlLabel);
    
    //setup gameScene
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Metal Mania",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    
    //score label for in game
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);
    
    //health label for in game
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);
    
    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 75,
        fontFamily: "Metal Mania",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 140;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);
    
    scoreText = new PIXI.Text("Score: " + score);
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 55,
        fontFamily: "Metal Mania",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    scoreText.style = textStyle;
    scoreText.x = 180;
    scoreText.y = 250;
    gameOverScene.addChild(scoreText);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Attempt another Escape?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 70;
    playAgainButton.y = 425;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup",startGame); // startGame is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);
    
    // 3B - make "main menu" button
    let mainMenu = new PIXI.Text("Main Menu");
    mainMenu.style = buttonStyle;
    mainMenu.x = 205;
    mainMenu.y = sceneHeight - 100;
    mainMenu.interactive = true;
    mainMenu.buttonMode = true;
    mainMenu.on("pointerup",startBack); // startBack is a function reference
    mainMenu.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    mainMenu.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(mainMenu);
}

//increases score if player based on number passed in
function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score:  ${score}`;
}

//lowers the player's life if he collides witht the boss or circles
function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life:  ${life}`;
}

function gameLoop(){
	if (paused) return;
	
    // #1 - Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;	

    // #2 - Move Ship
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    //ship.position = mousePosition;	
    
    let amt = 6 * dt;
    
    let newX = lerp(ship.x, mousePosition.x, amt);
    let newY = lerp(ship.y, mousePosition.y, amt);
    
    let w2 = ship.width/2;
    let h2 = ship.height/2;
    ship.x = clamp(newX, 0+w2, sceneWidth-w2);
    ship.y = clamp(newY, 0+h2, sceneHeight-h2);
	
	// #3 - Move Circles
	for(let c of circles){
        //if the circle isn't targeting the player, move normally
        if(c.targeted == false){
           	c.move(dt);
            if(c.x <= c.radius || c.x >= sceneWidth-c.radius){
                c.reflectX();
                c.move(dt);
            }
            if(c.y <= c.radius || c.y >= sceneHeight-c.radius){
                c.reflectY();
                c.move(dt);
            }
        }
        //if the circle is targeting the player, move towards the player
        if(c.targeted == true){
           c.follow(dt, boss.x, boss.y);
        }
        
    }
	
	// #4 - Move Bullets
    for (let b of bullets){
        b.move(dt);
	}
    
    // move boss horizantally if its an even level, and vertically if a odd level
    if(levelNum % 2 == 0){
        boss.moveSide(levelNum);
    }
    if(levelNum != 1 && levelNum % 2 != 0){
        boss.moveClimb(levelNum);
    }
    
    //fire bullets at player
    if(levelNum != 1){
        fireAtPlayer();
    }
    
    //check if bullets are out of bounds
    for(let c of circles){
        if(c.x < 0 || c.x > 600 || c.y < 0 || c.y > 600){
            gameScene.removeChild(c);
            c.isAlive = false;
        }
    }
	
	// #5 - Check for Collisions
	for(let c of circles){
        for(let b of bullets){
            if(rectsIntersect(c,b)){
                fireballSound.play();
                createExplosion(c.x, c.y,64,64)
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(5);
            }
            //boss collision    
            if(rectsIntersect(boss, b)){
                fireballSound.play();
                createExplosion(boss.x, boss.y,64,64)
                gameScene.removeChild(b);
                b.isAlive = false;
                bosshealth -= 1;
            }           
            if(b.y < -10) b.isAlive = false;
        }
        
        if(c.isAlive && rectsIntersect(c,ship)){
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
    }
    if(rectsIntersect(boss,ship)){
        hitSound.play();
        decreaseLifeBy(20);
    }   
	
	// #6 - Now do some clean up
	bullets = bullets.filter(b=>b.isAlive);
    circles = circles.filter(c=>c.isAlive);
	explosions = explosions.filter(e=>e.playing);
    
	// #7 - Is game over?
	if (life <= 0){
        end();
        return; // return here so we skip #8 below
    }
	
	// #8 - Load next level
    if (bosshealth <= 0){
        //increase score by 500, double the boss's health, increase his size slightly, summon lareger number of circles
        increaseScoreBy(500);
        levelNum ++;
        bosshealth = defbosshealth + 50;
        defbosshealth = bosshealth;
        //boss.scale = {x:2,y:2}; //possible for boss growing bigger each level increase
        //boss.style.width += 5%;
        //boss.style.height = 'auto';
        loadLevel();
        //clearCircles();   //function to clear circles
    }
    
    //keep a rel large number of bullets on screen at all times
    if(circles.length <= 2){
        createCircles(levelNum + 5);
    }
}

//craetes circles based on number passed in
function createCircles(numCircles){
    for(let i=0; i<numCircles; i++){
        let c = new Circle(10, 0xFF0000);
        c.x = Math.random() * (sceneWidth - 50) +25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        c.targeted = false;
        circles.push(c);
        gameScene.addChild(c);
    }
}

//loads a new level of the game every time the boss dies
function loadLevel(){
	createCircles(levelNum + 3);
	paused = false;
}

//clears the circles list
function clearCircles(){
    circles.forEach(c=>gameScene.removeChild(c));
    circles = [];
}

//shoots circles directly at the player
function fireAtPlayer(){
    let currX = ship.x;
    let currY = ship.y;
    let r = Math.floor((Math.random() * 50) + 1);
    if(r == 7){
        let c = new Circle(10, 0xFF0000);
        c.x = boss.x;
        c.y = boss.y;
        c.speed = 250;
        c.targeted = true;
        c.targetX = currX;
        c.targetY = currY;
        circles.push(c);
        gameScene.addChild(c);     
    }
}

//starts the game, sets all nessisary varibales
function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    controlScene.visible = false;
    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x = 300;
    ship.y = 550;
    //placement of boss and health reset
    boss.x = 300;
    boss.y = 50;
    bosshealth = 50;
    defbosshealth = 50;
    loadLevel();
}

//goes to the controls screen from main menu
function startControl(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    controlScene.visible = true;
}

//goes to main menu from controls screen
function startBack(){
    // updates localStorage
    if(score > storedScore){
        localStorage.setItem(scoreKey, score);
    }
    hScoreLabel.text = "High Score: " + storedScore;
    
    startScene.visible = true;
    gameOverScene.visible = false;
    gameScene.visible = false;
    controlScene.visible = false;
}

//runs when the game is over
function end(){
    scoreText.text = "Score: " + score;
    paused = true;
    
    clearCircles();
    
    bullets.forEach(b=>gameScene.removeChild(b));
    bullets = [];
    
    explosions.forEach(e=>gameScene.removeChild(e));
    explosions = [];
    
    // updates localStorage
    if(score > storedScore){
        localStorage.setItem(scoreKey, score);
    }
    hScoreLabel.text = "High Score: " + storedScore;
    
    gameOverScene.visible = true;
    gameScene.visible = false;
}

//fires bullets at the player
function fireBullet(e){    
    if(paused)return;
    
    let b = new Bullet(0xFFFFFF, ship.x, ship.y);
    bullets.push(b);
    gameScene.addChild(b);
    shootSound.play();
}

//loads in the explosion sprite sheet
function loadSpriteSheet(){
    let spriteSheet = PIXI.BaseTexture.fromImage("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i=0;i<numFrames;i++){
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}

//creates explosion when bullet collides with boss or circles
function createExplosion(x,y,frameWidth,frameHeight){
    let w2 = frameWidth/2;
    let h2 = frameHeight/2;
    let expl = new PIXI.extras.AnimatedSprite(explosionTextures);
    expl.x = x-w2;
    expl.y = y-h2;
    expl.animationSpeed = 1/7;
    expl.loop = false;
    expl.onComplete = e=>gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}




