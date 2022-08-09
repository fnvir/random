var cw,ch;
var pi=Math.PI;
/** @type {CanvasRenderingContext2D} */
var ctx;
let undo=[];
let redo=[];
let erase=false;



function main(){

    let canv=document.querySelector('#canv');
    cw=canv.width=window.innerWidth;
    ch=canv.height=window.innerHeight;
    ctx=canv.getContext('2d');
    // ctx.fillStyle='cyan'
    ctx.strokeStyle='white'
    ctx.lineWidth=1
    ctx.lineWidth=10;
    ctx.lineCap="round";

    let d=false;
    let p=[]
    let nodraw=document.querySelector('#controls').getBoundingClientRect();
    let coll=(x,y)=>x<nodraw.width && y<nodraw.height;

    document.addEventListener('mousedown',e=>{
        if(d||coll(e.x,e.y)) return;
        d=true;
        eraser(e.button==2)
        p.push([e.x,e.y]);
        draw(e.x,e.y);
    })

    document.addEventListener('mousemove',e=>{
        if(!d||coll(e.x,e.y)) return;
        let [dx,dy]=p[p.length-1];
        if( Math.abs(e.x-dx)<5 && Math.abs(e.y-dy)<5 ) return;
        p.push([e.x,e.y]) 
        draw(e.x,e.y);
    });

    mUp=(e)=>{
        if(!d||coll(e.x,e.y)) return;
        d=false;
        ctx.beginPath();
        undo.push([erase].concat(p));
        redo.length=0;
        p.length=0;
        if(erase) eraser(false);
    }
    document.addEventListener('mouseup',mUp);

    document.addEventListener('contextmenu',e=>{
        e.preventDefault()
    });


    document.addEventListener('keydown',e=>{
        if(!e.ctrlKey) return;
        if(e.key=='z') _undo();
        else if (e.key=='y') _redo();
    })

    window.addEventListener('blur',mUp);

    document.querySelector('#download').addEventListener('click',dwnld);
    document.querySelectorAll('input').forEach(e=>e.addEventListener('input',updateValues));
}
function eraser(b){
    erase=b;
    ctx.globalCompositeOperation=b?'destination-out':'source-over';
}

function draw(x,y){
    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x,y);
}

function redraw(){
    ctx.clearRect(0,0,cw,ch);
    for(let h of undo){
        eraser(h[0])
        for(let i=1;i<h.length;i++) draw(...h[i])
        ctx.beginPath()
    }
}

function _undo(){
    if(undo.length<1) return;
    redo.push(undo.pop())
    redraw()
}

function _redo(){
    if(redo.length<1) return;
    undo.push(redo.pop())
    redraw()
}

function updateValues(e){
    let id=e.target.id, v=e.target.value;
    if(id=='size') ctx.lineWidth=v;
    else if(id=='color') ctx.strokeStyle=v;
    document.querySelector(`[for="${id}"]`).innerText=id+": "+v;
}

function dwnld(){
    let canvas = document.getElementById("canv");
    let image = canvas.toDataURL();
    let aDownloadLink = document.createElement('a');
    aDownloadLink.download = 'image.png';
    aDownloadLink.href = image;
    aDownloadLink.click();
}

document.addEventListener('DOMContentLoaded',main)