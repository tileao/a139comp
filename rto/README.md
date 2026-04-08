## v13
- Figure 4-56: correção do span geométrico do eixo DIST do painel central para 0→20.
- Mantidos auto-advance e ajustes de cache/versionamento.

## v12
- Corrige a escala geométrica do painel central da Figure 4-56 para span útil 0→19 na malha, evitando compressão do eixo DIST.
- Mantém PA auto-advance em 3 dígitos e OAT em 2 dígitos.
- Bump de cache/service worker para atualização limpa.

# AW139 RTO / CTO Module

Build v08.

Perfis incluídos:
- Supplement 50 / Figure 4-54 / RTO / Standard
- Supplement 50 / Figure 4-56 / RTO / EAPS OFF


## v10
- Correção semântica da Figure 4-56 (EAPS OFF): painel esquerdo com família 50 até 0 ft continuando como MAX OAT LIMIT, faixa de PA de -1000 a 8000 ft, e curvas centrais 6400/6600/6800 reordenadas corretamente.


## v11
- Fix explícito da escala de Pressure Altitude no overlay das cartas Sup 50 (com eixo calibrado por ticks da carta quando disponível).
- Mantido auto-advance: PA após 3 dígitos e OAT após 2 dígitos.
- Bump de cache/versionamento para evitar service worker antigo.


Build v16
- Added Figure 4-58 (Supplement 50, RTO EAPS ON) initial engine from vector-first extraction.
- Headwind blank defaults to 0.
- Changing configuration preserves field values; reset only via Reset or page reload.


## v15
- Figure 4-58: semântica corrigida no painel esquerdo (curva superior = 50 / MAX OAT LIMIT; curva abaixo = 40).


Build v16
- overlay agora desenha as curvas usadas no cálculo sobre a carta
- painel esquerdo destaca a(s) família(s) de OAT usada(s)
- painel central destaca a(s) curva(s) de peso usada(s)
- painel direito destaca a Reference Line / correction curve


## v18
- Figure 4-58: painel central e painel direito religados à base aprovada de curvas.
- Overlay das curvas usadas no cálculo passa a usar a mesma base aprovada.


Build v23: IBF center panel scale corrected to 0–20 m full-width on Figure 4-68A.


## V48 clean restart baseline
- Base restored from V39.
- Figure 4-94 (S90-127) assets staged only as clean references.
- No 4-94 engine or autoswitch wiring is active in this build.


## V58
- Enabled Figure 4-96 engine for EAPS ON above 6800 kg.


## V59
- Corrige a escala geométrica do painel central da Figure 4-96 para 0–20 [m x100].
- Recalibra o alinhamento X dos painéis central e direito da Figure 4-96 (~1.8 px à esquerda).
