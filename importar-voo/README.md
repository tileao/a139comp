# AW139 Companion — Importar Voo

Módulo web (HTML + CSS + JS puro, sem build) que importa o voo a partir do
**texto do Flight Preview** (formulário F-OPR 184) gerado por uma IA com
leitura de PDF (Microsoft 365 Copilot etc.), mostra uma tela de conferência
e grava os dados no contexto compartilhado da suíte AW139 Companion.

> O import direto de PDF (com pdf.js) foi removido: na prática não era
> confiável nos aparelhos de uso (Safari/iOS) e o caminho por texto/IA
> cobre melhor o cenário real.

## Como funciona

1. Copie o prompt pronto (botão "Copiar prompt" — texto completo em
   [`COPILOT_PROMPT.md`](./COPILOT_PROMPT.md)), anexe o PDF do Flight Preview
   a uma conversa com o Copilot (ou outra IA com leitura de PDF) e cole o
   prompt. A IA devolve os dados no formato `AW139-FLIGHT-PREVIEW-TEXT-V1`
   (um bloco de código com seções `### HEADER` chave: valor e
   `### LEGS`/`### STOPS`/`### HELIDECKS`/`### METARS` em CSV simples).
2. Cole a resposta na caixa de texto e toque em "Processar texto". O
   `text-parser.js` interpreta o formato de modo tolerante: nunca lança
   exceção, campos ausentes viram `null`.
3. **Conferência**: nada é gravado sem revisão. Todos os campos aparecem em
   inputs editáveis (Voo, Aeronave, Rota, Paradas, Helideques, Meteorologia);
   campos ausentes ficam vazios e destacados em âmbar. "Confirmar e gravar"
   funde (merge, nunca sobrescreve) os dados na chave `localStorage`
   `aw139_companion_shared_context_v1` e grava o objeto completo em
   `aw139_flight_preview_v1`. "Descartar" limpa sem gravar.

> **Privacidade**: neste fluxo o PDF sai do dispositivo e vai para o serviço
> de IA. Use só se sua organização já aprova isso para dados operacionais.

## Estrutura

```
importar-voo/
├── index.html          tela de importação (texto) + conferência
├── app.js               fluxo de UI, gravação no contexto compartilhado
├── text-parser.js         parser do formato de texto AW139-FLIGHT-PREVIEW-TEXT-V1
├── COPILOT_PROMPT.md      prompt pronto para extrair via IA + spec do formato
├── styles.css             tema cockpit escuro, padrão da suíte
└── manifest.webmanifest + sw.js   PWA offline (cache imutável por versão)
```

## Como testar localmente

Sem dependências nem build — basta servir a pasta estaticamente:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000/importar-voo/` e selecione um Flight Preview
real (PDF do formulário F-OPR 184). PDFs incompletos ou fora do formato
mostram uma mensagem de erro clara em vez de travar a tela.

## Cache offline e versionamento (importante)

O `sw.js` usa **cache imutável por versão**: no `install`, todos os
arquivos do módulo são pré-cacheados de forma atômica sob uma cache
versionada (`aw139-importar-voo-v<BUILD>`); no `fetch`, servimos
**cache-first e nunca regravamos** a cache versionada. Assim, todo arquivo
servido numa sessão vem da **mesma geração** — o que elimina o "skew" de
cache (ex.: `index.html` de uma versão servido junto de um `app.js` de
outra), que era a causa raiz de travamentos silenciosos.

Para atualizar, **bump o número de build nos três lugares que precisam
bater**: `BUILD` em `sw.js`, `IMPORTAR_BUILD` em `app.js` e o
`data-importar-build` do `<body>` em `index.html`. Uma guarda em runtime
compara o build do HTML com o do JS; se não baterem (skew residual de
qualquer causa), o app se recupera sozinho (recarrega uma vez) em vez de
estourar erro críptico.

## Integração com o AW139 Companion

- `?embed=1` oculta a topbar; `?back=1&return=<url>` mostra um botão de
  voltar — para uso dentro do shell do app principal.
- Chaves gravadas em `aw139_companion_shared_context_v1`: `fpFlightId`,
  `fpDate`, `fpAircraft`, `fpOewKg`, `fpMaxFuelKg`, `fpFuelFlowFlightKgH`,
  `fpFuelFlowGndKgH`, `fpCruiseKt`, `fpMinReserveMin`, `fpPaxStdKg`,
  `fpBagStdKg`, `fpRoute` (pernas), `fpHelidecks`, `fpImportedAt` (carimbo
  da importação), além de `circuitoUmIcao`/`weightKg` para compatibilidade
  com módulos existentes. O objeto completo vai em `aw139_flight_preview_v1`.
- **Consumo no Planejamento do Voo (Pesos)**: ao abrir, o módulo Pesos
  detecta um voo importado novo (via `fpImportedAt`) e autopreenche a
  **rota só com as paradas** (aeródromos e helideques — onde a aeronave
  pousa; os fixos de sobrevoo ficam de fora), a aeronave (matrícula,
  BEW=EEW, tripulação=OEW−EEW, categoria de MTOW) e o **combustível por
  trecho parada→parada** (decolagem = comb. de saída da parada de origem,
  já com a queima de solo real; pouso = comb. de chegada na de destino) —
  uma vez por importação, sem sobrescrever edições manuais em reaberturas.
  O manifesto (pax/bag) fica em branco de propósito, por ser entrada
  manual de peso e balanceamento.

## Aviso

Confira os dados importados com o documento oficial antes do voo.
