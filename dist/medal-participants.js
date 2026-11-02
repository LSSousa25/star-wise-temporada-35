function renderMedalParticipants(d){
  const categories=[
    {index:2,format:num,label:'Batalhas',minimum:0},
    {index:7,format:num,label:'Dano médio',minimum:10},
    {index:10,format:pct,label:'Sobrevivência',minimum:10},
    {index:6,format:pct,label:'Aproveitamento',minimum:10},
    {index:9,format:dec,label:'Destruições / batalha',minimum:10},
    {index:15,format:num,label:'Dano por detecção',minimum:10}
  ];
  document.querySelectorAll('.honor').forEach((card,i)=>{
    const category=categories[i];
    const players=d.players.filter(p=>p[2]>=category.minimum).sort((a,b)=>b[category.index]-a[category.index]||a[0].localeCompare(b[0],'pt-BR'));
    const details=document.createElement('details');details.className='medal-participants';
    details.innerHTML='<summary>Ver participantes <span>'+players.length+' jogadores</span></summary><p class="medal-criteria">'+(category.minimum?'Mínimo de '+category.minimum+' batalhas.':'Todos os participantes da temporada.')+' Em caso de empate, os jogadores compartilham a posição.</p><div class="medal-table"><table><caption class="sort-sr">Participantes — '+esc(card.querySelector('.honor-title').textContent)+'</caption><thead><tr><th scope="col">Pos.</th><th scope="col">Jogador</th><th scope="col">'+esc(category.label)+'</th><th scope="col">Batalhas</th></tr></thead><tbody>'+players.map((p,j)=>{
      const rank=players.findIndex(other=>other[category.index]===p[category.index])+1;
      return '<tr'+(rank===1?' class="medal-leader"':'')+'><td>'+rank+'º</td><td>'+esc(p[0])+'</td><td>'+category.format(p[category.index])+'</td><td>'+num(p[2])+'</td></tr>';
    }).join('')+'</tbody></table></div>';
    card.querySelector('.honor-seal').before(details);
  });
}
