// Production Yield production dashboard. No source-sheet writes. Deploy as owner, domain access.
// Private deployment wiring lives in Script Properties, never in Git.
const DEPLOYMENT_CONFIG = PropertiesService.getScriptProperties();
const OWNER_EMAIL = String(DEPLOYMENT_CONFIG.getProperty('OWNER_EMAIL') || '').trim().toLowerCase();
const ACCESS_DOMAIN = String(DEPLOYMENT_CONFIG.getProperty('ACCESS_DOMAIN') || '').trim().toLowerCase();
const SOURCES = [
 {label:'Source A',id:DEPLOYMENT_CONFIG.getProperty('SOURCE_A_ID') || ''},
 {label:'Source B',id:DEPLOYMENT_CONFIG.getProperty('SOURCE_B_ID') || ''}
];
function doGet(){
 try{requireAccess_();return HtmlService.createHtmlOutputFromFile('Index').setTitle('Production Yield | Analytics - Operations / Production').addMetaTag('viewport','width=device-width,initial-scale=1');}
 catch(e){return HtmlService.createHtmlOutput('<h2>Access unavailable</h2><p>Use an approved work account or contact the dashboard owner.</p>');}
}
// Role management. Source-sheet reads and fail-closed identity checks are unchanged.
function roleFor_(email){
 if(email===OWNER_EMAIL)return 'admin';
 const p=PropertiesService.getScriptProperties();
 const controllers=JSON.parse(p.getProperty('CONTROLLERS')||'[]');
 if(controllers.includes(email))return 'controller';
 const viewers=JSON.parse(p.getProperty('VIEWERS')||'[]');
 return viewers.includes(email)?'viewer':null;
}
function requireAccess_(){
 if(!OWNER_EMAIL||!ACCESS_DOMAIN)throw new Error('Owner configuration is incomplete.');
 const email=String(Session.getActiveUser().getEmail()||'').trim().toLowerCase();
 if(!email||!roleFor_(email))throw new Error('Access is not enabled for this account.');
 return email;
}
function dashboardSettings_(){
 const s=JSON.parse(PropertiesService.getScriptProperties().getProperty('DASHBOARD_SETTINGS')||'{}');
 return {source:['All','Source A','Source B'].includes(s.source)?s.source:'All',view:['day','month'].includes(s.view)?s.view:'day'};
}
function getViewerInfo(){const email=requireAccess_();const role=roleFor_(email);return {admin:role==='admin',role:role,email:email,settings:dashboardSettings_()};}
function getAccessList(){
 const role=roleFor_(requireAccess_());if(role==='viewer')throw new Error('Controller or admin only');
 const p=PropertiesService.getScriptProperties();
 return {viewers:JSON.parse(p.getProperty('VIEWERS')||'[]').sort(),controllers:role==='admin'?JSON.parse(p.getProperty('CONTROLLERS')||'[]').sort():[],settings:dashboardSettings_()};
}
function changeAccess(action,email,targetRole){
 const actor=requireAccess_(),role=roleFor_(actor);
 if(role==='viewer')throw new Error('Controller or admin only');
 if(!['viewer','controller'].includes(targetRole))throw new Error('Invalid role');
 if(targetRole==='controller'&&role!=='admin')throw new Error('Admin only');
 email=String(email||'').trim().toLowerCase();
 if((!ACCESS_DOMAIN||!/^[^\s@]+@[^\s@]+$/.test(email)||email.split('@')[1]!==ACCESS_DOMAIN)||email===OWNER_EMAIL)throw new Error('Use another valid work email. The admin cannot be changed here.');
 if(!['add','remove'].includes(action))throw new Error('Invalid action');
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  const p=PropertiesService.getScriptProperties();
  let viewers=JSON.parse(p.getProperty('VIEWERS')||'[]'),controllers=JSON.parse(p.getProperty('CONTROLLERS')||'[]');
  if(role!=='admin'&&controllers.includes(email))throw new Error('Only admin can change a controller');
  let list=targetRole==='controller'?controllers:viewers;
  if(action==='add'){
   if(targetRole==='viewer'&&controllers.includes(email))throw new Error('Remove the controller role first');
   if(!list.includes(email))list.push(email);
   if(targetRole==='controller')viewers=viewers.filter(x=>x!==email);
  }else{list=list.filter(x=>x!==email);}
  if(targetRole==='controller')controllers=list;else viewers=list;
  p.setProperty('VIEWERS',JSON.stringify(viewers));p.setProperty('CONTROLLERS',JSON.stringify(controllers));
  return getAccessList();
 }finally{lock.releaseLock();}
}
function saveDashboardSettings(settings){
 const role=roleFor_(requireAccess_());if(role==='viewer')throw new Error('Controller or admin only');
 if(!settings||!['All','Source A','Source B'].includes(settings.source)||!['day','month'].includes(settings.view))throw new Error('Invalid settings');
 const clean={source:settings.source,view:settings.view};
 PropertiesService.getScriptProperties().setProperty('DASHBOARD_SETTINGS',JSON.stringify(clean));return clean;
}
// Compatibility with previously opened dashboard versions.
function manageViewers(action,email){
 if(action==='list')return getAccessList().viewers;
 return changeAccess(action,email,'viewer').viewers;
}

