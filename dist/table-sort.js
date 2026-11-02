var playerOrder=null,battleOrder=null;
function compareRows(a,b,order){
  const x=a[order.index],y=b[order.index];
  const result=order.type==='number'?Number(x)-Number(y):String(x).localeCompare(String(y),'pt-BR',{numeric:true,sensitivity:'base'});
  return result*(order.direction==='ascending'?1:-1);
}
function sortableTable(id,columns,kind){
  const table=document.getElementById(id).closest('table'),headers=[...table.querySelectorAll('th')];
  headers.forEach((th,i)=>{
    const label=th.textContent.trim(),button=document.createElement('button');
    button.type='button';button.className='column-sort';button.textContent=label;
    button.setAttribute('aria-label','Ordenar por '+label.toLowerCase());
    th.textContent='';th.append(button);th.setAttribute('aria-sort','none');
    button.addEventListener('click',()=>{
      if(!data)return;
      const previous=kind==='players'?playerOrder:battleOrder;
      const order={...columns[i],direction:previous?.index===columns[i].index&&previous.direction==='ascending'?'descending':'ascending'};
      headers.forEach(h=>h.setAttribute('aria-sort','none'));th.setAttribute('aria-sort',order.direction);
      if(kind==='players'){playerOrder=order;players()}else{battleOrder=order;battles()}
      document.getElementById('sortAnnouncement').textContent=label+': ordem '+(order.direction==='ascending'?'crescente':'decrescente')+'.';
    });
  });
  return headers;
}
const sortAnnouncement=document.createElement('span');sortAnnouncement.id='sortAnnouncement';sortAnnouncement.className='sort-sr';sortAnnouncement.setAttribute('role','status');document.body.append(sortAnnouncement);
var playerHeaders=sortableTable('players',[{index:0,type:'text'},{index:2,type:'number'},{index:3,type:'number'},{index:6,type:'number'},{index:7,type:'number'},{index:13,type:'number'},{index:9,type:'number'},{index:10,type:'number'}],'players');
sortableTable('battles',[{index:0,type:'text'},{index:1,type:'text'},{index:2,type:'text'},{index:3,type:'number'},{index:4,type:'text'},{index:6,type:'text'}],'battles');
document.getElementById('sort').addEventListener('change',()=>{playerOrder=null;playerHeaders.forEach(h=>h.setAttribute('aria-sort','none'));if(data)players()});
const sortStyle=document.createElement('style');sortStyle.textContent='.column-sort{background:none;border:0;padding:0;color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit;display:flex;align-items:center;gap:8px;width:100%;text-align:left;white-space:nowrap}.column-sort:after{content:"↕";opacity:.45;font-size:13px}th[aria-sort="ascending"] .column-sort:after{content:"↑";opacity:1;color:var(--gold)}th[aria-sort="descending"] .column-sort:after{content:"↓";opacity:1;color:var(--gold)}.column-sort:hover{color:var(--gold)}.sort-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}';document.head.append(sortStyle);

