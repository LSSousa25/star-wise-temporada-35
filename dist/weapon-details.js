function renderWeaponDetails(d){
  const box=document.getElementById('weapons'),fire=box.closest('section');
  fire.id='armamentos';
  box.innerHTML='<p class="count">Abra um armamento para consultar os jogadores. Lista em ordem de destruições, incluindo quem tem zero.</p>'+d.weapons.map((weapon,i)=>{
    const total=weapon[1],list=[...d.weaponPlayers].sort((a,b)=>b.counts[i]-a.counts[i]||a.name.localeCompare(b.name,'pt-BR'));
    const positive=list.filter(p=>p.counts[i]>0).length;
    return '<details class="weapon-detail"><summary><span class="weapon-name">'+esc(weapon[0])+'</span><span class="weapon-total">'+num(total)+' <small>destruições · '+pct(d.summary.destroyed?total/d.summary.destroyed:0)+'</small></span><span class="weapon-expand" aria-hidden="true">+</span></summary><div class="bar"><i style="background:var(--gold);width:'+(d.summary.destroyed?total/d.summary.destroyed*100:0)+'%"></i></div><div class="weapon-content"><p class="count">'+positive+' de '+list.length+' jogadores com destruições nesta categoria.'+(total===0?' Nenhuma destruição registrada.':'')+'</p><div class="weapon-table"><table><caption class="sort-sr">Destruições por jogador — '+esc(weapon[0])+'</caption><thead><tr><th scope="col">Jogador</th><th scope="col">Destruições</th><th scope="col">% do armamento</th></tr></thead><tbody>'+list.map(p=>'<tr><td>'+esc(p.name)+'</td><td>'+num(p.counts[i])+'</td><td>'+(total?pct(p.counts[i]/total):'—')+'</td></tr>').join('')+'</tbody><tfoot><tr><th scope="row">Total</th><td>'+num(total)+'</td><td>'+(total?'100,0%':'—')+'</td></tr></tfoot></table></div></div></details>';
  }).join('');
}
