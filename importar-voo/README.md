# AW139 Companion — Importar Voo

Módulo web (HTML + CSS + JS puro, sem build) que lê o Flight Preview da
operação (formulário F-OPR 184), mostra uma tela de conferência e grava os
dados do voo no contexto compartilhado da suíte AW139 Companion. Duas formas
de importar, lado a lado:

- **PDF direto** — 100% local, sem rede, usando pdf.js.
- **Texto/IA (Copilot)** — para quando o PDF direto não funciona no seu
  aparelho, ou quando você prefere revisar os dados numa planilha antes de
  importar. O PDF sai do dispositivo nesse caminho (veja abaixo).

## Como funciona

### Caminho 1 — PDF direto

1. **Upload**: escolha o PDF (toque na zona de upload) ou arraste e solte
   (desktop). O arquivo é lido inteiramente no dispositivo — nada é enviado
   pela rede. O parsing usa o [pdf.js](https://mozilla.github.io/pdf.js/) da
   Mozilla, vendorizado em `vendor/` (build **legacy**, para compatibilidade
   com versões mais antigas do Safari/iOS — sem CDN).
2. **Parsing** (`parser.js`): extrai cabeçalho (voo, tripulação, aeronave),
   pernas da rota (rumo, distância, tempos, vento), waypoints (fixos,
   aeródromos e helideques — com coordenadas, combustível, pax e pesos) e
   METAR/TAF de cada aeródromo. O layout do formulário é tabular e gerado
   por iText, então o parser usa as **posições (x/y)** dos itens de texto
   extraídos pelo `getTextContent()` do pdf.js para desambiguar colunas —
   mais robusto do que depender só da ordem/linha do texto. O parser é
   tolerante: campos ausentes viram `null` (nunca lança exceção para PDF
   incompleto ou fora do formato) e cada campo extraído guarda a
   página/posição de origem para depuração. Falhas do próprio pdf.js ao
   abrir o arquivo ou processar uma página específica também são isoladas e
   relatadas, em vez de travar a importação inteira.

### Caminho 2 — Texto/IA (Copilot)

1. Na aba "Texto/IA (Copilot)", copie o prompt pronto (botão "Copiar
   prompt" — texto completo em [`COPILOT_PROMPT.md`](./COPILOT_PROMPT.md)),
   anexe o PDF do Flight Preview a uma conversa com o Microsoft 365 Copilot
   (ou outra IA com leitura de PDF) e cole o prompt.
2. Copie a resposta inteira do Copilot e cole na caixa de texto do módulo.
   O botão "Processar texto" interpreta o formato `AW139-FLIGHT-PREVIEW-
   TEXT-V1` (`text-parser.js`) — seções `### HEADER` (chave: valor) e
   `### LEGS`/`### STOPS`/`### HELIDECKS`/`### METARS` (CSV simples),
   mesma filosofia tolerante do parser de PDF: nunca lança exceção,
   campos ausentes viram `null`.
3. **Atenção**: o PDF sai do dispositivo nesse fluxo e vai para o serviço de
   IA da Microsoft — diferente do caminho por PDF direto, que é 100% local.
   Use só se sua organização já aprova esse tipo de uso para dados
   operacionais.

### Conferência e gravação (comum aos dois caminhos)

Nada é gravado sem revisão. Todos os campos aparecem em inputs editáveis,
agrupados em Voo, Aeronave, Rota (tabela de pernas), Paradas (pax e
combustível), Helideques e Meteorologia. Campos ausentes ficam vazios e
destacados em âmbar. O botão "Confirmar e gravar" funde (merge, nunca
sobrescreve) os dados revisados na chave `localStorage`
`aw139_companion_shared_context_v1`, para uso pelos demais módulos da
suíte, e grava o objeto completo em `aw139_flight_preview_v1` para uso
futuro. "Descartar" limpa a tela sem gravar nada.

## Estrutura

```
importar-voo/
├── index.html          tela de upload (PDF + texto/IA) + conferência
├── app.js               fluxo de UI, extração via pdf.js, gravação
├── parser.js             extração posicional dos dados do Flight Preview (PDF)
├── text-parser.js         parser do formato de texto AW139-FLIGHT-PREVIEW-TEXT-V1
├── COPILOT_PROMPT.md      prompt pronto para extrair via IA + spec do formato
├── styles.css             tema cockpit escuro, padrão da suíte
├── manifest.webmanifest + sw.js   PWA offline (cache-first)
└── vendor/               pdf.js vendorizado, build legacy (pdf.min.mjs + pdf.worker.min.mjs)
```

## Como testar localmente

Sem dependências nem build — basta servir a pasta estaticamente:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000/importar-voo/` e selecione um Flight Preview
real (PDF do formulário F-OPR 184). PDFs incompletos ou fora do formato
mostram uma mensagem de erro clara em vez de travar a tela.

## Integração com o AW139 Companion

- `?embed=1` oculta a topbar; `?back=1&return=<url>` mostra um botão de
  voltar — para uso dentro do shell do app principal.
- Chaves gravadas em `aw139_companion_shared_context_v1`: `fpFlightId`,
  `fpDate`, `fpAircraft`, `fpOewKg`, `fpMaxFuelKg`, `fpFuelFlowFlightKgH`,
  `fpFuelFlowGndKgH`, `fpCruiseKt`, `fpMinReserveMin`, `fpPaxStdKg`,
  `fpBagStdKg`, `fpRoute` (pernas), `fpHelidecks`, além de
  `circuitoUmIcao`/`weightKg` para compatibilidade com módulos existentes.

## Aviso

Confira os dados importados com o documento oficial antes do voo.
