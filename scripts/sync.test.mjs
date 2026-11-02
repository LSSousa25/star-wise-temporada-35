import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCSV, numeric, transform } from './sync.mjs';

function fixture(){
  return {
    resumo:[['Período: 16/09/2026 a 02/11/2026.'],['Equipe'],['Alfa','1','1','0','100%','1832','1','0'],['Bravo','1','0','1','0%','1809','1','0'],['Total','2','1'],['Coleta em 02/11/2026: totais conferidos']],
    jogadores:[['Jogador','ID conta','Batalhas'],['Teste','123','2','1','1','0','50%','1.234,5','1.000,0','0,50','50%','2.469','2.000','1','1','10','20','1','0','2000','1000','35']],
    batalhas:[['Data/hora Brasília','Equipe','Resultado','Variação rating','Mapa'],['02/11/2026 00:33','Alfa','Vitória','25','Anel','NA','[A] Oponente','1'],['01/11/2026 23:30','Bravo','Derrota','-18','Anel','NA','[B] Oponente','2']],
    armamentos:[['Contagens da API da T35 • 13/10/2026'],['Tipo de armamento','Destruições'],['Bateria principal','1'],['Torpedos','0'],['Bateria secundária','0'],['Aeronaves','0'],['Abalroamento','0'],['Sem classificação','0']]
  };
}
test('CSV aceita texto com vírgulas, aspas, quebra dentro de célula e CR duplicado',()=>{
  assert.deepEqual(parseCSV('\uFEFFNome,Texto\r\r\n"A, B","C ""D""\nE"\r\n'),[['Nome','Texto'],['A, B','C "D"\nE']]);
  assert.throws(()=>parseCSV('"incompleto'));
});
test('Números brasileiros e percentuais preservam escala',()=>{
  assert.equal(numeric('1.234,5'),1234.5);
  assert.equal(numeric('53,82%'),0.5382);
  assert.equal(numeric('7.919.991'),7919991);
  assert.equal(numeric(''),null);
  assert.throws(()=>numeric('inválido'));
});
test('Importação calcula totais, mapas e médias sem depender de células arredondadas',()=>{
  const d=transform(fixture());
  assert.equal(d.summary.battles,2);assert.equal(d.summary.wins,1);
  assert.equal(d.summary.meanDamage,1234.5);assert.equal(d.players[0][9],0.5);
  assert.deepEqual(d.maps[0].slice(0,5),['Anel',2,1,1,0.5]);
  assert.equal(d.battles[0][0],'2026-11-02 00:33:00');
  assert.equal(d.meta.sourceDate,'02/11/2026');
  assert.equal(d.meta.weaponDate,'13/10/2026');
});
test('Dados inconsistentes interrompem a sincronização',()=>{
  let f=fixture();f.resumo[2][6]='2';assert.throws(()=>transform(f));
  f=fixture();f.batalhas.push(f.batalhas[1]);assert.throws(()=>transform(f),/duplicadas/);
  f=fixture();f.jogadores[1][21]='36';assert.throws(()=>transform(f),/temporada/);
  f=fixture();f.armamentos[2][1]='2';assert.throws(()=>transform(f),/Armamentos não/);
  f=fixture();f.batalhas[1][2]='Desconhecido';assert.throws(()=>transform(f),/Batalha inválida/);
});
