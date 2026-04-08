# AW139 Companion — Integração v1

Primeira integração de casca entre os módulos WAT, RTO/CTO e ADC.

## Estrutura
- `/wat` → módulo WAT original
- `/rto` → módulo RTO/CTO original
- `/adc` → módulo ADC original
- `/shared/module-bridge.js` → contexto compartilhado via `localStorage`

## O que esta integração já faz
- Home única para abrir os módulos
- Contexto compartilhado entre WAT e RTO: PA, OAT, peso e vento
- RTO salva o valor final em metros no contexto
- ADC lê automaticamente RTO/CTO do contexto

## Próximo nível
- integração nativa dos cálculos em uma UI comum
- fluxo composto Cat A Clear Area
- ADC recebendo RTO/CTO automaticamente sem botão manual
