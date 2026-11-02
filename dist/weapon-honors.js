function renderWeaponHonors(d){
  const existing=document.getElementById('condecoracoes-armamentos');if(existing)existing.remove();
  const section=document.createElement('section');section.id='condecoracoes-armamentos';section.className='honors-board weapon-honors';
  const titles=['Ordem da Bateria Principal','Cruz dos Torpedeiros','Medalha da Bateria Secundária','Distinção da Aviação Naval','Medalha de Abalroamento','Distinção de Combate'];
  const symbols=['✦','◆','✶','✧','⚓','★'];
  section.innerHTML='<div class="head"><div><div class="eyebrow">Condecorações / Especialistas em armamento</div><h2>O mérito de cada arsenal.</h2></div><p>Maior número de destruições por armamento. Sem mínimo de batalhas; empates recebem a mesma condecoração. Distinções simbólicas da STAR Wise.</p></div><div class="highlights">'+d.weapons.map((w,i)=>{
    const list=[...d.weaponPlayers].sort((a,b)=>b.counts[i]-a.counts[i]||a.name.localeCompare(b.name,'pt-BR'));
    const max=list[0]?.counts[i]||0,leaders=max?list.filter(p=>p.counts[i]===max):[];
    return '<article class="award honor honor-'+i+'"><div class="medal" aria-hidden="true"><div class="ribbon"></div><div class="medal-ring"><span>'+symbols[i]+'</span></div></div><div class="honor-title">'+titles[i]+'</div><small class="honor-citation">'+esc(w[0])+'</small><h3>'+ (leaders.length?leaders.map(p=>esc(p.name)).join(' · '):'Sem medalhista')+'</h3><div class="honor-result"><b>'+num(max)+'</b><small>'+(max?'destruições · '+pct(max/w[1])+' do armamento':'nenhuma destruição registrada')+'</small></div><details class="medal-participants"><summary>Ver participantes <span>'+list.length+' jogadores</span></summary><p class="medal-criteria">Volume total, sem mínimo de batalhas. '+(i===5?'“Sem classificação” é o saldo não atribuído aos cinco tipos da API; não identifica incêndio ou inundação.':i===3?'Conta navios destruídos por aeronaves, não aviões abatidos.':'Dados individuais da temporada.')+'</p><div class="medal-table"><table><caption class="sort-sr">Participantes por armamento — '+esc(w[0])+'</caption><thead><tr><th scope="col">Pos.</th><th scope="col">Jogador</th><th scope="col">Destruições</th><th scope="col">Batalhas</th></tr></thead><tbody>'+list.map(p=>{
      const rank=p.counts[i]>0?list.findIndex(other=>other.counts[i]===p.counts[i])+1:null;
      return '<tr'+(max&&p.counts[i]===max?' class="medal-leader"':'')+'><td>'+(rank?rank+'º':'—')+'</td><td>'+esc(p.name)+'</td><td>'+num(p.counts[i])+'</td><td>'+num(p.battles)+'</td></tr>';
    }).join('')+'</tbody></table></div></details><div class="honor-seal">STAR WISE · T35</div></article>';
  }).join('')+'</div><p class="note">Categorias com total zero permanecem sem medalhista. As condecorações acompanham a sincronização da planilha.</p>';
  document.getElementById('armamentos').after(section);
}

