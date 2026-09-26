const KEY="delta-death-tracker-v2";
const defaultData={
  operators:["干员A","干员B","干员C"],
  reasons:["被敌方玩家击杀","被AI击杀","摔死","毒圈淘汰","时间耗尽","撤离点失败","其他"],
  maps:["长弓溪谷","航天基地","巴别塔","潮汐监狱"],
  records:[]
};
let data=load();

function load(){
 try{
  const x=JSON.parse(localStorage.getItem(KEY));
  if(x){x.maps??=structuredClone(defaultData.maps);x.operators??=structuredClone(defaultData.operators);x.reasons??=structuredClone(defaultData.reasons);x.records??=[];return x}
  const old=JSON.parse(localStorage.getItem("delta-death-tracker-v1"));
  if(old){old.maps=structuredClone(defaultData.maps);old.records=old.records.map(r=>({...r,map:r.map||"未记录"}));return old}
 }catch{}
 return structuredClone(defaultData)
}
function save(){localStorage.setItem(KEY,JSON.stringify(data));renderAll()}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(s){const t=document.getElementById("toast");t.textContent=s;t.classList.add("toast-show");setTimeout(()=>t.classList.remove("toast-show"),1600)}
function showPage(id){
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===id));
  const titles={dashboard:"战绩总览",record:"记录本局",operators:"干员管理",reasons:"死亡原因",records:"历史记录",data:"数据管理"};
  document.getElementById("pageTitle").textContent=titles[id];
  renderPage(id);
}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>showPage(b.dataset.page));

