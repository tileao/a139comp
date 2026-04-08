Build v16.8.6

Atualizacao v16.8.6: ajuste fino da curva 30 do CAT B IBF Installed no Supplement 90.

Confined Area: Supplement 50 only.

# WAT 6800 Unified

Perfis integrados:
- Offshore Helideck — Standard
- Offshore Helideck — EAPS ON

Os demais perfis permanecem reservados para calibração futura.


## Build status

Esta build inclui todos os perfis do suplemento 6800 kg: Offshore, Clear Area / CAT B e Confined Area, nas configurações Standard, EAPS OFF, EAPS ON e IBF Installed.


Ajuste v3: páginas raster do RFM dos perfis Clear Area regeneradas diretamente do PDF-fonte para alinhar a visualização ao referencial geométrico extraído.

## Build note
This v4-fixed rebuild refactors Figure 4-4 (Confined Area Standard) from the PDF source while preserving the stable v3 app structure.

## Build note
This v5 build fixes the confined IBF interpolation edge case near 0 ft and reanchors Figure 4-6 (Confined Area EAPS ON) to the calibrated page placement used by the PDF-derived chart frame.



## v6 - início da integração Confined 6400

- Adicionadas as cartas do Supplement 12 para Confined: Standard, EAPS OFF, EAPS ON e IBF.
- Os perfis Confined agora usam seleção automática entre a família 6400 e a família 6800.
- Nesta primeira etapa, a família 6400 entra como fonte preferencial até 6400 kg e como fallback para fechar buracos quando a família 6800 falha.

## v8 - costura geométrica em 6400 (Confined Standard)

- O perfil Confined Standard agora usa uma curva unificada entre Supplement 12 e Supplement 50.
- A costura é feita em 6400 kg: a carta baixa alimenta o trecho até 6400 e a carta alta continua acima desse ponto.
- A seleção da página exibida continua simples: até 6400 mostra o Supplement 12; acima de 6400 mostra o Supplement 50.


## v9 - ajuste visual do Supplement 12 (Confined Standard)
- correção do overlay da carta Figure 4D-4 com placement calibrado a partir da conferência visual
- sem mudança no cálculo do motor de costura


## v10 - correção de visualização híbrida no Confined Standard

- Mantém o cálculo costurado em 6400 kg entre Supplement 12 e Supplement 50.
- Corrige a escolha da carta exibida no caso híbrido: a visualização agora segue o peso consultado, evitando overlay quebrado quando o cálculo costurado retorna max acima de 6400 kg para um peso atual abaixo de 6400 kg.


## v11.1
- Confined Standard mantém cálculo auditado nas cartas originais.
- Visualização passa a usar a carta unificada costurada quando o perfil Confined Standard precisa de leitura contínua através da transição 6400/6800.
- Novo asset: docs/page-17.png


## v13
- Corrige o alinhamento visual da Figure 4D-4 (Supplement 12) com placement dedicado baseado na posição real do crop na página.
- Mantém cálculo e costura do Confined Standard inalterados.

## v12
- Confined Standard / Supplement 12 (Figure 4D-4): alinhamento visual do overlay passou a usar mapeamento direto da página PDF em vez do placement calibrado.
- Mantém o cálculo inalterado; ajuste apenas de visualização para casos como 0/30/6380.


## v13.1
- Adiciona marcador visual discreto da versão da build no topo da página para facilitar a validação de cache/carregamento no iPhone.


Visual fix v14.0: Figure 4D-4 now uses direct page-scale placement derived from the natural size of page-13.png.


## v15 - confined standard display uses merged visual curves
- A visualização do Confined Standard agora projeta na carta exibida as curvas ativas da costura geométrica, em vez de reutilizar diretamente a família crua do Supplement 12.
- Isso corrige o desalinhamento dos casos próximos à transição, como 0 / 30 / 6380 e 0 / 33 / 6500, sem alterar o motor de cálculo.


Atualização v16.5: bloco de referência padronizado também nos perfis Confined (Figure, Suplemento, Página e Fonte) e botões ± reduzidos mantendo teclado numérico.


Supplement 90 Clear Area Stage A
- Added rendered source pages for Figure 4-5 to 4-8 (pages S90-28 to S90-31).
- Added docs/wat7000.pdf and data/sup90-cleararea-stageA.json.
- This build only prepares Etapa A assets/anchoring references; the new 7000 kg clear-area family is not active in the engine yet.
