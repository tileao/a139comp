# AW139 Checklist PWA — v2.0.0 Rev 24 Import

PWA offline em padrão cockpit dark para execução da checklist AW139 com controle visual de itens cumpridos.

## Fonte do dataset

- Documento: NCL AW 139 REV. 24.pdf
- Título: AW-139 NORMAL CHECK LIST
- Área: OPR
- Revisão: 24
- Data: 26/06/2026
- Base declarada no documento: ROTORCRAFT FLIGHT MANUAL, Issue 2 (AW139 OMNI)

> Status do dataset: APPROVED. Conteúdo validado item a item contra NCL AW 139 REV. 24.pdf.

## Mudanças da Rev 24 (vs Rev 23)

- **BEFORE TAKE OFF (normal):** `CAT A` passou de `102% NR` para `A/R`.
- **BEFORE LANDING (normal):** `DH` passou de `SET LDP` para `SET ___ FT`.
- **FINAL APPROACH (normal):** reestruturado para `LDG GEAR — DOWN / 3 GREEN`,
  `RPM SWITCH (≤ 90KT) — A/R`, `AUTHORIZATION — CLEARED`
  (removida a linha MEMORY "FINAL APPROACH RECHECK").
- **BEFORE LANDING (offshore):** `PARK BRK` de `CHECK ON` para `ON`;
  removida a linha `LANDING SITE — GREEN DECK`.
- **TRAFFIC PATTERN (offshore):** linha destacada passou a
  `PF CALLS HELIDECK ICAO CODE FROM VISUAL AIDS. PM CROSS CHECK AGAINST FLIGHT
  PREVIEW AND READBACK THE NAME.`; removida `DS / PM CHECKS AGAINST SCHEDULE`.
- **FINAL APPROACH (offshore):** reestruturado para `LDG GEAR — DOWN / 3 GREEN`,
  `RPM SWITCH (≤ 90KT) — 102% NR`, `LANDING AREA — IDENTIFIED & GREEN DECK`,
  `LANDING SITE — RECONFIRMED` e a linha destacada
  `PF CALLS HELIDECK ICAO CODE AND PM READBACK.`

## Mudanças da v2.1 (operational readiness)

- Seletor de missão ao iniciar/resetar: Normal Check List ou Offshore Check List.
- Navegação Próximo/Anterior grupo segue só a sequência da missão escolhida.
- CSS sticky-header adicionado (cabeçalho gruda no topo ao scrollar).
- Deploy automático via GitHub Actions → GitHub Pages.
- `contentStatus` alterado para `APPROVED`.

## Mudanças da v2

- Cada grupo da checklist virou uma página própria.
- Fluxo sequencial com `Grupo anterior` e `Próximo grupo`.
- O botão `Próximo grupo` não avança enquanto existir item pendente.
- Normal Check List e Offshore Check List foram separados no menu lateral.
- Itens marcados com `●`, `MEMORY`, `GREEN DECK`, `LDP` e `UNIT` receberam tags visuais.
- LocalStorage usa chave nova: `aw139-checklist-state-v2-rev23`.
- Service worker usa cache novo: `aw139-checklist-v2.0.0-rev23`.

## Grupos importados

### Normal Check List

1. COCKPIT CHECKS
2. BEFORE ENGINE START
3. SYSTEM CHECKS
4. FIRST ENGINE START
5. SECOND ENGINE START
6. FLIGHT CONFIGURATION
7. TAXING
8. BEFORE TAKE OFF
9. AFTER TAKE OFF
10. CRUISE
11. BEFORE DESCENT
12. BEFORE LANDING
13. FINAL APPROACH
14. AFTER LANDING
15. ENGINES SHUT DOWN
16. AFTER ROTOR STOPS

### Offshore Check List

17. BEFORE DESCENT
18. BEFORE LANDING
19. TRAFFIC PATTERN
20. FINAL APPROACH
21. AFTER LANDING
22. BEFORE TAKEOFF
23. AFTER TAKE OFF

## Como rodar localmente

```bash
cd aw139-checklist-pwa-v2
python3 -m http.server 8080
```

Abrir:

```txt
http://localhost:8080
```

## Como usar

- Toque uma vez em uma linha para marcar como cumprida.
- Toque novamente para desmarcar.
- Toque longo em uma linha para marcar como ATENÇÃO / NÃO CUMPRIDO.
- O app mostra o próximo item pendente.
- Ao terminar todos os itens do grupo, toque em `Próximo grupo`.
- Se tentar avançar com item pendente, o app bloqueia e leva ao próximo item não cumprido.

## Checklist de validação antes de uso operacional

- [x] Conferir todos os grupos contra o PDF original.
- [x] Conferir todos os itens e respostas contra o documento aprovado.
- [x] Conferir itens com campos em branco: volts, altitude, DH etc.
- [x] Conferir grafia e abreviações da empresa.
- [x] Conferir ordem dos grupos Normal.
- [x] Conferir ordem dos grupos Offshore.
- [ ] Testar PWA offline no iPad.
- [ ] Testar persistência após fechar/reabrir.
- [ ] Testar bloqueio de avanço com item pendente.
- [ ] Testar reset de grupo e reset voo.
- [x] `contentStatus` alterado para `APPROVED` após validação formal.