function stats(){
  const total=data.records.length, deaths=data.records.filter(r=>!r.success).length, success=total-deaths;
  const op={}, reason={};
  data.records.forEach(r=>{
    op[r.operator]??={total:0,deaths:0};op[r.operator].total++;if(!r.success)op[r.operator].deaths++;
    if(!r.success)reason[r.reason]=(reason[r.reason]||0)+1;
  });
  return {total,deaths,success,rate:total?((success/total)*100).toFixed(1):"0.0",op,reason};
}
function renderDashboard(){
 const s=stats(), max=Math.max(1,...Object.values(s.reason));
 const opRows=data.operators.map(o=>{const x=s.op[o]||{total:0,deaths:0};const rate=x.total?((x.total-x.deaths)/x.total*100).toFixed(1):"0.0";return `<div class="bar-row clickable" onclick="showOperator('${encodeURIComponent(o)}')"><span>${esc(o)}</span><div class="bar"><i style="width:${rate}%"></i></div><b>${rate}%</b></div>`}).join("");
 const map={};data.records.forEach(r=>{map[r.map||"未记录"]??={total:0,deaths:0};map[r.map||"未记录"].total++;if(!r.success)map[r.map||"未记录"].deaths++});
 document.getElementById("dashboard").innerHTML=`
 <div class="grid cards">
  <div class="card"><div class="label">总对局</div><div class="value">${s.total}</div></div>
  <div class="card"><div class="label">撤离成功</div><div class="value ok">${s.success}</div></div>
  <div class="card"><div class="label">撤离失败</div><div class="value bad">${s.deaths}</div></div>
  <div class="card"><div class="label">撤离率</div><div class="value accent">${s.rate}%</div></div>
 </div>
 <div class="grid two">
  <div class="panel"><h2>死亡原因分布</h2>
   ${Object.entries(s.reason).length?Object.entries(s.reason).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row clickable" onclick="showReason('${encodeURIComponent(k)}')"><span>${esc(k)}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join(""):`<div class="empty">还没有死亡记录</div>`}
  </div>
  <div class="panel"><h2>干员撤离率</h2>${opRows||`<div class="empty">暂无干员</div>`}</div>
 </div>
 <div class="panel" style="margin-top:14px"><h2>地图表现</h2>
  ${Object.entries(map).length?Object.entries(map).map(([m,x])=>`<div class="detail-grid"><div class="detail"><span class="label">地图</span><br>${esc(m)}</div><div class="detail"><span class="label">对局</span><br>${x.total}</div><div class="detail"><span class="label">失败</span><br><span class="bad">${x.deaths}</span></div></div>`).join(""):`<div class="empty">暂无地图数据</div>`}
 </div>`;
} 
function renderRecord(){
 document.getElementById("record").innerHTML=`
 <div class="panel"><h2>记录一局</h2>
 <div class="form">
  <div class="field"><label>干员</label><select id="recOp">${data.operators.map(o=>`<option>${esc(o)}</option>`).join("")}</select></div>
  <div class="field"><label>地图</label><select id="recMap">${data.maps.map(m=>`<option>${esc(m)}</option>`).join("")}</select></div>
  <div class="field"><label>本局结果</label><div class="result-toggle"><button id="successBtn" class="ghost selected" onclick="toggleResult(true)">撤离成功</button><button id="deathBtn" class="ghost" onclick="toggleResult(false)">撤离失败</button></div></div>
  <div class="field" id="reasonField" style="display:none"><label>死亡 / 撤离失败原因</label><select id="recReason">${data.reasons.map(r=>`<option>${esc(r)}</option>`).join("")}</select></div>
  <div class="field"><label>备注（可选）</label><input id="recNote" placeholder="例如：回撤时被架、搜物资时误入毒区……"></div>
  <button class="primary" onclick="addRecord()">保存本局</button>
 </div></div>`;
 window.currentSuccess=true;
}function toggleResult(v){window.currentSuccess=v;document.getElementById("successBtn").classList.toggle("selected",v);document.getElementById("deathBtn").classList.toggle("selected",!v);document.getElementById("reasonField").style.display=v?"none":"block"}
function addRecord(){
 const r={id:Date.now(),time:new Date().toISOString(),operator:document.getElementById("recOp").value,map:document.getElementById("recMap").value,success:window.currentSuccess,reason:window.currentSuccess?"":document.getElementById("recReason").value,note:document.getElementById("recNote").value.trim()};
 data.records.unshift(r);save();toast("本局已记录");showPage("dashboard");
}
function renderOperators(){
 document.getElementById("operators").innerHTML=`<div class="panel"><div class="section-head"><h2>干员</h2><button class="primary" onclick="addOperator()">＋ 添加干员</button></div>
 <div class="chips">${data.operators.map((o,i)=>`<span class="chip">${esc(o)} <button class="small" onclick="renameOperator(${i})">改</button> <button class="small" onclick="removeOperator(${i})">×</button></span>`).join("")}</div>
 <p class="muted">删除干员不会删除历史记录。</p></div>`;
}
function addOperator(){const n=prompt("输入干员名称");if(n?.trim()&&!data.operators.includes(n.trim())){data.operators.push(n.trim());save();}}
function renameOperator(i){const n=prompt("修改干员名称",data.operators[i]);if(n?.trim()){const old=data.operators[i];data.operators[i]=n.trim();data.records.forEach(r=>{if(r.operator===old)r.operator=n.trim()});save();}}
function removeOperator(i){if(data.operators.length<=1)return toast("至少保留一个干员");if(confirm("删除该干员？历史记录仍会保留。")){data.operators.splice(i,1);save();}}
function renderReasons(){
 document.getElementById("reasons").innerHTML=`<div class="panel"><div class="section-head"><h2>死亡 / 撤离失败原因</h2><button class="primary" onclick="addReason()">＋ 添加原因</button></div>
 <div class="chips">${data.reasons.map((r,i)=>`<span class="chip">${esc(r)} <button class="small" onclick="renameReason(${i})">改</button> <button class="small" onclick="removeReason(${i})">×</button></span>`).join("")}</div></div>`;
}
function addReason(){const n=prompt("输入新的死亡原因");if(n?.trim()&&!data.reasons.includes(n.trim())){data.reasons.push(n.trim());save();}}
function renameReason(i){const n=prompt("修改原因",data.reasons[i]);if(n?.trim()){const old=data.reasons[i];data.reasons[i]=n.trim();data.records.forEach(r=>{if(r.reason===old)r.reason=n.trim()});save();}}
function removeReason(i){if(confirm("删除这个原因？已有历史记录不会被删除。")){data.reasons.splice(i,1);save();}}
function renderRecords(){
 document.getElementById("records").innerHTML=`<div class="panel"><div class="section-head"><h2>历史记录 <span class="muted">（${data.records.length}）</span></h2><button class="ghost" onclick="clearRecords()">清空全部</button></div>
 ${data.records.length?`<table class="table"><thead><tr><th>时间</th><th>干员</th><th>地图</th><th>结果</th><th>原因</th><th>备注</th><th></th></tr></thead><tbody>${data.records.map(r=>`<tr><td>${new Date(r.time).toLocaleString()}</td><td>${esc(r.operator)}</td><td>${esc(r.map||"未记录")}</td><td class="${r.success?"ok":"bad"}">${r.success?"撤离成功":"撤离失败"}</td><td>${esc(r.reason||"—")}</td><td>${esc(r.note||"—")}</td><td><button class="small" onclick="deleteRecord(${r.id})">删除</button></td></tr>`).join("")}</tbody></table>`:`<div class="empty">暂无记录</div>`}</div>`;
}
function deleteRecord(id){data.records=data.records.filter(r=>r.id!==id);save()}
function clearRecords(){if(confirm("确定清空所有历史记录？此操作不可撤销。")){data.records=[];save()}}
function renderData(){
 document.getElementById("data").innerHTML=`<div class="grid two">
 <div class="panel"><h2>导出数据</h2><p class="muted">把干员、死亡原因和全部历史记录保存成 JSON 文件。</p><button class="primary" onclick="exportData()">导出 JSON</button></div>
 <div class="panel"><h2>导入数据</h2><p class="muted">导入以前备份的数据。导入会覆盖当前数据。</p><input id="fileInput" type="file" accept=".json" onchange="importData(event)"></div>
 </div>
 <div class="panel" style="margin-top:14px"><div class="section-head"><h2>地图管理</h2><button class="primary" onclick="addMap()">＋ 添加地图</button></div><div class="chips">${data.maps.map((m,i)=>`<span class="chip">${esc(m)} <button class="small" onclick="renameMap(${i})">改</button> <button class="small" onclick="removeMap(${i})">×</button></span>`).join("")}</div></div><div class="panel" style="margin-top:14px"><h2>项目</h2><p class="muted">Delta Death Tracker · v0.2.0 · GitHub: Jacky2277</p></div>`;
}
function addMap(){const n=prompt("输入地图名称");if(n?.trim()&&!data.maps.includes(n.trim())){data.maps.push(n.trim());save();}}
function renameMap(i){const n=prompt("修改地图名称",data.maps[i]);if(n?.trim()){const old=data.maps[i];data.maps[i]=n.trim();data.records.forEach(r=>{if(r.map===old)r.map=n.trim()});save();}}
function removeMap(i){if(confirm("删除这个地图？历史记录不会删除。")){data.maps.splice(i,1);save();}}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="delta-death-tracker-backup.json";a.click();URL.revokeObjectURL(a.href);toast("数据已导出")}
function importData(e){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const x=JSON.parse(rd.result);if(!x.operators||!x.reasons||!Array.isArray(x.records))throw Error();data=x;save();toast("导入成功")}catch{alert("文件格式不正确")}};rd.readAsText(f)}

