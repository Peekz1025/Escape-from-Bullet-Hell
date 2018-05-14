//ship class for the player
class Ship extends PIXI.Sprite{
    constructor(x=0,y=0){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(.5,.5); //moves pos, rotaiton etc to center to sprite
        this.scale.set(.1);
        this.x = x;
        this.y = y;
    }
}

//circles function with move, relfect, and follow player functions
class Circle extends PIXI.Graphics{
    constructor(radius, color = 0xFF0000, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fwd = getRandomUnitVector();
        this.speed = 200;
        this.isAlive = true;
        this.targeted = false;
        this.targetX = 0;
        this.targetY = 0;
    }
    
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
    
    reflectX(){
        this.fwd.x *= -1;
    }
    
    reflectY(){
        this.fwd.y *= -1;
    }
    
    follow(dt=1/60, bossX, bossY){
        let c =  Math.sqrt(((this.targetX - bossX) * (this.targetX - bossX)) + ((this.targetY - bossY) * (this.targetY - bossY)));
        let xx = (this.targetX - bossX) / c;
        let yy = (this.targetY - bossY) / c;
        this.x += xx * this.speed * dt;
        this.y += yy * this.speed * dt;
    }
}

//bullet class with a move upwards function
class Bullet extends PIXI.Graphics{
    constructor(color=0xFFFFFF, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,4,6);
        this.endFill();
        this.x = x;
        this.y = y;
        this.fwd = {x:0, y:-1};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }
    
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

//boss class with movement horizontally and vertically functions
class Boss extends PIXI.Sprite{
    constructor(x=0,y=0){
        super(PIXI.loader.resources["images/devil.png"].texture);
        this.anchor.set(.5,.5); //moves pos, rotaiton etc to center to sprite
        this.scale.set(.3);
        this.x = x;
        this.y = y;
        let direction = "right";
        this.direction = "right";
    }
    
    moveSide(levelNum){
        if(this.x >= 550 && this.direction == "right"){
           this.direction = "left";
        }        
        if(this.x <= 50 && this.direction == "left"){
           this.direction = "right";
        }
        if(levelNum < 6){
           if(this.direction == "right"){
                this.x += 1;
            }
            if(this.direction == "left"){
                this.x -= 1;
            }
        }       
        if(levelNum >= 6){
           if(this.direction == "right"){
                this.x += 2;
            }
            if(this.direction == "left"){
                this.x -= 2;
            }
        }
    }
    
    moveClimb(levelNum){
        if(this.y >= 540 && this.direction == "right"){
           this.direction = "left";
        }        
        if(this.y <= 50 && this.direction == "left"){
           this.direction = "right";
        }
        if(levelNum < 6){
           if(this.direction == "right"){
                this.y += 1;
            }
            if(this.direction == "left"){
                this.y -= 1;
            }
        }
        if(levelNum >= 6){
           if(this.direction == "right"){
                this.y += 2;
            }
            if(this.direction == "left"){
                this.y -= 2;
            }
        }
    }
    
}









