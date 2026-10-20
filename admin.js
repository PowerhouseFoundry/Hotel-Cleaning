(() => {
  const grid=document.getElementById('grid');
  const connect=document.getElementById('connectBtn');
  let rootHandle=null;
  const esc=s=>(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  async function exists(path){return new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>resolve(false);i.src=path+'?v='+Date.now()})}
  async function render(){grid.innerHTML='';for(const a of window.ART_ASSETS){const ok=await exists(a.path);const card=document.createElement('article');card.className='card'+(ok?' ready':'');card.innerHTML=`<div class="preview">${ok?`<img src="${a.path}?v=${Date.now()}" alt="${esc(a.name)}">`:'<strong>NO ARTWORK YET</strong>'}<span class="status">${ok?'READY':'MISSING'}</span></div><div class="content"><h2>${esc(a.name)}</h2><div class="path">${esc(a.path)}</div><p class="purpose">${esc(a.purpose)}</p><div class="prompt">${esc(a.prompt)}</div><div class="actions"><button class="btn copy">Copy prompt</button><button class="btn alt upload">Upload image</button><button class="btn ghost refresh">Refresh</button><input class="file-input" type="file" accept="image/*"></div><div class="note">Expected filename: <b>${esc(a.path.split('/').pop())}</b></div></div>`;
      const input=card.querySelector('.file-input');
      card.querySelector('.copy').onclick=async()=>{await navigator.clipboard.writeText(a.prompt);const b=card.querySelector('.copy');b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy prompt',1300)};
      card.querySelector('.upload').onclick=()=>input.click();
      card.querySelector('.refresh').onclick=()=>render();
      input.onchange=async()=>{if(!input.files[0])return;const file=input.files[0];if(rootHandle){try{await writeFile(a.path,file);alert('Saved directly to '+a.path);render();return}catch(err){console.error(err);alert('Could not write directly. I will download the correctly named file instead.')}}fallbackDownload(a.path,file)};
      grid.appendChild(card)}}

  connect.onclick=async()=>{if(!window.showDirectoryPicker){alert('Direct folder writing is not available in this browser. Upload still works as a correctly named download.');return}try{rootHandle=await window.showDirectoryPicker({mode:'readwrite'});connect.textContent='Project folder connected ✓'}catch(e){if(e.name!=='AbortError')alert('Folder connection failed: '+e.message)}};
  async function writeFile(path,file){const parts=path.split('/');const filename=parts.pop();let dir=rootHandle;for(const p of parts)dir=await dir.getDirectoryHandle(p,{create:true});const fh=await dir.getFileHandle(filename,{create:true});const w=await fh.createWritable();await w.write(file);await w.close()}
  function fallbackDownload(path,file){const filename=path.split('/').pop();const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);alert('Downloaded as '+filename+'. Put it into '+path.substring(0,path.lastIndexOf('/'))+'/')}
  render();
})();