function showOperator(name){
 const o=decodeURIComponent(name), rows=data.records.filter(r=>r.operator===o), deaths=rows.filter(r=>!r.success);
 const by={};deaths.forEach(r=>by[r.reason]=(by[r.reason]||0)+1);
 const map={};rows.forEach(r=>{map[r.map||"未记录"]??={t:0,d:0};map[r.map||"未记录"].t++;if(!r.success)map[r.map||"未记录"].d++});
 document.getElementById("dashboard").innerHTML=`<div class="panel"><div class="section-head"><h2>${esc(o)} · 独立数据</h2><button class="ghost" onclick="renderDashboard()">← 返回总览</button></div>
 <div class="grid cards"><div class="card"><div class="label">总对局</div><div class="value">${rows.length}</div></div><div class="card"><div class="label">撤离失败</div><div class="value bad">${deaths.length}</div></div><div class="card"><div class="label">撤离成功</div><div class="value ok">${rows.length-deaths.length}</div></div><div class="card"><div class="label">撤离率</div><div class="value accent">${rows.length?((rows.length-deaths.length)/rows.length*100).toFixed(1):"0.0"}%</div></div></div>
 <div class="grid two" style="margin-top:14px"><div class="panel"><h2>死亡原因</h2>${Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row clickable"><span>${esc(k)}</span><div class="bar"><i style="width:${v/Math.max(1,...Object.values(by))*100}%"></i></div><b>${v}</b></div>`).join("")||`<div class="empty">暂无撤离失败</div>`}</div>
 <div class="panel"><h2>地图表现</h2>${Object.entries(map).map(([m,x])=>`<div class="detail-grid"><div class="detail">${esc(m)}</div><div class="detail">对局 ${x.t}</div><div class="detail">失败 <span class="bad">${x.d}</span></div></div>`).join("")}</div></div></div>`;
}
function showReason(name){
 const reason=decodeURIComponent(name), rows=data.records.filter(r=>r.reason===reason), by={};rows.forEach(r=>by[r.operator]=(by[r.operator]||0)+1);
 document.getElementById("dashboard").innerHTML=`<div class="panel"><div class="section-head"><h2>「${esc(reason)}」· 干员分布</h2><button class="ghost" onclick="renderDashboard()">← 返回总览</button></div>
 <div class="grid cards"><div class="card"><div class="label">总次数</div><div class="value bad">${rows.length}</div></div><div class="card"><div class="label">涉及干员</div><div class="value">${Object.keys(by).length}</div></div></div>
 ${Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([o,v])=>`<div class="bar-row"><span>${esc(o)}</span><div class="bar"><i style="width:${v/Math.max(1,...Object.values(by))*100}%"></i></div><b>${v}</b></div>`).join("")}</div>`;
}
function renderPage(id){({dashboard:renderDashboard,record:renderRecord,operators:renderOperators,reasons:renderReasons,records:renderRecords,data:renderData}[id])()}
function renderAll(){renderDashboard();renderRecord();renderOperators();renderReasons();renderRecords();renderData()}
renderAll();
