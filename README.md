# STAR Wise — Temporada 35

Site estático com sincronização automática da planilha original. Sem dependências npm, senhas ou credenciais.

## Como funciona

O GitHub Actions consulta as abas Resumo, Jogadores T35, Batalhas e Destruições T35 a cada hora, no minuto 17 (UTC). Também executa ao enviar código para main e pelo botão Run workflow. O agendamento pode sofrer atrasos do GitHub; não é atualização em tempo real.

O sincronizador lê duas vezes para detectar mudanças durante a coleta, valida totais e cobertura e só então substitui dist/data.json. Todos os indicadores, destaques, equipes, mapas, jogadores, armamentos e datas são renderizados a partir desse arquivo. Se a coleta falhar, o workflow para antes da publicação e o site anterior continua no ar. O navegador mostra quando ocorreu a última sincronização bem-sucedida e sinaliza atraso superior a três horas.

A fonte continua sendo a planilha: este código não consulta diretamente a API do jogo nem atualiza a planilha. Os dados do jogo só mudam no site depois que a planilha for atualizada.

## Publicação

1. Criar um repositório e enviar o conteúdo desta pasta para a branch main.
2. Em Settings → Pages → Build and deployment, selecionar GitHub Actions.
3. Na aba Actions, executar “Sincronizar planilha e publicar site” e aguardar sucesso.

O Pages publica somente dist/. Não envia scripts, CSVs de origem ou configurações do Sites ao site.

A planilha precisa continuar acessível para leitura sem login. Se esse acesso for revogado, o workflow falhará e preservará a publicação anterior. Nenhuma permissão do Google Drive é alterada pelo código.

Em repositórios públicos, o GitHub pode desativar agendamentos após 60 dias sem atividade; nesse caso reative o workflow na aba Actions.

## Uso local

Requer Node.js 22 ou superior.

```sh
npm test
npm run sync
```

Sirva dist/ por um servidor HTTP para visualizar. Não abra index.html diretamente por file://, pois o navegador precisa ler data.json.

As validações rejeitam alterações incompatíveis da estrutura, números inválidos, duplicações, divergências de totais e temporadas diferentes da 35. Uma nova temporada exige adaptação explícita.

Documentação: [agendamentos do GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) · [GitHub Pages com Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
