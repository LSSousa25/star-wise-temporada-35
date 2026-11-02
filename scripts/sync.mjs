import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export const root = fileURLToPath(new URL('../', import.meta.url));
const sheetId = '1bkZMJcONTDuupUmrKsj3f0WfykuCANyA5qKTJc3Obzc';
export function parseCSV(text) {
  const rows=[]; let row=[],cell='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
    else if(c===','&&!quoted){row.push(cell);cell=''}
    else if((c==='\r'||c==='\n')&&!quoted){row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';while(text[i+1]==='\r'||text[i+1]==='\n')i++}
    else cell+=c;
  }
  if(quoted)throw Error('CSV com aspas incompletas');
  row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
export function numeric(value){
  const s=String(value??'').trim();if(!s)return null;
  const n=Number(s.replace(/\./g,'').replace(',','.').replace('%','').replace(/\s/g,''));
  if(!Number.isFinite(n))throw Error('Número inválido na planilha');
  return s.includes('%')?n/100:n;
}
function assert(ok,message){if(!ok)throw Error(message)}
function dateISO(s){
  let m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if(m)return m[3]+'-'+m[2]+'-'+m[1]+' '+m[4]+':'+m[5]+':'+(m[6]||'00');
  if(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s))return s;
  throw Error('Data de batalha não reconhecida');
}
function afterHeader(rows,name){let i=rows.findIndex(r=>r[0]===name);assert(i>=0,'Cabeçalho ausente: '+name);return rows.slice(i+1)}
export function transform(sheets){
  const {resumo,jogadores,batalhas,armamentos}=sheets;
  const teamRows=afterHeader(resumo,'Equipe');
  const teams=['Alfa','Bravo'].map(name=>{
    const r=teamRows.find(r=>r[0]===name);assert(r,'Equipe ausente: '+name);
    const a=r.slice(1,8).map(numeric);
    assert(a.every(n=>n!==null&&n>=0),'Totais de equipe inválidos');
    assert(a[1]+a[2]===a[0]&&a[5]+a[6]===a[0],'Totais de equipe inconsistentes');
    return {name,battles:a[0],wins:a[1],withoutWin:a[2],rate:a[0]?a[1]/a[0]:0,rating:a[4],detailed:a[5],pending:a[6]};
  });
  assert(jogadores[0]?.[0]==='Jogador'&&jogadores[0]?.[2]==='Batalhas','Estrutura de jogadores alterada');
  const players=jogadores.slice(1).filter(r=>r[0]&&r[1]).map(r=>{
    assert(r.length>=22,'Linha incompleta de jogador');
    const a=[r[0],r[1],...r.slice(2,22).map(numeric)];
    assert(a.slice(2).every(n=>n!==null&&n>=0),'Jogador com dados inválidos');
    assert(a[2]>0&&a[3]+a[4]+a[5]===a[2],'Batalhas individuais inconsistentes');
    // Recalcular médias a partir dos totais: o CSV tem números formatados e arredondados.
    a[6]=a[3]/a[2];a[7]=a[11]/a[2];a[8]=a[12]/a[2];a[9]=a[13]/a[2];a[10]=a[14]/a[2];return a;
  }).sort((a,b)=>b[2]-a[2]);
  assert(players.length>0,'Nenhum jogador encontrado');
  assert(players.every(r=>r[21]===35),'A planilha contém uma temporada diferente de 35');
  assert(new Set(players.map(r=>r[1])).size===players.length,'Jogadores duplicados');
  assert(batalhas[0]?.[0]==='Data/hora Brasília'&&batalhas[0]?.[4]==='Mapa','Estrutura de batalhas alterada');
  const battles=batalhas.slice(1).filter(r=>r[0]).map(r=>{
    assert(['Alfa','Bravo'].includes(r[1])&&['Vitória','Derrota'].includes(r[2])&&r[4]&&r[6],'Batalha inválida');
    const delta=numeric(r[3]);assert(delta!==null,'Variação de rating ausente');
    return [dateISO(r[0]),r[1],r[2],delta,r[4],r[5]||'',r[6],r[7]||''];
  }).sort((a,b)=>b[0].localeCompare(a[0]));
  assert(battles.length>0,'Histórico vazio');
  const keys=battles.map(r=>r[7]?'id:'+r[7]:[r[0].slice(0,16),r[1],r[6]].join('|'));
  assert(new Set(keys).size===keys.length,'Batalhas duplicadas');
  for(const t of teams){
    const a=battles.filter(r=>r[1]===t.name);
    assert(a.length===t.detailed,'Cobertura divergente da equipe '+t.name);
    assert(a.filter(r=>r[2]==='Vitória').length<=t.wins,'Vitórias detalhadas excedem o total');
  }
  const maps=[...new Set(battles.map(r=>r[4]))].map(name=>{
    const a=battles.filter(r=>r[4]===name),w=a.filter(r=>r[2]==='Vitória').length;
    const al=a.filter(r=>r[1]==='Alfa'),br=a.filter(r=>r[1]==='Bravo');
    return [name,a.length,w,a.length-w,w/a.length,al.length,al.length?al.filter(r=>r[2]==='Vitória').length/al.length:0,br.length,br.length?br.filter(r=>r[2]==='Vitória').length/br.length:0];
  });
  const weaponHeader=armamentos.findIndex(r=>r[0]==='Tipo de armamento'&&r[1]==='Destruições');
  assert(weaponHeader>=0,'Cabeçalho de armamentos ausente');
  const weapons=armamentos.slice(weaponHeader+1,weaponHeader+7).map(r=>[r[0],numeric(r[1])]);
  const destroyed=players.reduce((n,r)=>n+r[13],0);
  assert(weapons.length===6&&weapons.every(r=>r[0]&&r[1]!==null&&r[1]>=0),'Armamentos inválidos');
  assert(weapons.reduce((n,r)=>n+r[1],0)===destroyed,'Armamentos não correspondem ao total individual');
  const totalBattles=teams.reduce((n,t)=>n+t.battles,0),totalWins=teams.reduce((n,t)=>n+t.wins,0);
  const totalRow=teamRows.find(r=>r[0]==='Total');
  assert(totalRow&&numeric(totalRow[1])===totalBattles&&numeric(totalRow[2])===totalWins,'Resumo total inconsistente');
  const sourceDate=(resumo.flat().join(' ').match(/Coleta em (\d{2}\/\d{2}\/\d{4})/)||[])[1]||null;
  const weaponText=armamentos.slice(0,weaponHeader).flat().filter(v=>v.includes('Contagens da API')).join(' ');
  const weaponDate=(weaponText.match(/\d{2}\/\d{2}\/\d{4}/)||[])[0]||null;
  const period=resumo.find(r=>r[0]?.startsWith('Período:'))?.[0]||'';
  const closing=resumo.find(r=>r[0]?.startsWith('Encerramento previsto:'))?.[0]||'';
  return {players,battles,maps,teams,weapons,summary:{battles:totalBattles,wins:totalWins,rate:totalBattles?totalWins/totalBattles:0,participants:players.length,meanDamage:players.reduce((n,r)=>n+r[11],0)/players.reduce((n,r)=>n+r[2],0),destroyed,detailed:battles.length,pending:totalBattles-battles.length},meta:{sourceDate,weaponDate,period,closing,sheetId,season:35}};
}
const tabs={resumo:645668150,jogadores:35001001,batalhas:899896600,armamentos:35004001};
async function download(gid){
  const url='https://docs.google.com/spreadsheets/d/'+sheetId+'/export?format=csv&gid='+gid;
  let last;for(let i=0;i<3;i++){try{
    const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
    if(!response.ok)throw Error('Google respondeu HTTP '+response.status);
    const text=await response.text();
    assert(!/<html|<!doctype/i.test(text)&&text.length>30,'A planilha não está disponível como CSV público');
    return parseCSV(text);
  }catch(e){last=e;if(i<2)await new Promise(r=>setTimeout(r,(i+1)*2000))}}
  throw last;
}
async function main(){
  const fixtures=process.argv.indexOf('--fixtures');
  async function collect(){
    return Object.fromEntries(await Promise.all(Object.entries(tabs).map(async([name,gid])=>[name,fixtures>=0?parseCSV(await readFile(path.join(process.argv[fixtures+1],name+'.csv'),'utf8')):await download(gid)])));
  }
  const first=await collect(),second=fixtures>=0?first:await collect();
  assert(JSON.stringify(first)===JSON.stringify(second),'A planilha mudou durante a coleta; tente novamente');
  const result=transform(second);
  const target=path.join(root,'dist/data.json');
  let prior;try{prior=JSON.parse(await readFile(target,'utf8'))}catch{}
  const stable=v=>JSON.stringify({...v,meta:{...v.meta,syncedAt:undefined}});
  if(prior&&stable(prior)===stable(result))console.log('Dados sem alterações; registrando verificação bem-sucedida.');
  result.meta.syncedAt=new Date().toISOString();
  await mkdir(path.dirname(target),{recursive:true});
  await writeFile(target+'.tmp',JSON.stringify(result));
  await rename(target+'.tmp',target);
  console.log('Sincronização concluída: '+result.players.length+' jogadores, '+result.battles.length+' batalhas, '+result.maps.length+' mapas.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error('Sincronização interrompida: '+e.message+'. A versão anterior foi preservada.');process.exitCode=1});
