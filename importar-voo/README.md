# AW139 Companion — Importar Voo

Módulo web (HTML + CSS + JS puro, sem build, sem chamadas de rede em
runtime) que lê o PDF do Flight Preview da operação (formulário F-OPR 184),
extrai os dados do voo, mostra uma tela de conferência e grava tudo no
contexto compartilhado da suíte AW139 Companion.

## Como funciona

1. **Upload**: escolha o PDF (toque na zona de upload) ou arraste e solte
   (desktop). O arquivo é lido inteiramente no dispositivo — nada é enviado
   pela rede. O parsing usa o [pdf.js](https://mozilla.github.io/pdf.js/) da
   Mozilla, vendorizado em `vendor/` (sem CDN).
2. **Parsing** (`parser.js`): extrai cabeçalho (voo, tripulação, aeronave),
   pernas da rota (rumo, distância, tempos, vento), waypoints (fixos,
   aeródromos e helideques — com coordenadas, combustível, pax e pesos) e
   METAR/TAF de cada aeródromo. O layout do formulário é tabular e gerado
   por iText, então o parser usa as **posições (x/y)** dos itens de texto
   extraídos pelo `getTextContent()` do pdf.js para desambiguar colunas —
   mais robusto do que depender só da ordem/linha do texto. O parser é
   tolerante: campos ausentes viram `null` (nunca lança exceção para PDF
   incompleto ou fora do formato) e cada campo extraído guarda a
   página/posição de origem para depuração.
3. **Conferência**: nada é gravado sem revisão. Todos os campos aparecem em
   inputs editáveis, agrupados em Voo, Aeronave, Rota (tabela de pernas),
   Paradas (pax e combustível), Helideques e Meteorologia. Campos que o
   parser não encontrou ficam vazios e destacados em âmbar.
4. **Gravação**: o botão "Confirmar e gravar" funde (merge, nunca
   sobrescreve) os dados revisados na chave `localStorage`
   `aw139_companion_shared_context_v1`, para uso pelos demais módulos da
   suíte, e grava o objeto completo em `aw139_flight_preview_v1` para uso
   futuro. "Descartar" limpa a tela sem gravar nada.

## Estrutura

```
importar-voo/
├── index.html        tela de upload + conferência
├── app.js            fluxo de UI, extração via pdf.js, gravação
├── parser.js          extração posicional dos dados do Flight Preview
├── styles.css          tema cockpit escuro, padrão da suíte
├── manifest.webmanifest + sw.js   PWA offline (cache-first)
└── vendor/            pdf.js vendorizado (pdf.min.mjs + pdf.worker.min.mjs)
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
