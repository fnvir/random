var canv;
/** @type {CanvasRenderingContext2D} */
let ctx;
const cw=window.innerWidth,ch=window.innerHeight;


const randint=(mn,mx)=>Math.round(Math.random()*(mx-mn)+mn);

let n;
const balls=[]
let minV=-5,maxV=5,minR,maxR;



function main(){
    canv=document.querySelector('#canv');
    ctx=canv.getContext('2d');
    canv.width=cw;
    canv.height=ch;
    if(ch*cw<1e6){
        n=50;
        minV=-3,maxV=3
        minR=8;maxR=23;
    } else {
        n=105;
        minR=15;maxR=35;
    }
    for(let i=0;i<n;i++){
        let tx=randint(1,cw-1),ty=randint(1,ch-1),tr=i>n-4?maxR:minR,c=0;
        l: while(c++<300){ // at most 300 tries to avoid infinite loop
            for(let b of balls)
                if((b.x-tx)**2+(b.y-ty)**2<(tr+b.r)**2) {
                    tx=randint(1,cw-1);
                    ty=randint(1,ch-1)
                    tr=randint(minR,maxR)
                    continue l;
                }
            break;
        }
        balls.push(new ball(tx,ty,tr,Math.random()>.5?`hsl(${randint(0,360)},100%,50%)`:'orange'))
    }
    
    requestAnimationFrame(draw)

}


class ball{
    constructor(x,y,r,color){
        this.c=new vector(x,y) //center
        this.r=r // radius
        this.m=Math.PI*this.r**2 // temp mass
        this.v=new vector(randint(minV,maxV),randint(minV,maxV)) // velocity
        this.nextC=this.c.add(this.v)
        this.color=color
    }
    update(){
        if(this.c.x+this.r>=cw) {this.v.x*=-1;this.c.x=cw-this.r}
        else if(this.c.x-this.r<=0) {this.v.x*=-1;this.c.x=this.r}
        if(this.c.y+this.r>=ch) {this.v.y*=-1;this.c.y=ch-this.r}
        else if(this.c.y-this.r<=0) {this.v.y*=-1;this.c.y=this.r}
        this.c.add_eq(this.v)
    }
}


class vector{
    constructor(x,y){
        this.x=x
        this.y=y
    }
    dot(v){
        return this.x*v.x + this.y*v.y;
    }
    add(v){
        return new vector(this.x+v.x,this.y+v.y);
    }
    sub(v){
        return new vector(this.x-v.x,this.y-v.y);
    }
    mul(z){
        return new vector(this.x*z,this.y*z);
    }
    add_eq(v){
        this.x+=v.x;
        this.y+=v.y;
        return this;
    }
    mul_eq(x){
        this.x*=x;
        this.y*=x;
        return this;
    }
    sub_eq(v){
        this.x-=v.x;
        this.y-=v.y;
        return this;
    }
    toString() {return this.x+', '+this.y;}
}


function draw(){
    ctx.clearRect(0,0,cw,ch);
    for(let i=0;i<balls.length;i++){
        let b1=balls[i];
        for(let j=i+1;j<n;j++){
            let b2=balls[j], t=b1.c.sub(b2.c);
            if(t.x**2+t.y**2<=(b1.r+b2.r)**2){
                let z1=b1.c.sub(b2.c), z2=b2.c.sub(b1.c);
                let w1=2*b2.m*b1.v.sub(b2.v).dot(z1)/((b1.m+b2.m)*(z1.x**2+z1.y**2));
                let w2=2*b1.m*b2.v.sub(b1.v).dot(z2)/((b1.m+b2.m)*(z2.x**2+z2.y**2));
                z1.mul_eq(w1);
                z2.mul_eq(w2);
                // fixCollisionPoint(b1,b2)
                b1.v.sub_eq(z1);
                b2.v.sub_eq(z2);
                // to prevent balls from sticking together when velocity is low
                b1.nextC=b1.c.add(b1.v)
                b2.nextC=b2.c.add(b2.v)
                for(let c=0;(b1.nextC.x-b2.nextC.x)**2+(b1.nextC.y-b2.nextC.y)**2<(b1.r+b2.r)**2&&c<50;c++){
                    b1.nextC.add_eq(b1.v)
                    b2.nextC.add_eq(b2.v)
                }
                b1.nextC.sub_eq(b1.v)
                b2.nextC.sub_eq(b2.v)
            }
        }
    }
    for(let b of balls){
        b.c=b.nextC
        b.update()
        ctx.strokeStyle=ctx.fillStyle=b.color;
        ctx.beginPath()
        ctx.arc(b.c.x,b.c.y,b.r,0,2*Math.PI)
        ctx.fill()
    }
    requestAnimationFrame(draw)
}

function fixCollisionPoint(b1,b2) { // if two balls overlap, move them to the point where they dont (sometimes not working)
    // modified from: https://stackoverflow.com/questions/65695029/what-is-the-easiest-way-to-calculate-position-of-balls-on-collision
    let d=b2.c.sub(b1.c),v=b2.v.sub(b1.v);
    let a=v.x**2+v.y**2;
    let b=-2*(v.x*d.x+v.y*d.y);
    let c=d.x**2+d.y**2-(b1.r+b2.r)**2
    let discriminant=b*b-4*a*c;
    if(discriminant<0) return;
    let t=Math.max((-b-Math.sqrt(discriminant))/(2*a),(-b+Math.sqrt(discriminant))/(2*a))
    if(t<0) return;
    b1.nextC=b1.c.sub_eq(b1.v.mul(t))
    b2.nextC=b2.c.sub_eq(b2.v.mul(t))
}


document.addEventListener('DOMContentLoaded',main);