(function(root){
  function dateISO(v){
    if(typeof v==='number' && isFinite(v)) return new Date(Date.UTC(1899,11,30)+Math.round(v)*86400000).toISOString().slice(0,10);
    if(v instanceof Date && !isNaN(v)) return v.toISOString().slice(0,10);
    let s=String(v??'').trim(); if(!s)return null;
    if(/^\d{4}-\d\d-\d\d/.test(s))s=s.slice(0,10);
    else {let m=s.match(/^(\d{1,2})[-/ ]([A-Za-z]+|\d{1,2})[-/ ](\d{2}|\d{4})$/);if(!m)return null;
      let months=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
      let mo=/^\d+$/.test(m[2])?+m[2]:months.indexOf(m[2].slice(0,3).toLowerCase())+1;
      s=(m[3].length===2?'20'+m[3]:m[3])+'-'+String(mo).padStart(2,'0')+'-'+m[1].padStart(2,'0');
    }
    let d=new Date(s+'T00:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s?s:null;
  }
  function num(x){if(x===null||x===undefined||String(x).trim()==='')return null;let n=Number(String(x).replace(/,/g,''));return Number.isFinite(n)?n:null;}
  function normalize(tabs){let rows=[],issues=[];
    for(let t of tabs){let grid=t.values;if(!grid||!grid.length)continue;let h=grid[0].map(x=>String(x??'').trim().toLowerCase().replace(/[^a-z0-9]/g,''));
      let ix=(names)=>h.findIndex(x=>names.includes(x));let map={date:ix(['date']),category:ix(['category']),sku:ix(['sku']),product:ix(['productname']),make:ix(['makeqty']),receive:ix(['receiveqty'])};
      if(map.date<0&&String(grid[0][0]??'').trim()==='')map.date=0;
      if(map.product<0&&t.site==='Source B'&&map.date===0&&map.category===1&&map.sku===2&&map.make===4&&map.receive===5){map.product=3;issues.push(t.site+' / '+t.tab+': product heading changed; verified column layout used');}
      if(Object.values(map).some(x=>x<0))throw new Error('Unrecognized columns in '+t.site+' / '+t.tab);
      grid.slice(1).forEach((r,k)=>{if(!r.some(x=>String(x??'').trim()))return;let sku=String(r[map.sku]??'').trim();if(!sku||sku.toLowerCase()==='sku')return;
        let date=dateISO(r[map.date]);if(!date){issues.push(t.site+' / '+t.tab+' row '+(k+2)+': invalid date');return;}
        let make=num(r[map.make]),receive=num(r[map.receive]);
        let flags=[];if(make===null||receive===null)flags.push('Incomplete quantities');if(make===0)flags.push('Zero make quantity');if(make<0||receive<0)flags.push('Negative quantity');if(receive!==null&&make!==null&&receive>make)flags.push('Receive above make');
        rows.push({date,site:t.site,category:String(r[map.category]??'').trim(),sku,product:String(r[map.product]??'').trim(),make,receive,yield:make>0&&receive!==null&&receive>=0?receive/make:null,flags,tab:t.tab,row:k+2});
      });
    }return {rows,issues};
  }
  function filter(rows,f){let q=(f.search||'').toLowerCase().trim();return rows.filter(r=>(!f.site||f.site==='All'||r.site===f.site)&&(!f.from||r.date>=f.from)&&(!f.to||r.date<=f.to)&&(!f.month||f.month==='All'||r.date.slice(0,7)===f.month)&&(!f.category||f.category==='All'||r.category===f.category)&&(!q||[r.date,r.site,r.category,r.sku,r.product].join(' ').toLowerCase().includes(q)));}
  function summary(rows){let valid=rows.filter(r=>r.yield!==null),den=valid.reduce((s,r)=>s+r.make,0),rec=valid.reduce((s,r)=>s+r.receive,0);return {make:rows.reduce((s,r)=>s+(r.make??0),0),receive:rows.reduce((s,r)=>s+(r.receive??0),0),yield:den?rec/den:null,records:rows.length,incomplete:rows.filter(r=>r.make===null||r.receive===null).length,flagged:rows.filter(r=>r.flags.length).length,validRows:valid.length};}
  function group(rows,mode){let g={};for(let r of rows){let k=mode==='month'?r.date.slice(0,7):r.date;(g[k]||(g[k]=[])).push(r);}return Object.keys(g).sort().map(k=>({period:k,...summary(g[k])}));}
  const api={dateISO,num,normalize,filter,summary,group};root.YieldCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

// Durable dashboard snapshots. All source spreadsheets remain read-only.
const SNAPSHOT_INTERVAL_MS = 12 * 60 * 60 * 1000;
function requireAdmin_(){const email=requireAccess_();if(roleFor_(email)!=='admin')throw new Error('Admin only');return email;}
// Run once in the editor as the owner to grant the added trigger permission.
function authorizeSnapshotSetup(){requireAdmin_();ScriptApp.getProjectTriggers();return 'Authorized. Deploy the new version, then finish Snapshot setup in the Admin panel.';}
function snapshotStore_(){
 const id=PropertiesService.getScriptProperties().getProperty('SNAPSHOT_STORE_ID');
 if(!id||SOURCES.some(s=>s.id===id))throw new Error('Snapshot storage is not configured. Ask the admin to finish setup.');
 return SpreadsheetApp.openById(id);
}
function prepareSnapshotStorage(){
 requireAdmin_();const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const p=PropertiesService.getScriptProperties();let id=p.getProperty('SNAPSHOT_STORE_ID');
  if(!id){const ss=SpreadsheetApp.create('Production Yield - Private dashboard snapshots');id=ss.getId();p.setProperty('SNAPSHOT_STORE_ID',id);}
  return {url:snapshotStore_().getUrl(),confirmed:p.getProperty('SNAPSHOT_PRIVATE_CONFIRMED')==='yes'};
 }finally{lock.releaseLock();}
}
function enableSnapshotUpdates(privacyConfirmed){
 requireAdmin_();if(privacyConfirmed!==true)throw new Error('Check that snapshot storage is Restricted with only your account before enabling.');
 const store=snapshotStore_();
 if(store.getOwner().getEmail().toLowerCase()!==OWNER_EMAIL)throw new Error('Snapshot storage must be owned by the dashboard admin.');
 const p=PropertiesService.getScriptProperties(),lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  p.setProperty('SNAPSHOT_PRIVATE_CONFIRMED','yes');
  let matches=ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='scheduledSnapshotRefresh_');
  const trigger=matches.shift()||ScriptApp.newTrigger('scheduledSnapshotRefresh_').timeBased().everyHours(12).create();
  p.setProperty('SNAPSHOT_TRIGGER_ID',trigger.getUniqueId());
  matches.forEach(t=>ScriptApp.deleteTrigger(t));
 }finally{lock.releaseLock();}
 refreshSnapshot_();return getProductionData();
}
function scheduledSnapshotRefresh_(e){
 const expected=PropertiesService.getScriptProperties().getProperty('SNAPSHOT_TRIGGER_ID');
 if(!e||!expected||String(e.triggerUid)!==String(expected))throw new Error('Unrecognized snapshot trigger');
 refreshSnapshot_();
}
function snapshotState_(){
 const p=PropertiesService.getScriptProperties(),m=JSON.parse(p.getProperty('SNAPSHOT_ACTIVE')||'null'),health=JSON.parse(p.getProperty('SNAPSHOT_HEALTH')||'{}');
 return {version:m?m.sheet:null,captured_at:m?m.captured_at:null,next_update_at:m?new Date(Date.parse(m.captured_at)+SNAPSHOT_INTERVAL_MS).toISOString():null,stale:!m||Date.now()-Date.parse(m.captured_at)>SNAPSHOT_INTERVAL_MS,refresh_failed:health.failed===true,last_attempt_at:health.at||null,automatic:!!p.getProperty('SNAPSHOT_TRIGGER_ID'),setup_ready:p.getProperty('SNAPSHOT_PRIVATE_CONFIRMED')==='yes'};
}
function getSnapshotState(){requireAccess_();return snapshotState_();}
function getProductionData(){
 requireAccess_();const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  requireAccess_();const p=PropertiesService.getScriptProperties(),m=JSON.parse(p.getProperty('SNAPSHOT_ACTIVE')||'null');
  if(!m)throw new Error('No saved snapshot yet. Ask the admin to finish Snapshot setup.');
  const sh=snapshotStore_().getSheetByName(m.sheet);if(!sh)throw new Error('Saved snapshot unavailable. Ask the admin to refresh.');
  const encoded=sh.getRange(2,1,m.chunks,1).getValues().map(r=>r[0]).join('');
  if(snapshotDigest_(encoded)!==m.digest)throw new Error('Saved snapshot integrity check failed. Ask the admin to refresh.');
  const data=JSON.parse(Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(encoded),'application/x-gzip','snapshot.json.gz')).getDataAsString('UTF-8'));
  return {...data,snapshot:snapshotState_()};
 }finally{lock.releaseLock();}
}
function refreshProductionData(){requireAdmin_();refreshSnapshot_();return getProductionData();}
function snapshotDigest_(s){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8));}
function readSourceProduction_(){
 const tabs=[];
 SOURCES.forEach(source=>{
  const ss=SpreadsheetApp.openById(source.id);let sourceTabs=0;
  ss.getSheets().filter(sh=>/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[ '\u2019-]*(?:20)?\d{2}$/i.test(sh.getName().trim())).forEach(sh=>{
   const count=sh.getLastRow();if(count){tabs.push({site:source.label,tab:sh.getName(),values:sh.getRange(1,1,count,7).getDisplayValues()});sourceTabs++;}
  });
  if(!sourceTabs)throw new Error('No recognized monthly data found for '+source.label);
 });
 const normalized=YieldCore.normalize(tabs);if(!normalized.rows.length||SOURCES.some(source=>!normalized.rows.some(r=>r.site===source.label)))throw new Error('Source validation returned no production rows for one or more sources.');
 return {tabs:tabs,captured_at:new Date().toISOString()};
}
function refreshSnapshot_(){
 const p=PropertiesService.getScriptProperties();if(p.getProperty('SNAPSHOT_PRIVATE_CONFIRMED')!=='yes')throw new Error('Snapshot setup requires the admin privacy check.');
 const lock=LockService.getScriptLock();let job=null,stage=null,store=null;lock.waitLock(15000);
 try{
  const running=JSON.parse(p.getProperty('SNAPSHOT_RUNNING')||'null');
  if(running&&Date.now()-running.started<7*60*1000)throw new Error('A refresh is already running. Your saved snapshot is unchanged.');
  job=Utilities.getUuid();p.setProperty('SNAPSHOT_RUNNING',JSON.stringify({id:job,started:Date.now()}));
 }finally{lock.releaseLock();}
 try{
  store=snapshotStore_();const data=readSourceProduction_(),encoded=Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(JSON.stringify(data),'application/json')).getBytes());
  const chunks=encoded.match(/.{1,40000}/g)||[],name='snap_'+job.replace(/-/g,'');
  stage=store.insertSheet(name);stage.getRange(1,1).setValue('Private dashboard snapshot. Do not edit or share.');stage.getRange(2,1,chunks.length,1).setValues(chunks.map(s=>[s]));SpreadsheetApp.flush();
  const saved=stage.getRange(2,1,chunks.length,1).getValues().map(r=>r[0]).join(''),digest=snapshotDigest_(encoded);
  if(snapshotDigest_(saved)!==digest)throw new Error('Snapshot write verification failed.');
  lock.waitLock(15000);
  try{
   p.setProperty('SNAPSHOT_ACTIVE',JSON.stringify({sheet:name,chunks:chunks.length,digest:digest,captured_at:data.captured_at}));
   p.setProperty('SNAPSHOT_HEALTH',JSON.stringify({at:new Date().toISOString(),failed:false}));
   // Readers use this same short lock. They finish before an old sheet is removed.
   store.getSheets().filter(sh=>sh.getName().startsWith('snap_')&&sh.getName()!==name).forEach(sh=>{try{store.deleteSheet(sh);}catch(ignore){}});
  }finally{lock.releaseLock();}
 }catch(e){
  p.setProperty('SNAPSHOT_HEALTH',JSON.stringify({at:new Date().toISOString(),failed:true}));
  if(stage&&store){const active=JSON.parse(p.getProperty('SNAPSHOT_ACTIVE')||'null');if(!active||active.sheet!==stage.getName()){try{store.deleteSheet(stage);}catch(ignore){}}}
  throw new Error('Source update failed. The last successful snapshot is unchanged. '+String(e.message||'').slice(0,250));
 }finally{
  lock.waitLock(15000);try{const running=JSON.parse(p.getProperty('SNAPSHOT_RUNNING')||'null');if(running&&running.id===job)p.deleteProperty('SNAPSHOT_RUNNING');}finally{lock.releaseLock();}
 }
}
