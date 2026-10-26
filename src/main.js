import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { config } from './config.js';

const canvas=document.querySelector('#canvas'), scene=new THREE.Scene();
scene.background=null;
const camera=new THREE.PerspectiveCamera(42,1,.01,10000);camera.position.set(5,4.1,7);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
scene.add(new THREE.HemisphereLight(0xc9d8ff,0x252c36,2.1));
const key=new THREE.DirectionalLight(0xfff4df,3.1);key.position.set(4,7,5);scene.add(key);
const fill=new THREE.DirectionalLight(0x829dff,1.6);fill.position.set(-5,3,-3);scene.add(fill);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.06;
const root=new THREE.Group();scene.add(root);const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let selected=null,parts=[],exploded=false,materialsMode=false,toastTimer;
const loading=document.querySelector('#loading');document.querySelector('#project-title').textContent=config.title;
function createDemo(){
  const mat=(color,metalness=.48,roughness=.32)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const add=(name,geometry,material,pos)=>{const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(...pos);root.add(m);return m;};
  add('Base',new THREE.BoxGeometry(3.1,.32,1.9),mat('#8998ad'),[0,.17,0]);
  add('Column',new THREE.BoxGeometry(.48,2.4,.48),mat('#b8f36b',.36,.27),[-.48,1.48,0]);
  add('Arm',new THREE.BoxGeometry(2.2,.32,.38),mat('#8998ff'),[.45,2.75,0]);
  add('Head',new THREE.BoxGeometry(.95,.9,.82),mat('#e99b69'),[1.5,2.22,0]);
  const wheel=add('Wheel',new THREE.CylinderGeometry(.43,.43,.2,48),mat('#54c7b5',.72,.22),[1.5,1.55,.56]);wheel.rotation.x=Math.PI/2;
  for(const x of [-1.2,1.2])for(const z of [-.65,.65])add('Foot',new THREE.CylinderGeometry(.16,.16,.2,24),mat('#444c59'),[x,-.05,z]);
  const floor=new THREE.GridHelper(14,28,0x46505d,0x343d48);floor.position.y=-.18;scene.add(floor);floor.material.transparent=true;floor.material.opacity=.25;
}
function normalizeModel(){const box=new THREE.Box3().setFromObject(root);if(box.isEmpty())return;const size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),max=Math.max(size.x,size.y,size.z)||1;root.position.sub(center);root.scale.setScalar(4/max);const b=new THREE.Box3().setFromObject(root),s=b.getSize(new THREE.Vector3());camera.position.set(s.x*1.25+s.y*.55,s.y*.9+s.z*.55,s.z*1.55+s.y*.35);controls.target.set(0,0,0);controls.update();}
function discoverParts(){const candidates=[];root.traverse(o=>{if(o.isMesh&&o.visible){const n=o.name||'';let def=config.parts.find(p=>p.match.some(k=>n.toLowerCase().includes(k.toLowerCase())));if(!def){def={id:n||`part-${candidates.length+1}`,name:n||`部件 ${candidates.length+1}`,description:'点击模型可选择该部件。',color:'#9aa6b9'};}let item=candidates.find(x=>x.def.id===def.id);if(!item){item={def,objects:[]};candidates.push(item);}item.objects.push(o);}});parts=candidates;renderParts();if(parts.length)selectPart(parts[0],false);}
function renderParts(){const list=document.querySelector('#parts');list.innerHTML='';parts.forEach((p,i)=>{const b=document.createElement('button');b.className='part-item';b.innerHTML=`<span class="part-dot" style="background:${p.def.color}"></span><span>${p.def.name}</span><em>${String(i+1).padStart(2,'0')}</em>`;b.onclick=()=>selectPart(p);p.button=b;list.append(b);});}
function selectPart(p,notify=true){if(!p)return;selected=p;document.querySelectorAll('.part-item').forEach(b=>b.classList.remove('selected'));p.button?.classList.add('selected');document.querySelector('#part-title').textContent=p.def.name;document.querySelector('#part-description').textContent=p.def.description||'点击模型可选择该部件。';document.querySelector('#part-number').textContent=String(parts.indexOf(p)+1).padStart(2,'0');document.querySelector('#part-swatch').style.background=`radial-gradient(circle at 50% 44%,${p.def.color},#272e39 72%)`;if(notify)showToast(`已选择：${p.def.name}`);}
function showToast(s){const t=document.querySelector('#toast');t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1700);}
function act(type){if(type==='explode')setExploded(!exploded);if(type==='materials'){materialsMode=!materialsMode;root.traverse(o=>{if(o.isMesh&&o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if('metalness'in m)m.metalness=materialsMode?.05:.45;if('roughness'in m)m.roughness=materialsMode?.78:.32;});}});showToast(materialsMode?'已切换为哑光材质':'已恢复金属材质');}if(type==='reset'){parts.forEach(p=>p.objects.forEach(o=>o.visible=true));exploded=false;document.querySelector('#explode').classList.remove('active');selectPart(parts[0],false);normalizeModel();showToast('模型显示状态已恢复');}}
function setExploded(on){exploded=on;document.querySelector('#explode').classList.toggle('active',on);const offsets={base:[0,-.25,0],column:[-.5,.1,0],arm:[0,.5,0],head:[.7,.3,0],wheel:[.8,-.25,.3]};parts.forEach(p=>p.objects.forEach(o=>{const key=p.def.id.toLowerCase();const target=on?(offsets[key]||[0,.15+parts.indexOf(p)*.04,0]):[0,0,0];o.position.set(o.userData.homeX??=o.position.x,o.userData.homeY??=o.position.y,o.userData.homeZ??=o.position.z);o.position.x+=target[0];o.position.y+=target[1];o.position.z+=target[2];}));showToast(on?'已展开装配部件':'已恢复装配');}
function frameSelected(){if(!selected)return;const b=new THREE.Box3();selected.objects.forEach(o=>b.expandByObject(o));const c=b.getCenter(new THREE.Vector3()),s=b.getSize(new THREE.Vector3()),d=Math.max(s.x,s.y,s.z)*2.8+.5;controls.target.copy(c);camera.position.set(c.x+d*.9,c.y+d*.65,c.z+d);showToast(`已聚焦：${selected.def.name}`);}
canvas.addEventListener('pointerup',e=>{if(e.button!==0)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(root.children,true);if(!hits.length)return;let o=hits[0].object;while(o.parent&&o.parent!==root)o=o.parent;const p=parts.find(x=>x.objects.includes(o)||x.objects.some(m=>m===hits[0].object));if(p)selectPart(p);});
document.querySelector('#focus-part').onclick=frameSelected;document.querySelector('#toggle-part').onclick=()=>{if(!selected)return;const visible=selected.objects.some(o=>o.visible);selected.objects.forEach(o=>o.visible=!visible);showToast(visible?`${selected.def.name} 已隐藏`:`${selected.def.name} 已显示`);};document.querySelector('#show-all').onclick=()=>parts.forEach(p=>p.objects.forEach(o=>o.visible=true));document.querySelector('#explode').onclick=()=>act('explode');document.querySelector('#reset-view').onclick=()=>{normalizeModel();controls.reset();};
function buildControls(){const list=document.querySelector('#controls');config.actions.forEach(a=>{const b=document.createElement('button');b.className='control-card';b.innerHTML=`<span class="control-icon">${a.icon}</span><span class="control-copy"><strong>${a.label}</strong><small>${a.detail}</small></span><span class="arrow">›</span>`;b.onclick=()=>{act(a.type);b.classList.toggle('active',a.type==='explode'&&exploded);};list.append(b);});}
buildControls();
new GLTFLoader().load(config.modelUrl,gltf=>{root.add(gltf.scene);document.querySelector('#status-text').textContent='Rhino 模型';normalizeModel();discoverParts();loading.classList.add('done');},undefined,()=>{createDemo();normalizeModel();discoverParts();document.querySelector('#status-text').textContent='示例模型';loading.classList.add('done');});
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
