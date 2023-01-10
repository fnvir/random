var canv;
/** @type {CanvasRenderingContext2D} */
let ctx;
const cw=window.innerWidth,ch=window.innerHeight;


const randint=(mn,mx)=>Math.round(Math.random()*(mx-mn)+mn);

let n;
const balls=[]
let minV,maxV,minR,maxR;



function main(){
    canv=document.querySelector('#canv');
    ctx=canv.getContext('2d');
    canv.width=cw;
    canv.height=ch;
    if(ch*cw<1e6){
        n=20;
        minV=-8;maxV=11;
        minR=8;maxR=24;
    } else {
        n=50;
        minV=-15;maxV=15;
        minR=8;maxR=55;
    }
    for(let i=0;i<n;i++){
        let tx=randint(1,cw-1),ty=randint(1,ch-1),tr=randint(minR,maxR),c=0;
        l: while(c++<800){ // at most 1000 tries to avoid infinite loop
            for(let b of balls)
                if((b.x-tx)**2+(b.y-ty)**2<(tr+b.r)**2) {
                    tx=randint(1,cw-1);
                    ty=randint(1,ch-1)
                    tr=randint(minR,maxR)
                    continue l;
                }
            break;
        }
        balls.push(new ball(tx,ty,tr,`hsl(${randint(0,360)},100%,50%)`))
    }
    
    requestAnimationFrame(draw)

}


class ball{
    constructor(x,y,r,color){
        this.c=new vector(x,y) //center
        this.r=r // radius
        this.m=this.r // mass
        this.v=new vector(randint(minV,maxV),randint(minV,maxV)) // velocity
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



// var tt=Date.now()
// var cc=1
function draw(){
    // if(Date.now()-tt>999){tt=Date.now();console.log(cc);cc=0;}
    // ++cc
    ctx.clearRect(0,0,cw,ch);
    for(let i=0;i<balls.length;i++){
        let b1=balls[i];
        for(let j=i+1;j<n;j++){
            let b2=balls[j], t=b1.c.add(b1.v).sub_eq(b2.c.add(b2.v));
            if(t.x**2+t.y**2<(b1.r+b2.r)**2){
                let z1=b1.c.sub(b2.c), z2=b2.c.sub(b1.c);
                let w1=2*b2.m*b1.v.sub(b2.v).dot(z1)/((b1.m+b2.m)*(z1.x**2+z1.y**2));
                let w2=2*b1.m*b2.v.sub(b1.v).dot(z2)/((b1.m+b2.m)*(z2.x**2+z2.y**2));
                z1.mul_eq(w1);
                z2.mul_eq(w2);
                b1.v.sub_eq(z1);
                b2.v.sub_eq(z2);
            }
        }
    }
    for(let b of balls){
        b.update()
        ctx.strokeStyle=ctx.fillStyle=b.color;
        ctx.beginPath()
        ctx.arc(b.c.x,b.c.y,b.r,0,2*Math.PI)
        ctx.fill()
    }
    requestAnimationFrame(draw)
}



document.addEventListener('DOMContentLoaded',main);