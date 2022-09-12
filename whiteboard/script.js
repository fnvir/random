var cw,ch;
var pi=Math.PI;
/** @type {CanvasRenderingContext2D} */
var ctx;
let undo=[];
let redo=[];

var swidth=10,scolor='white',ewidth=40; //stroke width,colour, eraser width


function main(){

    let canv=document.querySelector('#canv');
    cw=canv.width=window.innerWidth;
    ch=canv.height=window.innerHeight;
    ctx=canv.getContext('2d');
    ctx.lineCap="round";

    let d=false;
    let stroke=[]
    let nodraw=document.querySelector('#controls').getBoundingClientRect();
    let coll=(x,y)=>x<nodraw.width && y<nodraw.height;


    function getXY(e){
        let x,y;
        if(['touchstart' ,'touchmove','touchend','touchcancel'].includes(e.type)) {
            let evt = (typeof e.originalEvent == 'undefined') ? e : e.originalEvent;
            let touch = evt.touches[0] || evt.changedTouches[0];
            x = touch.pageX;
            y = touch.pageY;
        } else if (['mousedown','mouseup','mousemove','mouseover','mouseout','mouseenter','mouseleave'].includes(e.type)) {
            x = e.clientX;
            y = e.clientY;
        }
        return [x,y]
    }
    
    function mdown(e){
        e.preventDefault()
        let [x,y]=getXY(e)
        if(d||coll(x,y)) return;
        d=true;
        let isEraser=e.button==2,l=isEraser?ewidth:swidth;
        stroke.push([isEraser,l,scolor])
        stroke.push([x,y]);
        ctx.lineWidth=l
        ctx.strokeStyle=scolor;
        ctx.globalCompositeOperation=isEraser?'destination-out':'source-over';
        draw(x,y);
    }

    function mmove(e){
        e.preventDefault()
        let [x,y]=getXY(e)
        if(!d||coll(x,y)) return;
        let [dx,dy]=stroke[stroke.length-1];
        if( Math.abs(x-dx)<5 && Math.abs(y-dy)<5 ) return;
        stroke.push([x,y]) 
        draw(x,y);
    }
    function mUp(e){
        e.preventDefault()
        let [x,y]=getXY(e)
        if(!d||coll(x,y)) return;
        d=false;
        ctx.beginPath();
        undo.push(stroke);
        stroke=[];
        redo.length=0;
    }

    canv.addEventListener('mousedown',mdown)
    canv.addEventListener('mousemove',mmove);
    canv.addEventListener('mouseup',mUp);

    canv.addEventListener('touchstart',mdown)
    canv.addEventListener('touchmove',mmove);
    canv.addEventListener('touchend',mUp);

    canv.addEventListener('contextmenu',e=>e.preventDefault());


    document.addEventListener('keydown',e=>{
        if(!e.ctrlKey) return;
        if('xyz'.includes(e.key)) e.preventDefault()
        if(e.key=='z') _undo();
        else if (e.key=='y') _redo();
        else if(e.key=='x'&& undo[undo.length-1]!='clear') {
            ctx.clearRect(0,0,cw,ch)
            undo.push('clear')
        }
    })

    canv.addEventListener('wheel',e=>{
            let a=Math.sign(e.wheelDeltaY),id='pen';
            if(e.ctrlKey){
                e.preventDefault()
                if(ewidth+2*a<101) ewidth+=2*a;
                id='eraser';
            } else if(swidth+a<51) swidth+=a
            
            let z=document.querySelector('#'+id);
            z.value=id=='eraser'?ewidth:swidth;
            document.querySelector(`[for="${id}"]`).innerText=id+': '+z.value;
    });

    window.addEventListener('blur',mUp);

    document.querySelector('#download').addEventListener('click',dwnld);
    document.querySelectorAll('input').forEach(e=>e.addEventListener('input',updateValues));
}

function draw(x,y){
    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x,y);
}

function redraw(start=0){
    ctx.clearRect(0,0,cw,ch);
    for(let i=start;i<undo.length;i++)
        drawStroke(undo[i])
}

function drawStroke(stroke){
    let [erase,lwidth,lcolor]=stroke[0];
    ctx.lineWidth=lwidth;
    ctx.strokeStyle=lcolor;
    ctx.globalCompositeOperation=erase?'destination-out':'source-over';
    for(let i=1;i<stroke.length;i++) draw(...stroke[i])
    ctx.beginPath()
}


function _undo(){
    if(undo.length<1) return;
    redo.push(undo.pop())
    redraw(undo.lastIndexOf('clear')+1)
}

function _redo(){
    if(redo.length<1) return;
    undo.push(redo.pop())
    redraw(undo.lastIndexOf('clear')+1)
}

function updateValues(e){
    let id=e.target.id, v=e.target.value;
    if(id=='pen') swidth=+v;
    else if(id=='eraser') ewidth=+v;
    else if(id=='color') ctx.strokeStyle=scolor=v;
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
