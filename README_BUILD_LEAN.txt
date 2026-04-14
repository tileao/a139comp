AW139 Companion Lean Build

Mudanças aplicadas nesta build:
- Removidos arquivos de auditoria e apoio não usados no runtime
- Removidos PDFs de referência do módulo WAT que não são necessários para operação normal
- Removidos backups e arquivos de teste
- Atualizados service workers para não tentar cachear esses arquivos

Objetivo:
- Reduzir o peso da build
- Reduzir armazenamento offline desnecessário
- Preservar cartas operacionais, engine e funcionamento normal dos módulos
