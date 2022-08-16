let canv;
/** @type {CanvasRenderingContext2D} */
let ctx;
let cw,ch;

 
const rand=(mn,mx)=>Math.random()*(mx-mn)+mn;
 
class particle{
    constructor(x,y,color){
        this.x=x
        this.y=y
        this.speedX=rand(-5,5)|0
        this.speedY=rand(-5,5)|0
        // this.speedX=Math.floor(rand(5,10))*Math.pow(-1,Math.round(Math.random()))
        // this.speedY=Math.floor(rand(5,10))*Math.pow(-1,Math.round(Math.random()))
        this.radius=rand(5,15)
        this.color=color
    }
    update(){
        this.x+=this.speedX
        this.y+=this.speedY
        if(this.x+this.radius>cw||this.x-this.radius<=0) {this.speedX*=-1}
        if(this.y+this.radius>ch||this.y-this.radius<=0) {this.speedY*=-1}
        if(this.radius>=0.3) this.radius-=0.2
        // this.speedX+=0.2
        this.speedY+=0.2
    }
}

let particles=[]

function main(){
    canv=document.querySelector('#canv');
    ctx=canv.getContext('2d');
    cw=canv.width=window.innerWidth;
    ch=canv.height=window.innerHeight;
    ctx.fillStyle='yellow'
    ctx.StrokeStyle='red'
    ctx.lineWidth=.4
    let h=0
    let px=0,py=0;


    document.addEventListener('mousemove',e=>{
        if(Math.abs(px-e.x)<5 && Math.abs(py-e.y)<5) return;
        let c=`hsl(${h+=3},100%,50%)`;
        for(let i=0;i<10;i++) {particles.push(new particle(e.x,e.y,c));}
        px=e.x;
        py=e.y;
    })
    canv.addEventListener('touchmove',e=>{
        e.preventDefault();
        let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
        let touch = evt.touches[0] || evt.changedTouches[0];
        x = touch.pageX;
        y = touch.pageY
        let c=`hsl(${h+=3},100%,50%)`;
        for(let i=0;i<7;i++) {particles.push(new particle(x,y,c));}
    });


    requestAnimationFrame(draw)
}

function draw(){
    ctx.clearRect(0,0,cw,ch);
    for(let i=0;i<particles.length;i++){
        let p=particles[i];
        ctx.strokeStyle=ctx.fillStyle=p.color;
        ctx.beginPath()
        ctx.arc(p.x,p.y,p.radius,0,2*Math.PI)
        ctx.fill()
        
        p.update()
        if(p.radius<0.3) {particles.splice(i,1);i--;}

        for(let j=i+1;j<Math.min(particles.length,i+10);j++){
            let q=particles[j];
            let dx=p.x-q.x, dy=p.y-q.y;
            let dist=dx*dx+dy*dy;
            if(dist>8100 && dist<10000){
                ctx.beginPath()
                ctx.moveTo(p.x,p.y)
                ctx.lineTo(q.x,q.y)
                ctx.stroke()
            }
        }
    }
    requestAnimationFrame(draw)
}



document.addEventListener('DOMContentLoaded',main);
