(() => {
  const hub = document.getElementById('hub');
  const scene = document.getElementById('scene');
  const body = document.getElementById('sceneBody');
  const title = document.getElementById('sceneTitle');
  const dots = document.getElementById('stepDots');
  const progress = document.getElementById('roomProgress');
  const roomComplete = document.getElementById('roomComplete');
  const state = {bed:false,floor:false,desk:false,laundry:false};
  let cleanup = [];

  function on(el, ev, fn, opts){el.addEventListener(ev, fn, opts); cleanup.push(()=>el.removeEventListener(ev,fn,opts));}
  function clearScene(){cleanup.forEach(f=>f()); cleanup=[]; body.innerHTML=''; dots.innerHTML='';}
  function setDots(step,total){dots.innerHTML=''; for(let i=1;i<=total;i++){const d=document.createElement('span');d.className='step-dot'+(i<=step?' on':'');dots.appendChild(d)}}
  function updateHub(){const done=Object.values(state).filter(Boolean).length;progress.style.width=(done/4*100)+'%';document.querySelectorAll('.hotspot').forEach(h=>h.classList.toggle('done',!!state[h.dataset.open]));if(done===4){roomComplete.hidden=false;setTimeout(()=>roomComplete.hidden=true,2600)}}
  function completeTask(key){state[key]=true; success(()=>{showHub();updateHub()});}
  function success(cb){const f=document.createElement('div');f.className='success-flash';f.innerHTML='<div>✨ ✅ ✨</div>';body.appendChild(f);spark(window.innerWidth/2,window.innerHeight/2);setTimeout(()=>{f.remove();cb&&cb()},1050)}
  function spark(x,y){for(let i=0;i<12;i++){const s=document.createElement('div');s.className='spark';s.textContent=i%2?'✨':'✦';s.style.left=(x+(Math.random()*160-80))+'px';s.style.top=(y+(Math.random()*110-55))+'px';body.appendChild(s);setTimeout(()=>s.remove(),900)}}
  function showHub(){clearScene();scene.classList.remove('active');hub.classList.add('active')}
  function openScene(name){hub.classList.remove('active');scene.classList.add('active');clearScene();({bed:bedScene,floor:floorScene,desk:deskScene,laundry:laundryScene}[name])()}
  document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openScene(b.dataset.open)));
  document.getElementById('backBtn').addEventListener('click',showHub);
  document.getElementById('resetBtn').addEventListener('click',()=>{Object.keys(state).forEach(k=>state[k]=false);updateHub()});

  function makeDraggable(el,{onMove,onDrop}={}){
    let active=false,dx=0,dy=0;
    const down=e=>{active=true;el.setPointerCapture?.(e.pointerId);const r=el.getBoundingClientRect();dx=e.clientX-r.left;dy=e.clientY-r.top;el.classList.add('dragging');e.preventDefault()};
    const move=e=>{
      if(!active)return;
      const parent=el.offsetParent;
      const pr=parent?.getBoundingClientRect?.() || {left:0,top:0};
      el.style.left=(e.clientX-pr.left-dx)+'px';
      el.style.top=(e.clientY-pr.top-dy)+'px';
      onMove&&onMove(e,el);e.preventDefault()
    };
    const up=e=>{if(!active)return;active=false;el.classList.remove('dragging');onDrop&&onDrop(e,el);e.preventDefault()};
    on(el,'pointerdown',down);on(window,'pointermove',move,{passive:false});on(window,'pointerup',up,{passive:false});
  }
  function overlaps(a,b,pad=0){const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return A.left < B.right-pad && A.right > B.left+pad && A.top < B.bottom-pad && A.bottom > B.top+pad}
  function card(text){const c=document.createElement('div');c.className='action-card';c.innerHTML=text;body.appendChild(c);return c}
  function image(src){const im=document.createElement('img');im.className='scene-photo';im.src=src;im.alt='';im.draggable=false;body.appendChild(im);return im}

  function bedScene(){
    title.textContent='MAKE THE BED';
    const total=10;
    let step=1;
    setDots(step,total);

    const stage=document.createElement('div');stage.className='bed-stage';body.appendChild(stage);
    const canvas=document.createElement('div');canvas.className='bed-canvas';stage.appendChild(canvas);
    const bg=document.createElement('img');bg.className='bed-bg';bg.src='assets/scenes/bed-overhead-messy.png';bg.alt='Birds-eye view of the hotel bed and laundry caddy';bg.draggable=false;canvas.appendChild(bg);
    const shade=document.createElement('div');shade.className='bed-darken';canvas.appendChild(shade);
    const caddy=document.createElement('div');caddy.className='drop-zone caddy-zone';canvas.appendChild(caddy);

    // The sheet is already on the mattress, underneath the pillows.
    const sheet=document.createElement('img');
    sheet.className='bed-sheet-layer';
    sheet.src='assets/bed/01-sheet-full.png';
    sheet.alt='Dirty sheet on the bed';
    sheet.draggable=false;
    canvas.appendChild(sheet);

    let instruction=card('<span class="instruction-icon">🛏️</span> Pull the duvet cover towards the side');

    function caseToCaddy(side, crumpled, done){
      instruction.innerHTML='<span class="instruction-icon">🧺</span> Put the pillowcase in the caddy';
      makeDraggable(crumpled,{onDrop:()=>{
        if(overlaps(crumpled,caddy,14)){
          const cr=caddy.getBoundingClientRect();
          crumpled.style.transition='transform .35s ease, opacity .35s ease';
          const rr=crumpled.getBoundingClientRect();
          crumpled.style.transform=`translate(${cr.left+cr.width*.35-rr.left}px,${cr.top+cr.height*.35-rr.top}px) scale(.35)`;
          crumpled.style.opacity='0';
          spark(cr.left+cr.width/2,cr.top+cr.height/2);
          setTimeout(()=>{crumpled.remove();done();},360);
        } else {
          crumpled.style.left=crumpled.dataset.homeLeft;
          crumpled.style.top=crumpled.dataset.homeTop;
        }
      }});
    }

    const pillowGroups={};
    function createPillowVisual(side){
      const isLeft=side==='left';
      const group=document.createElement('div');
      group.className='pillow-game awaiting '+(isLeft?'pillow-left':'pillow-right');
      group.dataset.side=side;
      canvas.appendChild(group);

      const bare=document.createElement('img');
      bare.className='pillow-bare';
      bare.src=`assets/bed/pillows/${side}-bare.png`;
      bare.draggable=false;
      group.appendChild(bare);

      const clip=document.createElement('div');
      clip.className='pillow-case-clip';
      group.appendChild(clip);

      const caseImg=document.createElement('img');
      caseImg.className='pillow-case-layer';
      caseImg.src=`assets/bed/pillows/${side}-with-case.png`;
      caseImg.draggable=false;
      clip.appendChild(caseImg);

      pillowGroups[side]=group;
      return group;
    }

    createPillowVisual('left');
    createPillowVisual('right');

    function pillowcaseTask(side,done){
      const isLeft=side==='left';
      const group=pillowGroups[side]||createPillowVisual(side);
      const clip=group.querySelector('.pillow-case-clip');
      const caseImg=group.querySelector('.pillow-case-layer');
      group.classList.remove('awaiting','pillow-done');
      clip.style.opacity='1';
      clip.style.clipPath='inset(0)';
      caseImg.src=`assets/bed/pillows/${side}-with-case.png`;
      caseImg.style.transform='none';

      const handle=document.createElement('div');
      handle.className='pillow-pull-handle '+(isLeft?'pull-left':'pull-right');
      handle.innerHTML=isLeft?'←':'→';
      group.appendChild(handle);

      let active=false,startX=0,progress=0,swapped=false;
      const down=e=>{active=true;startX=e.clientX;handle.setPointerCapture?.(e.pointerId);handle.classList.add('dragging');e.preventDefault()};
      const move=e=>{
        if(!active)return;
        const gw=group.getBoundingClientRect().width;
        const delta=isLeft?(startX-e.clientX):(e.clientX-startX);
        progress=Math.max(0,Math.min(1,delta/(gw*.82)));
        const shift=(isLeft?-1:1)*progress*72;
        caseImg.style.transform=`translateX(${shift}%) rotate(${(isLeft?-1:1)*progress*5}deg)`;
        clip.style.clipPath=isLeft?`inset(0 ${progress*82}% 0 0)`:`inset(0 0 0 ${progress*82}%)`;
        handle.style.transform=`translate(${(isLeft?-1:1)*progress*44}px,-50%) scale(${1+progress*.08})`;
        if(progress>.28 && !swapped){caseImg.src=`assets/bed/pillows/${side}-case.png`;swapped=true;}
        if(progress<=.28 && swapped){caseImg.src=`assets/bed/pillows/${side}-with-case.png`;swapped=false;}
        e.preventDefault();
      };
      const up=e=>{
        if(!active)return;active=false;handle.classList.remove('dragging');
        if(progress>=.82){
          clip.style.opacity='0';handle.remove();
          const crumpled=document.createElement('img');
          crumpled.className='pillowcase-crumpled '+(isLeft?'from-left':'from-right');
          crumpled.src='assets/bed/pillows/crumpled.png';crumpled.draggable=false;
          canvas.appendChild(crumpled);
          crumpled.dataset.homeLeft=crumpled.style.left;
          crumpled.dataset.homeTop=crumpled.style.top;
          spark(group.getBoundingClientRect().left+group.clientWidth/2,group.getBoundingClientRect().top+group.clientHeight/2);
          setTimeout(()=>caseToCaddy(side,crumpled,()=>{group.classList.add('pillow-done');done();}),120);
        } else {
          progress=0;swapped=false;caseImg.src=`assets/bed/pillows/${side}-with-case.png`;
          caseImg.style.transform='none';clip.style.clipPath='inset(0)';handle.style.transform='translate(0,-50%)';
          handle.classList.add('corner-bounce');setTimeout(()=>handle.classList.remove('corner-bounce'),280);
        }
        e.preventDefault();
      };
      on(handle,'pointerdown',down);on(window,'pointermove',move,{passive:false});on(window,'pointerup',up,{passive:false});
    }

    // Duvet cover is a separate layer. The insert remains until cases are removed.
    const duvet=document.createElement('div');duvet.className='duvet-system';canvas.appendChild(duvet);
    const insert=document.createElement('img');insert.className='duvet-insert';insert.src='assets/bed/duvet/duvet-insert.png';insert.draggable=false;duvet.appendChild(insert);
    const coverClip=document.createElement('div');coverClip.className='duvet-cover-clip';duvet.appendChild(coverClip);
    const cover=document.createElement('img');cover.className='duvet-cover';cover.src='assets/bed/duvet/duvet-cover.png';cover.draggable=false;coverClip.appendChild(cover);
    // The arrow is only a visual cue. Learners can pull from anywhere on the duvet.
    const duvetArrow=document.createElement('span');
    duvetArrow.className='duvet-remove-handle';
    duvetArrow.textContent='→';
    duvetArrow.setAttribute('aria-hidden','true');
    duvet.appendChild(duvetArrow);
    duvet.setAttribute('role','button');
    duvet.setAttribute('tabindex','0');
    duvet.setAttribute('aria-label','Pull the duvet cover to the right');

    let duvetActive=false, duvetFinished=false, duvetStartX=0, duvetProgress=0, duvetPointerId=null;

    function showDuvetPull(amount){
      duvetProgress=Math.max(0,Math.min(1,amount));
      cover.style.transform=`translateX(${duvetProgress*100}%) scaleY(${1-duvetProgress*.12})`;
      coverClip.style.clipPath=`inset(0 0 0 ${duvetProgress*98}%)`;
      duvetArrow.style.opacity=String(Math.max(0,1-duvetProgress*1.5));
    }

    function resetDuvetPull(){
      cover.style.transition='transform .18s ease-out';
      coverClip.style.transition='clip-path .18s ease-out';
      showDuvetPull(0);
      setTimeout(()=>{
        if(!duvetFinished){cover.style.transition='';coverClip.style.transition='';}
      },190);
    }

    function finishDuvetPull(){
      if(duvetFinished)return;
      duvetFinished=true;
      duvetActive=false;
      duvet.classList.remove('duvet-pulling');
      duvet.style.pointerEvents='none';
      duvetArrow.remove();
      duvet.removeAttribute('role');
      duvet.removeAttribute('tabindex');
      duvet.removeAttribute('aria-label');

      // A brief finishing movement makes the cover glide away rather than jump.
      cover.style.transition='transform .16s ease-out';
      coverClip.style.transition='clip-path .16s ease-out';
      showDuvetPull(1);
      setTimeout(()=>{
        coverClip.remove();
        const pile=document.createElement('img');
        pile.className='duvet-pile';
        pile.src='assets/bed/duvet/duvet-cover-pile.png';
        pile.draggable=false;
        canvas.appendChild(pile);
        instruction.innerHTML='<span class="instruction-icon">🧺</span> Put the duvet cover in the caddy';
        makeDraggable(pile,{onDrop:()=>{
          if(overlaps(pile,caddy,14)){
            pile.style.transition='opacity .35s ease,transform .35s ease';
            pile.style.opacity='0';
            pile.style.transform='scale(.25)';
            spark(caddy.getBoundingClientRect().left,caddy.getBoundingClientRect().top);
            setTimeout(()=>{
              pile.remove();
              duvet.style.opacity='0';
              step=2;
              setDots(step,total);
              startPillows();
            },400);
          }else{
            pile.style.left='40%';
            pile.style.top='43%';
          }
        }});
      },165);
    }

    on(duvet,'pointerdown',e=>{
      if(duvetFinished||duvetActive)return;
      duvetActive=true;
      duvetPointerId=e.pointerId;
      duvetStartX=e.clientX;
      cover.style.transition='none';
      coverClip.style.transition='none';
      duvet.classList.add('duvet-pulling');
      try{duvet.setPointerCapture(e.pointerId)}catch(_){}
      e.preventDefault();
    });
    on(window,'pointermove',e=>{
      if(!duvetActive||e.pointerId!==duvetPointerId)return;
      const distance=Math.max(80,duvet.getBoundingClientRect().width*.27);
      showDuvetPull((e.clientX-duvetStartX)/distance);
      e.preventDefault();
    },{passive:false});
    function releaseDuvet(e){
      if(!duvetActive||e.pointerId!==duvetPointerId)return;
      duvetActive=false;
      duvet.classList.remove('duvet-pulling');
      try{if(duvet.hasPointerCapture(e.pointerId))duvet.releasePointerCapture(e.pointerId)}catch(_){}
      // A short, intentional pull is sufficient, particularly on touchscreens.
      if(duvetProgress>=.38){finishDuvetPull();}
      else{resetDuvetPull();}
      e.preventDefault();
    }
    on(window,'pointerup',releaseDuvet,{passive:false});
    on(window,'pointercancel',releaseDuvet,{passive:false});
    on(duvet,'keydown',e=>{
      if(duvetFinished)return;
      if(e.key==='Enter'||e.key===' '||e.key==='ArrowRight'){
        e.preventDefault();
        finishDuvetPull();
      }
    });
    function startPillows(){instruction.innerHTML='<span class="instruction-icon">↔️</span> Pull the left pillowcase off';pillowcaseTask('left',()=>{
      step=3;setDots(step,total);instruction.innerHTML='<span class="instruction-icon">↔️</span> Pull the right pillowcase off';pillowcaseTask('right',()=>{step=4;setDots(step,total);canvas.querySelectorAll('.pillow-game').forEach(el=>el.remove());startSheetRemoval()})})}

    function startSheetRemoval(){
      instruction.innerHTML='<span class="instruction-icon">↙️</span> Pull the highlighted sheet corner into the middle';
      const cornerPositions=[
        {left:'29.3%',top:'65.8%', icon:'↗'},
        {left:'66.8%',top:'65.8%', icon:'↖'},
        {left:'29.7%',top:'12.5%', icon:'↘'},
        {left:'66.2%',top:'12.5%', icon:'↙'}
      ];
      const stageImages=[
        'assets/bed/02-sheet-pull-bottom-left.png',
        'assets/bed/03-sheet-pull-bottom.png',
        'assets/bed/04-sheet-pull-three.png',
        'assets/bed/05-sheet-pile.png'
      ];
      let cornerIndex=0;
      let handle=null;

      const centreTarget=document.createElement('div');
      centreTarget.className='sheet-centre-target';
      canvas.appendChild(centreTarget);

      function showCorner(){
        if(handle) handle.remove();
        const pos=cornerPositions[cornerIndex];
        handle=document.createElement('div');
        handle.className='sheet-corner-handle';
        handle.style.left=pos.left;handle.style.top=pos.top;handle.innerHTML='<span>'+pos.icon+'</span>';
        canvas.appendChild(handle);
        makeDraggable(handle,{onDrop:()=>{
          if(overlaps(handle,centreTarget,10)){
            handle.remove();handle=null;sheet.classList.add('sheet-changing');
            setTimeout(()=>{
              sheet.src=stageImages[cornerIndex];sheet.classList.remove('sheet-changing');cornerIndex++;
              step=Math.min(total,3+cornerIndex);setDots(step,total);
              spark(canvas.getBoundingClientRect().left+canvas.clientWidth*.49,canvas.getBoundingClientRect().top+canvas.clientHeight*.47);
              if(cornerIndex<4){instruction.innerHTML='<span class="instruction-icon">🛏️</span> Pull the next sheet corner into the middle';showCorner();}
              else{centreTarget.remove();instruction.innerHTML='<span class="instruction-icon">🧺</span> Drag the sheet pile into the caddy';makePileDraggable();}
            },180);
          }else{handle.style.left=pos.left;handle.style.top=pos.top;handle.classList.add('corner-bounce');setTimeout(()=>handle&&handle.classList.remove('corner-bounce'),300)}
        }});
      }
      showCorner();
    }

    function makePileDraggable(){
      sheet.classList.add('sheet-pile-ready');sheet.style.pointerEvents='none';
      const pile=document.createElement('div');pile.className='sheet-pile-hitbox';canvas.appendChild(pile);
      makeDraggable(pile,{onMove:()=>{
        const pr=canvas.getBoundingClientRect(),r=pile.getBoundingClientRect();
        sheet.style.transform=`translate(${r.left-pr.left-pile.dataset.startX}px, ${r.top-pr.top-pile.dataset.startY}px)`;
      },onDrop:()=>{
        if(overlaps(pile,caddy,20)){
          const cr=caddy.getBoundingClientRect(),sr=sheet.getBoundingClientRect();
          sheet.style.transition='transform .45s ease, opacity .45s ease';
          sheet.style.transform=`translate(${cr.left+cr.width*.25-sr.left}px, ${cr.top+cr.height*.32-sr.top}px) scale(.25)`;sheet.style.opacity='0';pile.remove();spark(cr.left+cr.width/2,cr.top+cr.height/2);
          setTimeout(()=>{sheet.remove();step=9;setDots(step,total);instruction.innerHTML='<span class="instruction-icon">✅</span> Dirty sheet removed';setTimeout(()=>completeTask('bed'),650)},500);
        }else{pile.style.left='39.5%';pile.style.top='37%';sheet.style.transform='none'}
      }});
      requestAnimationFrame(()=>{const pr=canvas.getBoundingClientRect(),r=pile.getBoundingClientRect();pile.dataset.startX=(r.left-pr.left);pile.dataset.startY=(r.top-pr.top)});
    }
  }


  function floorScene(){
    title.textContent='HOOVER THE FLOOR';
    setDots(1,1);

    // All floor artwork uses the same 1448 x 1086 coordinates.
    // This avoids cropping the bed, stretching the carpet and moving dirt onto furniture.
    const IMAGE_W=1448, IMAGE_H=1086;
    const TARGET_COVERAGE=85;
    const GRID_START=14, GRID_STEP=28, GRID_COLS=52, GRID_ROWS=39;
    const GRID_BITS='AAHAADgAAAAoAAEIAAALAAAJAAAHsAAA34AAIAAAAPgAAwAAAA/AAfgAAAH8AD/wAAH/wAP/AAAf/AA/8AAB/+AD/wAAD/4Af/AAAP/gB/8AAA/+AH/wAAD/8Af/AAAP/wD/4AAA//AP/gAAD/8A/+AAAP/4D/4AAAf/gf/gAAB/+B/+AAAH/4H/8AAA//wf/wAAD//D//AAAP/8P///////w////////n///////+f///////5////////n//////////////////////////////////////////////////////////////////////////////////////A=';
    const decoded=atob(GRID_BITS);
    const carpetCells=[];
    for(let row=0;row<GRID_ROWS;row++){
      for(let col=0;col<GRID_COLS;col++){
        const i=row*GRID_COLS+col;
        const carpet=(decoded.charCodeAt(i>>3)>>(7-(i&7)))&1;
        if(carpet) carpetCells.push({x:GRID_START+col*GRID_STEP,y:GRID_START+row*GRID_STEP,done:false});
      }
    }

    const stage=document.createElement('div');
    stage.className='floor-stage';
    body.appendChild(stage);
    const floor=document.createElement('div');
    floor.className='floor-artboard';
    stage.appendChild(floor);

    const photo=document.createElement('img');
    photo.className='floor-artboard-image';
    photo.src='assets/scenes/floor-topdown.png';
    photo.alt='Hotel room viewed from above';
    photo.draggable=false;
    floor.appendChild(photo);

    const dust=document.createElement('canvas');
    dust.className='floor-dust-canvas';
    dust.width=IMAGE_W;
    dust.height=IMAGE_H;
    floor.appendChild(dust);
    const ctx=dust.getContext('2d');
    let ready=false;
    let cleaned=0;
    let finished=false;
    let lastPoint=null;
    const patches=[];

    const counter=document.createElement('div');
    counter.className='counter floor-counter';
    body.appendChild(counter);
    const instruction=card('<span class="instruction-icon">🧹</span> Move the hoover across the carpet to reveal the clean floor');

    // Use three safe carpet zones so every session looks different without
    // putting dirt on the bed or furniture: left, foot of bed, and right.
    const dirtZones=[
      [ // Left carpet
        {x:0.18,y:0.43}, {x:0.20,y:0.51},
        {x:0.18,y:0.59}, {x:0.21,y:0.67}
      ],
      [ // Carpet below the foot of the bed
        {x:0.38,y:0.82}, {x:0.48,y:0.87},
        {x:0.59,y:0.81}, {x:0.67,y:0.87}
      ],
      [ // Right carpet
        {x:0.80,y:0.43}, {x:0.81,y:0.51},
        {x:0.79,y:0.60}, {x:0.82,y:0.67}
      ]
    ];
    const dirtFiles=[
      'assets/floor/dirt-1.png',
      'assets/floor/dirt-2.png',
      'assets/floor/dirt-3.png'
    ];
    // Shuffle which dirt image appears in each zone as well as its position.
    for(let i=dirtFiles.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [dirtFiles[i],dirtFiles[j]]=[dirtFiles[j],dirtFiles[i]];
    }
    const patchDefs=dirtZones.map((options,i)=>{
      const chosen=options[Math.floor(Math.random()*options.length)];
      const offsetX=(Math.random()-.5)*.018;
      const offsetY=(Math.random()-.5)*.018;
      return {src:dirtFiles[i],x:chosen.x+offsetX,y:chosen.y+offsetY};
    });
    for(const p of patchDefs){
      const img=document.createElement('img');
      img.className='floor-dirt-image';
      img.src=p.src;
      img.draggable=false;
      img.alt='Dirt on the carpet';
      img.style.left=(p.x*100)+'%';
      img.style.top=(p.y*100)+'%';
      floor.appendChild(img);
      patches.push({element:img,x:p.x*IMAGE_W,y:p.y*IMAGE_H,cleaned:false});
    }

    const vac=document.createElement('img');
    vac.className='floor-hoover-head';
    vac.src='assets/floor/hoover-head.png';
    vac.alt='Drag the hoover over the carpet';
    vac.title='Drag to hoover';
    vac.draggable=false;
    vac.style.left='12%';
    vac.style.top='65%';
    floor.appendChild(vac);

    function carpetAt(x,y){
      const col=Math.round((x-GRID_START)/GRID_STEP);
      const row=Math.round((y-GRID_START)/GRID_STEP);
      if(col<0||col>=GRID_COLS||row<0||row>=GRID_ROWS) return false;
      const i=row*GRID_COLS+col;
      return !!((decoded.charCodeAt(i>>3)>>(7-(i&7)))&1);
    }

    function updateCounter(){
      const pct=Math.min(100,Math.round(100*cleaned/carpetCells.length));
      const dirtLeft=patches.filter(p=>!p.cleaned).length;
      counter.innerHTML='<span>CARPET '+pct+'%</span><div class="floor-meter"><span style="width:'+pct+'%"></span></div><small>DIRT PATCHES '+dirtLeft+'</small>';
      if(!finished && dirtLeft===0 && pct>=TARGET_COVERAGE){
        finished=true;
        instruction.innerHTML='<span class="instruction-icon">✅</span> All clean!';
        setTimeout(()=>{if(scene.classList.contains('active')&&floor.isConnected) completeTask('floor')},550);
      }
    }

    function passOver(x,y){
      if(!ready || !carpetAt(x,y)) return;
      // The cleaning head erases just the dust tint, leaving the real carpet intact.
      const radius=78;
      ctx.save();
      ctx.globalCompositeOperation='destination-out';
      const grad=ctx.createRadialGradient(x,y,radius*.55,x,y,radius);
      grad.addColorStop(0,'rgba(0,0,0,1)');
      grad.addColorStop(0.78,'rgba(0,0,0,0.92)');
      grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grad;
      ctx.beginPath();
      ctx.arc(x,y,radius,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
      const r2=(radius*.88)**2;
      for(const cell of carpetCells){
        if(cell.done) continue;
        const dx=cell.x-x,dy=cell.y-y;
        if(dx*dx+dy*dy<r2){cell.done=true;cleaned++;}
      }
      for(const patch of patches){
        if(patch.cleaned) continue;
        const dx=patch.x-x,dy=patch.y-y;
        if(dx*dx+dy*dy<105**2){
          patch.cleaned=true;
          patch.element.classList.add('floor-dirt-cleaned');
        }
      }
    }

    function cleanTo(x,y){
      if(!ready)return;
      const was=cleaned;
      if(lastPoint){
        const length=Math.hypot(x-lastPoint.x,y-lastPoint.y);
        const count=Math.max(1,Math.ceil(length/22));
        for(let i=1;i<=count;i++){
          const t=i/count;
          passOver(lastPoint.x+(x-lastPoint.x)*t,lastPoint.y+(y-lastPoint.y)*t);
        }
      }else passOver(x,y);
      lastPoint={x,y};
      if(was!==cleaned || patches.some(p=>p.cleaned)) updateCounter();
    }

    function hooverMoved(){
      if(!ready)return;
      const canvasRect=floor.getBoundingClientRect();
      const toolRect=vac.getBoundingClientRect();
      // The intake is near the bottom edge of this transparent Henry-style head.
      const screenX=toolRect.left+toolRect.width*.5;
      const screenY=toolRect.top+toolRect.height*.82;
      const x=(screenX-canvasRect.left)*IMAGE_W/canvasRect.width;
      const y=(screenY-canvasRect.top)*IMAGE_H/canvasRect.height;
      cleanTo(x,y);
    }

    const image=new Image();
    image.onload=()=>{
      // No getImageData(): that method fails for file:// images in Chrome.
      ctx.clearRect(0,0,IMAGE_W,IMAGE_H);
      ctx.drawImage(image,0,0,IMAGE_W,IMAGE_H);
      ready=true;
      updateCounter();
    };
    image.onerror=()=>{
      counter.textContent='Missing assets/floor/carpet-dust-overlay.png';
    };
    image.src='assets/floor/carpet-dust-overlay.png';

    makeDraggable(vac,{
      onMove:()=>hooverMoved(),
      onDrop:()=>{lastPoint=null;updateCounter()}
    });
    updateCounter();
  }

  function deskScene(){
    // Desk activity is independent of bed, hoover and laundry; all positioning
    // uses percentages of the fixed 1448x1086 empty-desk artwork.
    title.textContent='🗂️';
    title.setAttribute('aria-label','Tidy the desk');
    setDots(0,5);

    const stage=document.createElement('div');
    stage.className='desk-tidy-stage';
    body.appendChild(stage);

    const board=document.createElement('div');
    board.className='desk-tidy-board';
    stage.appendChild(board);

    const bg=document.createElement('img');
    bg.className='desk-tidy-background';
    bg.src='assets/desk/desk-empty.png';
    bg.alt='Empty wooden hotel desk';
    bg.draggable=false;
    board.appendChild(bg);

    const shelf=document.createElement('div');
    shelf.className='desk-items-shelf';
    shelf.setAttribute('aria-label','Items to put back on the desk');
    board.appendChild(shelf);

    const eye=document.createElement('button');
    eye.type='button';
    eye.className='desk-reference-thumb';
    eye.setAttribute('aria-label','Show the finished desk');
    eye.title='View completed desk';
    eye.innerHTML='<img src="assets/desk/desk-complete.png" alt=""><span aria-hidden="true"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3.2"/></svg></span>';
    board.appendChild(eye);

    const modal=document.createElement('div');
    modal.className='desk-reference-modal';
    modal.hidden=true;
    modal.innerHTML='<button type="button" aria-label="Close reference image" class="desk-reference-close">×</button><img src="assets/desk/desk-complete.png" alt="Finished desk reference showing the five items">';
    board.appendChild(modal);
    const closeReference=()=>{modal.hidden=true;eye.setAttribute('aria-expanded','false')};
    on(eye,'click',()=>{modal.hidden=false;eye.setAttribute('aria-expanded','true')});
    on(modal.querySelector('button'),'click',closeReference);
    on(modal,'click',e=>{if(e.target===modal)closeReference()});
    on(window,'keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeReference()});

    // Each item contains target position, final size and a separate tray position.
    // All coordinates are percentages of the same fixed-aspect-ratio desk board.
    const items=[
      {id:'kettle',name:'Kettle',img:'desk-item-kettle.png',ghost:'ghost-kettle.png',x:18.4,y:31.2,w:12.3,h:18.0,tw:11.2,th:13.6},
      {id:'mug',name:'Mug',img:'desk-item-mug.png',ghost:'ghost-mug.png',x:14.2,y:41.5,w:9.0,h:12.6,tw:9.3,th:13.3},
      {id:'tray',name:'Tea and coffee tray',img:'desk-item-tea-tray.png',ghost:'ghost-tea-tray.png',x:35.2,y:36.7,w:22.1,h:12.2,tw:19.2,th:10.5},
      {id:'phone',name:'Telephone',img:'desk-item-phone.png',ghost:'ghost-phone.png',x:58.8,y:36.2,w:14.4,h:16.0,tw:12.5,th:13.1},
      {id:'gel',name:'Shower gel',img:'desk-item-shower-gel.png',ghost:'ghost-shower-gel.png',x:77.2,y:36.9,w:10.6,h:12.1,tw:11.7,th:12.8}
    ];

    const traySlots=[
      {tx:10.5,ty:83.0},
      {tx:29.0,ty:83.1},
      {tx:46.8,ty:85.1},
      {tx:66.4,ty:83.2},
      {tx:85.4,ty:83.5}
    ];

    function shuffled(arr){
      const copy=[...arr];
      for(let i=copy.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [copy[i],copy[j]]=[copy[j],copy[i]];
      }
      return copy;
    }

    const startSlots=shuffled(traySlots);
    items.forEach((item,index)=>Object.assign(item,startSlots[index]));

    // The targets are over the wood, never the wall or floor. They are
    // individually hidden as the matching physical object is placed.
    const targetMap=new Map();
    const moveMap=new Map();
    let placed=0;
    let completed=false;

    function applyRect(el,x,y,w,h){
      el.style.left=x+'%';
      el.style.top=y+'%';
      el.style.width=w+'%';
      el.style.height=h+'%';
    }

    items.forEach(item=>{
      const target=document.createElement('div');
      target.className='desk-ghost-target';
      target.dataset.item=item.id;
      target.setAttribute('aria-hidden','true');
      applyRect(target,item.x,item.y,item.w,item.h);
      const glow=document.createElement('div');
      glow.className='desk-ghost-glow';
      const ghost=document.createElement('img');
      ghost.src='assets/desk/'+item.ghost;
      ghost.alt='';
      ghost.draggable=false;
      target.append(glow,ghost);
      board.appendChild(target);
      targetMap.set(item.id,target);

      const element=document.createElement('img');
      element.className='desk-move-item';
      element.src='assets/desk/'+item.img;
      element.alt=item.name;
      element.draggable=false;
      element.tabIndex=0;
      element.setAttribute('role','button');
      element.setAttribute('aria-label','Put '+item.name.toLowerCase()+' back in position');
      applyRect(element,item.tx,item.ty,item.tw,item.th);
      board.appendChild(element);
      moveMap.set(item.id,element);
      let active=false,dx=0,dy=0;
      let startX=0,startY=0;
      let pointerId=null;

      function finishItem(){
        if(element.classList.contains('desk-item-set')||completed)return;
        active=false;
        element.classList.remove('desk-moving');
        element.classList.add('desk-item-set');
        element.style.transition='left .23s ease,top .23s ease,width .23s ease,height .23s ease,filter .23s ease';
        applyRect(element,item.x,item.y,item.w,item.h);
        target.classList.add('desk-target-completed');
        element.removeAttribute('role');
        element.tabIndex=-1;
        placed++;
        setDots(placed,5);
        const br=board.getBoundingClientRect();
        spark(br.left+br.width*(item.x+item.w/2)/100,br.top+br.height*(item.y+item.h/2)/100);
        if(placed===items.length){
          completed=true;
          setTimeout(()=>{if(!board.isConnected)return;modal.hidden=false;modal.classList.add('desk-completed-reference');},490);
          setTimeout(()=>{if(!board.isConnected)return;modal.hidden=true;completeTask('desk')},1750);
        }
      }

      const down=e=>{
        if(completed||element.classList.contains('desk-item-set')||!modal.hidden)return;
        const r=element.getBoundingClientRect();
        active=true;pointerId=e.pointerId;
        dx=e.clientX-r.left;dy=e.clientY-r.top;
        startX=e.clientX;startY=e.clientY;
        element.classList.add('desk-moving');
        element.setPointerCapture?.(e.pointerId);
        e.preventDefault();
      };
      const move=e=>{
        if(!active||e.pointerId!==pointerId)return;
        const r=board.getBoundingClientRect();
        const w=element.getBoundingClientRect().width;
        const h=element.getBoundingClientRect().height;
        const left=Math.max(-w*.35,Math.min(r.width-w*.65,e.clientX-r.left-dx));
        const top=Math.max(r.height*.22,Math.min(r.height-h*.8,e.clientY-r.top-dy));
        element.style.left=(left/r.width*100)+'%';
        element.style.top=(top/r.height*100)+'%';
        const tr=target.getBoundingClientRect();
        const er=element.getBoundingClientRect();
        const tx=tr.left+tr.width/2,ty=tr.top+tr.height/2;
        const ex=er.left+er.width/2,ey=er.top+er.height/2;
        target.classList.toggle('desk-target-near',Math.hypot(tx-ex,ty-ey)<Math.max(65,tr.width*.65));
        e.preventDefault();
      };
      const up=e=>{
        if(!active||e.pointerId!==pointerId)return;
        active=false;pointerId=null;
        element.classList.remove('desk-moving');
        target.classList.remove('desk-target-near');
        const tr=target.getBoundingClientRect();
        const er=element.getBoundingClientRect();
        const tx=tr.left+tr.width/2,ty=tr.top+tr.height/2;
        const ex=er.left+er.width/2,ey=er.top+er.height/2;
        // Generous drop tolerance for touch and learners who find precision hard.
        const near=Math.abs(tx-ex)<Math.max(74,tr.width*.85) && Math.abs(ty-ey)<Math.max(70,tr.height*.85);
        if(near) finishItem();
        else{
          element.style.transition='left .25s ease,top .25s ease';
          applyRect(element,item.tx,item.ty,item.tw,item.th);
          setTimeout(()=>{if(!element.classList.contains('desk-item-set'))element.style.transition=''},265);
        }
        e.preventDefault();
      };
      on(element,'pointerdown',down);
      on(element,'pointermove',move);
      on(element,'pointerup',up);
      on(element,'pointercancel',up);
      on(element,'keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();finishItem()}
      });
    });
  }


  function laundryScene(){
    title.textContent='🧺';
    title.setAttribute('aria-label','Sort items into the housekeeping caddy');
    const TOTAL=10;
    const W=1448, H=1086;
    setDots(0,TOTAL);

    const stage=document.createElement('div');stage.className='laundry-stage';body.appendChild(stage);
    const board=document.createElement('div');board.className='laundry-board';stage.appendChild(board);
    const layer=document.createElement('div');layer.className='laundry-scene-layer';board.appendChild(layer);

    const bg=document.createElement('img');bg.className='laundry-bg';
    bg.src='assets/laundry/scene/cart-setup.png';bg.alt='Housekeeping caddy';
    bg.draggable=false;layer.appendChild(bg);

    // One master overlay, same 1448 x 1086 coordinate system as the background.
    const overlay=document.createElement('img');overlay.className='laundry-overlay';
    overlay.src='assets/laundry/scene/cart-overlay.png';overlay.alt='';
    overlay.draggable=false;layer.appendChild(overlay);

    // The exact pixel rectangles used when drawing the master overlay.
    const zones=[
      {key:'clean',box:[401,141,786,286]},
      {key:'rubbish',box:[293,291,496,620]},
      {key:'cleaning',box:[525,295,817,493]},
      {key:'lost',box:[529,516,809,642]},
      {key:'usedLinen',box:[818,251,1130,654]}
    ];
    const zoneEls=new Map();
    for(const zone of zones){
      const [x1,y1,x2,y2]=zone.box;
      const target=document.createElement('div');target.className='laundry-target';
      target.dataset.zone=zone.key;
      target.style.left=(x1/W*100)+'%';target.style.top=(y1/H*100)+'%';
      target.style.width=((x2-x1)/W*100)+'%';target.style.height=((y2-y1)/H*100)+'%';
      layer.appendChild(target);zoneEls.set(zone.key,target);
    }

    const feedback=document.createElement('div');feedback.className='laundry-feedback';board.appendChild(feedback);

    const items=[
      {id:'dirty-sheet',zone:'usedLinen',shape:'linen'},
      {id:'used-pillowcase',zone:'usedLinen',shape:'linen'},
      {id:'used-duvet-cover',zone:'usedLinen',shape:'linen'},
      {id:'car-keys',zone:'lost',shape:'small'},
      {id:'credit-card',zone:'lost',shape:'flat'},
      {id:'necklace',zone:'lost',shape:'small'},
      {id:'wristwatch',zone:'lost',shape:'small'},
      {id:'mobile-phone',zone:'lost',shape:'phone'},
      {id:'spray-cleaning-bottle',zone:'cleaning',shape:'bottle'},
      {id:'microfibre-cloth',zone:'cleaning',shape:'flat'},
      {id:'air-freshener-spray',zone:'cleaning',shape:'bottle'},
      {id:'clean-folded-towel',zone:'clean',shape:'towel'},
      {id:'crisp-packet',zone:'rubbish',shape:'small'},
      {id:'empty-sandwich-container',zone:'rubbish',shape:'flat'},
      {id:'empty-pizza-box',zone:'rubbish',shape:'flat'}
    ];
    const sizes={
      linen:[24,19],small:[17,16],flat:[21,17],phone:[15,18],
      bottle:[17,20],towel:[22,17]
    };

    for(let i=items.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [items[i],items[j]]=[items[j],items[i]];
    }
    const chosen=items.slice(0,TOTAL);
    let index=0,finished=false;

    function clearHighlights(){zoneEls.forEach(z=>z.classList.remove('laundry-near'))}
    function rect(el,left,top,width,height){
      el.style.left=left+'%';el.style.top=top+'%';
      el.style.width=width+'%';el.style.height=height+'%';
    }
    // The pointer position takes priority, making dropping easier on iPad.
    function targetFor(e,el){
      const r=el.getBoundingClientRect();
      const candidates=[{x:e.clientX,y:e.clientY},{x:r.left+r.width/2,y:r.top+r.height/2}];
      let best=null,bestScore=Infinity;
      for(const zone of zones){
        const z=zoneEls.get(zone.key).getBoundingClientRect();
        for(let ci=0;ci<candidates.length;ci++){
          const point=candidates[ci];
          const dx=Math.max(z.left-point.x,0,point.x-z.right);
          const dy=Math.max(z.top-point.y,0,point.y-z.bottom);
          const score=Math.hypot(dx/Math.max(35,z.width*.20),dy/Math.max(35,z.height*.20))+ci*.08;
          if(score<bestScore){bestScore=score;best=zone;}
        }
      }
      return bestScore<=1.08?best:null;
    }
    function badge(kind,x,y){
      const im=document.createElement('span');
      im.className='laundry-feedback-icon '+kind;
      im.textContent=kind==='good'?'✓':'×';
      im.setAttribute('aria-hidden','true');
      im.style.left=x+'px';im.style.top=y+'px';feedback.appendChild(im);
      setTimeout(()=>im.remove(),650);
    }
    function spawn(){
      if(finished || index>=chosen.length)return;
      clearHighlights();
      const item=chosen[index];
      const [width,height]=sizes[item.shape];
      const home={x:(100-width)/2,y:99-height-2,width,height};
      const el=document.createElement('img');el.className='laundry-current-item';
      el.src='assets/laundry/items/'+item.id+'.png';
      el.alt='';el.draggable=false;el.tabIndex=0;
      el.setAttribute('aria-label','Sort this item');
      rect(el,home.x,home.y,home.width,home.height);board.appendChild(el);
      let active=false,pid=null,dx=0,dy=0;
      function reset(){
        clearHighlights();el.classList.remove('laundry-moving');
        el.style.transition='left .25s ease,top .25s ease';
        rect(el,home.x,home.y,home.width,home.height);
        const br=board.getBoundingClientRect();
        badge('bad',br.width*.50,br.height*.86);
        setTimeout(()=>{if(el.isConnected)el.style.transition=''},270);
      }
      function accepted(zone){
        active=false;el.classList.remove('laundry-moving');
        clearHighlights();
        const zr=zoneEls.get(zone.key).getBoundingClientRect();
        const br=board.getBoundingClientRect();
        const cx=zr.left+zr.width/2-br.left;
        const cy=zr.top+zr.height/2-br.top;
        const er=el.getBoundingClientRect();
        badge('good',cx,cy);
        zoneEls.get(zone.key).classList.add('laundry-correct');
        setTimeout(()=>zoneEls.get(zone.key)?.classList.remove('laundry-correct'),420);
        el.style.transition='left .23s ease,top .23s ease,transform .23s ease,opacity .23s ease';
        el.style.left=((cx-er.width/2)/br.width*100)+'%';
        el.style.top=((cy-er.height/2)/br.height*100)+'%';
        el.style.transform='scale(.3)';el.style.opacity='0';el.style.pointerEvents='none';
        index++;setDots(index,TOTAL);
        setTimeout(()=>{
          el.remove();
          if(index===TOTAL){
            finished=true;
            // Use the game's standard completion tick, not the ornate badge artwork.
            setTimeout(()=>{if(board.isConnected)completeTask('laundry');},320);
          } else spawn();
        },290);
      }
      function down(e){
        if(finished||active)return;
        active=true;pid=e.pointerId;
        const br=el.getBoundingClientRect();
        dx=e.clientX-br.left;dy=e.clientY-br.top;
        el.style.transition='none';el.classList.add('laundry-moving');
        try{el.setPointerCapture(pid)}catch(_){}
        e.preventDefault();
      }
      function move(e){
        if(!active||e.pointerId!==pid)return;
        const br=board.getBoundingClientRect();
        const er=el.getBoundingClientRect();
        const left=Math.max(-er.width*.25,Math.min(br.width-er.width*.75,e.clientX-br.left-dx));
        const top=Math.max(-er.height*.25,Math.min(br.height-er.height*.65,e.clientY-br.top-dy));
        el.style.left=(left/br.width*100)+'%';el.style.top=(top/br.height*100)+'%';
        clearHighlights();
        const zone=targetFor(e,el);
        if(zone)zoneEls.get(zone.key).classList.add('laundry-near');
        e.preventDefault();
      }
      function up(e){
        if(!active||e.pointerId!==pid)return;
        active=false;pid=null;
        try{if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId)}catch(_){}
        const zone=targetFor(e,el);
        if(zone && zone.key===item.zone)accepted(zone);
        else reset();
        e.preventDefault();
      }
      on(el,'pointerdown',down);
      on(el,'pointermove',move);
      on(el,'pointerup',up);
      on(el,'pointercancel',up);
      on(el,'keydown',e=>{
        if(e.key==='Escape'){e.preventDefault();reset()}
      });
    }
    spawn();
  }

  updateHub();
})();
