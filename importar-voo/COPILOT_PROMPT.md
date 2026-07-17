# Prompt para extrair o Flight Preview via IA (Microsoft 365 Copilot)

Use isto quando o PDF direto não abrir no seu aparelho (ex.: Safari/iOS
mais antigo) ou sempre que preferir revisar os dados numa planilha antes de
importar. Anexe o PDF do Flight Preview à conversa com o Copilot (ou
Word/Teams/Copilot Chat — qualquer um que aceite anexar um PDF) e cole o
prompt abaixo. Copie a resposta inteira e cole na aba **"Importar
texto/IA"** do módulo Importar Voo.

O documento sai do seu aparelho e vai para o serviço de IA da Microsoft
nesse fluxo — diferente da importação direta do PDF, que é 100% local. Use
só se sua organização já aprovar o Copilot para esse tipo de dado
operacional.

---

## Prompt (copie a partir daqui)

```
Você vai ler um Flight Preview de helicóptero offshore (formulário F-OPR 184)
em PDF e devolver os dados em um formato de texto específico, EXATAMENTE como
especificado abaixo. Responda com TODO o conteúdo dentro de UM ÚNICO bloco de
código (envolto em ``` no início e no fim), e nada fora do bloco — sem
comentário, explicação, negrito, itálico ou tabela. Isso preserva a
formatação exata (o app remove as cercas ``` automaticamente na importação).

Regras gerais:
- Se um campo não estiver legível ou não existir no documento, deixe o valor
  em branco (depois dos dois-pontos, ou a célula vazia no CSV). NUNCA invente
  ou estime um valor que não está no documento.
- Números: use ponto decimal (ex.: 17.2), sem separador de milhar.
- Datas/horas: mantenha o formato original do documento.
- Coordenadas: converta de graus/minutos/segundos para decimal (ex.:
  22°55'05"S vira -22.918056).
- Nos blocos CSV, NÃO use vírgulas dentro de um campo de texto livre (troque
  por ponto e vírgula se precisar).

Formato de saída (preencha com os dados reais do PDF anexado):

AW139-FLIGHT-PREVIEW-TEXT-V1

### HEADER
flightId: <Flight N°/ID>
dateRaw: <Date, formato dd/mm/aaaa hh:mm>
minimalReserveMin: <Minimal Reserve, só o número em minutos>
plKg: <PL, só o número em kg>
crew.p1.name: <nome do 1P>
crew.p1.weightKg: <peso do 1P em kg>
crew.p1.code: <código numérico ao lado do peso do 1P>
crew.p1.side: <RH ou LH do 1P>
crew.p2.name: <nome do 2P>
crew.p2.weightKg: <peso do 2P em kg>
crew.p2.code: <código numérico ao lado do peso do 2P>
crew.p2.side: <RH ou LH do 2P>
crew.fa.name: <nome do FA, ou vazio se [EMPTY]>
crew.fa.weightKg: <peso do FA em kg>
crew.fa.code: <código do FA, se houver>
crew.fa.side: <RH ou LH do FA, se houver>
aircraft.registration: <matrícula>
aircraft.model: <ex.: AW139 7T>
aircraft.cruiseKt: <Cruise, só o número>
aircraft.fuelFlowGndKgH: <FuelFlow(Gnd), só o número>
aircraft.fuelFlowFlightKgH: <FuelFlow(Flight), só o número>
aircraft.maxFuelKg: <MaxFuel, só o número>
aircraft.eewKg: <EEW, só o número>
aircraft.cg: <CG, só o número>
aircraft.oewKg: <OEW, só o número>
aircraft.minReqFuelKg: <MinReqFuel, só o número>
totals.rideNm: <Totals => Ride=, só o número em Nm>
totals.totalTimeHms: <Totals => Total Time=, formato hh:mm>
defaults.paxStdKg: <DEFAULTS Pax:, só o número em kg>
defaults.bagStdKg: <DEFAULTS Bag:, só o número em kg>

### LEGS
idx,from,to,mcDeg,distNm,ftMin,ttMin,windDirDeg,windKt,fuelRemKg,paxIn,paxOut,mtowKg
<uma linha por perna numerada da rota, nessa ordem exata de colunas:
idx = número da perna
from = nome do ponto de origem da perna
to = nome do ponto de destino da perna
mcDeg = rumo magnético (MC), só o número
distNm = distância em Nm, só o número
ftMin = tempo de voo (FT) convertido para minutos decimais (ex.: 00:09:21 vira 9.35)
ttMin = tempo total (TT) convertido para minutos decimais
windDirDeg = direção do vento da perna em graus, se houver (em branco se não houver)
windKt = intensidade do vento da perna em nós, se houver
fuelRemKg = combustível remanescente (kg) na chegada ao ponto de destino
paxIn = pax de chegada no ponto de destino (só se for parada/aeródromo/helideque; em branco senão)
paxOut = pax de saída no ponto de destino (idem)
mtowKg = MTOW aplicável no ponto de destino (idem)>

### STOPS
name,icao,freq,fuelArrKg,fuelDepKg,paxArr,paxDep,mtowKg,gndTimeMin
<uma linha para cada PARADA da rota (aeródromos e helideques, NÃO inclua
fixos/waypoints de sobrevoo sem parada), nessa ordem:
name = nome do aeródromo ou helideque
icao = código ICAO (aeródromos, ex. SBMI) ou código de 4 caracteres (helideques, ex. 9PWG)
freq = frequência (aeródromos; em branco para helideques se não houver)
fuelArrKg = combustível na chegada (kg)
fuelDepKg = combustível na saída (kg)
paxArr = pax na chegada
paxDep = pax na saída
mtowKg = MTOW aplicável
gndTimeMin = tempo de solo em minutos>

### HELIDECKS
icao,nome,elevFt,dValueM,maxT,classe,lat,lon,freq
<uma linha por helideque citado na rota, nessa ordem:
icao = código de 4 caracteres
nome = nome do helideque/unidade marítima
elevFt = elevação em pés
dValueM = valor-D em metros
maxT = capacidade em toneladas
classe = classe do helideque (1, 2 ou 3)
lat = latitude decimal
lon = longitude decimal
freq = frequência, se houver>

### METARS
icao,sr,ss,windDirDeg,windKt,raw,taf
<uma linha por aeródromo com METAR/TAF no documento, nessa ordem:
icao = código ICAO do aeródromo
sr = horário do nascer do sol (SR-hh:mm, só o hh:mm)
ss = horário do pôr do sol (SS-hh:mm, só o hh:mm)
windDirDeg = direção do vento extraída do METAR (formato dddffKT), em graus
windKt = intensidade do vento extraída do METAR, em nós
raw = o texto do METAR completo (sem vírgulas — troque por ponto e vírgula)
taf = o texto do TAF completo (sem vírgulas — troque por ponto e vírgula)>
```

---

## Se algo não bater

O módulo mostra tudo numa tela de conferência editável antes de gravar — se
o Copilot errar ou deixar algo em branco, dá para corrigir campo a campo na
hora, igual acontece com a importação direta do PDF. **Confira sempre os
dados importados com o documento oficial antes do voo.**
