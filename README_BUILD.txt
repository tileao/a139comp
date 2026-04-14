AW139 Companion — build overlay com patch aplicado

Conteúdo deste pacote:
- shared/pwa.js
- shared/module-layout.css
- sw.js
- wat/sw.js
- rto/sw.js

Como usar:
1. Extraia este ZIP sobre o repositório atual `a139comp`
2. Aceite sobrescrever os arquivos
3. Faça deploy da pasta atualizada
4. Abra online uma vez para renovar o cache do service worker
5. No iPhone/iPad, feche o app e reabra; se necessário, remova e adicione à Tela de Início novamente

Escopo desta build:
- consolida layout responsivo de iPhone / iPad retrato / iPad paisagem
- injeta automaticamente `shared/module-layout.css` em WAT, RTO, ADC e Cat A via `shared/pwa.js`
- endurece o cache offline incluindo o novo CSS nos service workers

Observação:
Esta é uma build-overlay pronta para aplicação sobre o repo atual. Ela não recria todos os arquivos originais do projeto porque o ambiente desta sessão não consegue clonar o GitHub diretamente.
