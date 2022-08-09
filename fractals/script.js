const sleep = ms => new Promise(res => setTimeout(res, ms));

var pi=Math.PI;
var sides=4;
var angle=pi/2;
var scale=0.68;
var mxdepth=6;
var branches=1;

/** @type {CanvasRenderingContext2D} */
var ctx;
var cw,ch;
var lsize;

function f(){
    let canvas = document.querySelector('#ncan');
    ctx=canvas.getContext("2d");
    cw=canvas.width=window.innerWidth;
    ch=canvas.height=window.innerHeight;
    ctx.strokeStyle=get_random_color();
    ctx.lineWidth=10;
    ctx.lineCap='round'
    ctx.shadowColor='rgba(0,0,0,0.7)';
    ctx.shadowOffsetX=5
    ctx.shadowOffsetY=5
    ctx.shadowBlur=8;

    
    randomize();
    lsize=getlnSize(cw,ch);
    document.querySelector('#randomize').addEventListener('click',randomize);
    document.querySelector('#download').addEventListener('click',saveImage);
    document.querySelectorAll('input[type="range"]').forEach(e=>e.addEventListener('input',updateValues));
    document.querySelector('#colour').addEventListener('change',(ev)=>{
        let v=ev.target.value;
        ctx.strokeStyle=v;
        document.querySelector('[for="colour"]').innerText='Color: '+v;
        drawFractal();
    });
    // let c1=get_random_color(),c2=get_random_color();
    
    // drawbranch(0);
    drawFractal();

}

function drawFractal() {
    ctx.clearRect(0,0,cw,ch);
    ctx.save();
    // ctx.fillStyle='black' //uncomment to add background color
    // ctx.fillRect(0,0,cw,ch);
    ctx.translate(cw/2,ch/2);
    ctx.rotate(1.5*pi);
    for(let i=0;i<sides;i++){
        drawbranch(mxdepth-1);
        ctx.rotate(2*pi/sides)
    }
    ctx.restore()
}

const getlnSize=()=>{
    let w=Math.min(cw,ch)/2.04;
    let b=0;
    for(let i=0;i<Math.min(mxdepth,9);i++) b+=scale**i;
    return Math.floor(w/b);
};


function drawbranch(lvl){
    if(lvl<0) return;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(lsize,0);
    ctx.stroke();
    // ctx.strokeStyle=lvl&1?c1:c2;
    for(let i=1;i<=branches;i++){
        ctx.save()
        ctx.translate(lsize*i/branches, 0);
        ctx.rotate(angle);
        ctx.scale(scale,scale);
        drawbranch(lvl-1);
        ctx.restore();
        
        ctx.save()
        ctx.translate(lsize*i/branches,0);
        ctx.rotate(-angle);
        ctx.scale(scale,scale);
        drawbranch(lvl-1);
        ctx.restore();
    }
}


const rand=(mn,mx)=>Math.floor(mn+Math.random()*(mx-mn));
function get_random_color() {
    let h = rand(1, 360);
    return `hsl(${h},100%,50%)`;
}

function randomize(){
    sides=rand(3,7);
    angle=Math.random()*2.2+0.4;
    scale=Math.random()*0.35+0.4;
    mxdepth=rand(3,6);
    branches=rand(1,3);
    ctx.strokeStyle=get_random_color();
    lsize=getlnSize();
    updateSliders();
    drawFractal();
}

function updateValues(ev){
    let e=ev.target
    let id=e.id;
    let v=+e.value;
    if(Math.abs(v)==3.1) v=pi*(2*(v>0)-1);
    else if(Math.abs(v)==1.6) v=(pi/2)*(2*(v>0)-1);
    document.querySelector(`[for="${id}"]`).innerText=`${capitalize(id)}: ${+(v.toFixed(2))}`;
    if(id=='angle') angle=v
    else if(id=='sides') sides=v;
    else if(id=='branches') branches=v;
    else mxdepth=v;
    drawFractal();
}

function updateSliders(){
    document.querySelectorAll('input[type="range"]').forEach(e=>{
        let id=e.id;
        let v=angle;
        if(id=='sides') v=sides;
        else if(id=='branches') v=branches;
        else if(id==='depth') v=mxdepth;
        v=+(v.toFixed(2));
        e.value=v;
        document.querySelector(`[for="${id}"]`).innerText=`${capitalize(id)}: ${v}`;
    });
    document.querySelector('#colour').value=ctx.strokeStyle;
    document.querySelector('[for="colour"]').innerText='Color: '+ctx.strokeStyle;
}

const capitalize=s=>s.charAt(0).toUpperCase()+s.slice(1);


function saveImage(){
    // let image = document.querySelector('#ncan').toDataURL("image/png").replace("image/png", "image/octet-stream");
    // window.location.href=image;
    // Get the canvas
    let canvas = document.getElementById("ncan");
    // Convert the canvas to data
    let image = canvas.toDataURL();
    // Create a link
    let aDownloadLink = document.createElement('a');
    // Add the name of the file to the link
    aDownloadLink.download = 'image.png';
    // Attach the data to the link
    aDownloadLink.href = image;
    // Get the code to click the download link
    aDownloadLink.click();
}

document.addEventListener('DOMContentLoaded',f);