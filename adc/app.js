const GEOM_KEY = 'aw139_adc_geometry_v49';
    const CUSTOM_BASES_KEY = 'aw139_adc_custom_bases_v3';
    const INBOX_KEY = 'aw139_adc_inbox_v1';
    const STATE_KEY = 'aw139_adc_state_v49';

    const BUILTIN_BASES = {"SBNF":{"id":"SBNF","code":"SBNF","name":"Navegantes / Ministro Victor Konder, INTL","city":"SC - Brasil","adcTitle":"SBNF ADC 15 MAY 25","engineId":"adc_sbnf_v1","stability":"stable","locked":true,"schemaVersion":5,"defaultChartId":"ADC_MAIN","defaultRunwayId":"RWY_08_26","charts":[{"id":"ADC_MAIN","label":"ADC principal","asset":"sbnf_chart_p1.png","assetName":"sbnf_chart_p1.png","size":{"width":1191,"height":1684}}],"runways":[{"id":"RWY_08_26","label":"08/26","chartId":"ADC_MAIN","referenceEnd":"26","ends":["08","26"],"lengthM":1800,"widthM":45,"widthPx":45,"thresholdRef":{"x":187.91,"y":285.01},"thresholdOpp":{"x":952.76,"y":1383.23},"declaredDistances":{"26":{"tora":1800,"toda":1800,"asda":1800,"lda":1800},"08":{"tora":1800,"toda":1800,"asda":1800,"lda":1800}},"intersections":[{"id":"B","name":"TWY B","metersFromRef":739,"labelPoint":{"x":545.2,"y":707.89}},{"id":"A","name":"TWY A","metersFromRef":891,"labelPoint":{"x":608.08,"y":799.51}}],"endFeatures":{"26":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"08":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}},"pavementRef":{"x":187.91,"y":285.01},"pavementOpp":{"x":952.76,"y":1383.23}}]},"SBME":{"id":"SBME","code":"SBME","name":"Macaé / Joaquim de Azevedo Mancebo","city":"RJ - Brasil","adcTitle":"SBME ADC 10 JUL 25","engineId":"adc_sbme_v1","stability":"stable","locked":true,"schemaVersion":5,"defaultChartId":"ADC_MAIN","defaultRunwayId":"RWY_05_23","charts":[{"id":"ADC_MAIN","label":"ADC principal","asset":"sbme_chart_p1.png","assetName":"sbme_chart_p1.png","size":{"width":862,"height":1300}}],"runways":[{"id":"RWY_05_23","label":"05/23","chartId":"ADC_MAIN","referenceEnd":"23","ends":["05","23"],"lengthM":1410,"widthM":30,"widthPx":27,"pavementRef":{"x":617.68,"y":268.22},"pavementOpp":{"x":182.56,"y":1068.5},"thresholdRef":{"x":617.68,"y":268.22},"thresholdOpp":{"x":182.56,"y":1068.5},"declaredDistances":{"23":{"tora":1410,"toda":1410,"asda":1410,"lda":1410},"05":{"tora":1410,"toda":1410,"asda":1410,"lda":1410}},"intersections":[{"id":"D","name":"TWY D","metersFromRef":216,"labelPoint":{"x":573.15,"y":404.58}},{"id":"B","name":"TWY B","metersFromRef":623,"labelPoint":{"x":454,"y":633}},{"id":"A","name":"TWY A","metersFromRef":1101,"labelPoint":{"x":294.69,"y":899.21}}],"endFeatures":{"23":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"05":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}},{"id":"RWY_06_24","label":"06/24","chartId":"ADC_MAIN","referenceEnd":"24","ends":["06","24"],"lengthM":899,"widthM":30,"widthPx":25,"pavementRef":{"x":623.03,"y":425.75},"pavementOpp":{"x":311.18,"y":916.06},"thresholdRef":{"x":623.03,"y":425.75},"thresholdOpp":{"x":311.18,"y":916.06},"declaredDistances":{"24":{"tora":899,"toda":899,"asda":899,"lda":899},"06":{"tora":899,"toda":899,"asda":899,"lda":899}},"intersections":[{"id":"B","name":"TWY B","metersFromRef":415,"labelPoint":{"x":502,"y":680}}],"endFeatures":{"24":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"06":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}}]},"SBVT":{"id":"SBVT_DRAFT_20260407_104549","code":"SBVT","name":"Vitória / Eurico de Aguiar Salles, INTL","city":"ES - Brasil","adcTitle":"SBVT ADC 23 MAR 23","engineId":"adc_sbvt_v1","stability":"draft","locked":false,"schemaVersion":5,"defaultChartId":"ADC_MAIN","defaultRunwayId":"RWY_06_24","charts":[{"id":"ADC_MAIN","label":"ADC principal","asset":"sbvt_chart_p1.png","assetName":"sbvt_chart_p1.png","size":{"width":863,"height":1300}}],"runways":[{"id":"RWY_06_24","label":"06/24","chartId":"ADC_MAIN","referenceEnd":"24","ends":["06","24"],"lengthM":1750,"widthM":45,"widthPx":26,"pavementRef":{"x":541.89,"y":396.93},"pavementOpp":{"x":238.65,"y":885.03},"thresholdRef":{"x":541.89,"y":396.93},"thresholdOpp":{"x":238.65,"y":885.03},"declaredDistances":{"24":{"tora":1750,"toda":1750,"asda":1750,"lda":1750},"06":{"tora":1750,"toda":1750,"asda":1750,"lda":1750}},"intersections":[{"id":"PP","name":"TWY PP","metersFromRef":668,"labelPoint":{"x":404,"y":577}},{"id":"C","name":"TWY C","metersFromRef":855,"labelPoint":{"x":382,"y":626}},{"id":"B","name":"TWY B","metersFromRef":1196,"labelPoint":{"x":309,"y":695}}],"endFeatures":{"24":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"06":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}},{"id":"RWY_02_20","label":"02/20","chartId":"ADC_MAIN","referenceEnd":"20","ends":["02","20"],"lengthM":2058,"widthM":45,"widthPx":28,"pavementRef":{"x":582.16,"y":272.74},"pavementOpp":{"x":677.41,"y":942.66},"thresholdRef":{"x":582.16,"y":272.74},"thresholdOpp":{"x":677.41,"y":942.66},"declaredDistances":{"20":{"tora":2058,"toda":2058,"asda":2058,"lda":2058},"02":{"tora":2058,"toda":2058,"asda":2058,"lda":2058}},"intersections":[{"id":"M","name":"TWY M","metersFromRef":209,"labelPoint":{"x":582,"y":348}},{"id":"K","name":"TWY K","metersFromRef":509,"labelPoint":{"x":574,"y":448}},{"id":"J","name":"TWY J","metersFromRef":1282,"labelPoint":{"x":615,"y":690}}],"endFeatures":{"20":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"02":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}}]},"SBGL":{"id":"SBGL_DRAFT_20260407_093227","code":"SBGL","name":"Rio de Janeiro / Galeão - Antônio Carlos Jobim, INTL","city":"RJ - Brasil","adcTitle":"SBGL ADC 05 SEP 24","engineId":"adc_sbgl_v1","stability":"draft","locked":false,"schemaVersion":5,"defaultChartId":"ADC_MAIN","defaultRunwayId":"RWY_10_28","charts":[{"id":"ADC_MAIN","label":"ADC principal","asset":"sbgl_chart_p1.png","assetName":"sbgl_chart_p1.png","size":{"width":863,"height":1300}}],"runways":[{"id":"RWY_10_28","label":"10/28","chartId":"ADC_MAIN","referenceEnd":"28","ends":["10","28"],"lengthM":4000,"widthM":45,"widthPx":27,"pavementRef":{"x":120.53,"y":304.08},"pavementOpp":{"x":282.04,"y":885.64},"thresholdRef":{"x":120.53,"y":304.08},"thresholdOpp":{"x":282.04,"y":885.64},"declaredDistances":{"10":{"tora":4000,"toda":4000,"asda":4000,"lda":4000},"28":{"tora":4000,"toda":4000,"asda":4000,"lda":4000}},"intersections":[{"id":"DD","name":"TWY DD","metersFromRef":1329,"labelPoint":{"x":187,"y":523}},{"id":"CC","name":"TWY CC","metersFromRef":1750,"labelPoint":{"x":196,"y":585}},{"id":"BB","name":"TWY BB","metersFromRef":2269,"labelPoint":{"x":224,"y":656}},{"id":"AA","name":"TWY AA","metersFromRef":2679,"labelPoint":{"x":243,"y":713}}]},{"id":"RWY_15_33","label":"15/33","chartId":"ADC_MAIN","referenceEnd":"33","ends":["15","33"],"lengthM":3180,"widthM":47,"widthPx":27,"pavementRef":{"x":736.85,"y":627.45},"pavementOpp":{"x":459.22,"y":1016.41},"thresholdRef":{"x":727.36,"y":642.96},"thresholdOpp":{"x":470.08,"y":1001.68},"declaredDistances":{"15":{"tora":3060,"toda":3180,"asda":3060,"lda":2930},"33":{"tora":3050,"toda":3180,"asda":3050,"lda":2930}},"intersections":[{"id":"J","name":"TWY J","metersFromRef":460,"labelPoint":{"x":650,"y":690}},{"id":"E","name":"TWY E","metersFromRef":1057,"labelPoint":{"x":617,"y":743}},{"id":"D","name":"TWY D","metersFromRef":1629,"labelPoint":{"x":487,"y":933}}],"endFeatures":{"15":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"33":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}}]},"SBRJ":{"id":"SBRJ","code":"SBRJ","name":"Rio de Janeiro / Santos Dumont","city":"RJ - Brasil","adcTitle":"SBRJ ADC 27 NOV 25","engineId":"adc_sbrj_v1","stability":"draft","locked":true,"schemaVersion":5,"defaultChartId":"ADC_MAIN","defaultRunwayId":"RWY_02L_20R","charts":[{"id":"ADC_MAIN","label":"ADC principal","asset":"sbrj_chart_p1.png","assetName":"sbrj_chart_p1.png","size":{"width":863,"height":1300}}],"runways":[{"id":"RWY_02L_20R","label":"02L/20R","chartId":"ADC_MAIN","referenceEnd":"20R","ends":["02L","20R"],"lengthM":1260,"widthM":30,"widthPx":24,"pavementRef":{"x":368.82,"y":314.92},"pavementOpp":{"x":402.57,"y":1056.19},"thresholdRef":{"x":368.82,"y":314.92},"thresholdOpp":{"x":402.57,"y":1056.19},"declaredDistances":{"02L":{"tora":1260,"toda":1260,"asda":1260,"lda":1260},"20R":{"tora":1260,"toda":1260,"asda":1260,"lda":1260}},"intersections":[{"id":"B","name":"TWY B","metersFromRef":377,"labelPoint":{"x":365,"y":543}},{"id":"C","name":"TWY C","metersFromRef":973,"labelPoint":{"x":398,"y":955}},{"id":"D","name":"TWY D","metersFromRef":1182,"labelPoint":{"x":392,"y":1063}}],"endFeatures":{"02L":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"20R":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}},{"id":"RWY_02R_20L","label":"02R/20L","chartId":"ADC_MAIN","referenceEnd":"20L","ends":["02R","20L"],"lengthM":1323,"widthM":42,"widthPx":30,"pavementRef":{"x":413.42,"y":311.31},"pavementOpp":{"x":449.58,"y":1090.54},"thresholdRef":{"x":413.42,"y":311.31},"thresholdOpp":{"x":449.58,"y":1090.54},"declaredDistances":{"02R":{"tora":1323,"toda":1323,"asda":1323,"lda":1323},"20L":{"tora":1323,"toda":1323,"asda":1323,"lda":1323}},"intersections":[{"id":"H","name":"TWY H","metersFromRef":379,"labelPoint":{"x":410,"y":543}},{"id":"G","name":"TWY G","metersFromRef":972,"labelPoint":{"x":432,"y":957}},{"id":"F","name":"TWY F","metersFromRef":1176,"labelPoint":{"x":439,"y":1061}}],"endFeatures":{"02R":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"20L":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}}]},"SBJR":{"id":"SBJR","code":"SBJR","name":"Rio de Janeiro / Jacarepaguá - Roberto Marinho","city":"RJ - Brasil","adcTitle":"SBJR ADC 27 NOV 25","engineId":"adc_sbjr_v1","stability":"draft","locked":false,"schemaVersion":5,"defaultChartId":"ADC_MAIN","defaultRunwayId":"RWY_03_21","charts":[{"id":"ADC_MAIN","label":"ADC principal","asset":"sbjr_chart_p1.png","assetName":"sbjr_chart_p1.png","size":{"width":863,"height":1300}}],"runways":[{"id":"RWY_03_21","label":"03/21","chartId":"ADC_MAIN","referenceEnd":"21","ends":["03","21"],"lengthM":900,"widthM":30,"widthPx":18,"pavementRef":{"x":344.33,"y":358.79},"pavementOpp":{"x":309,"y":995},"thresholdRef":{"x":344.33,"y":358.79},"thresholdOpp":{"x":309,"y":995},"declaredDistances":{"21":{"tora":900,"toda":900,"asda":900,"lda":900},"03":{"tora":900,"toda":900,"asda":900,"lda":900}},"intersections":[{"id":"D","name":"TWY D","metersFromRef":372,"labelPoint":{"x":364,"y":580}},{"id":"C","name":"TWY C","metersFromRef":549,"labelPoint":{"x":365.79,"y":751.14}}],"endFeatures":{"21":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"03":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}}]},"SBCB":{"id":"SBCB","code":"SBCB","name":"Cabo Frio / Cabo Frio, INTL","city":"RJ - Brasil","adcTitle":"SBCB ADC 16 JUN 22","engineId":"adc_sbcb_v1","stability":"draft","locked":true,"schemaVersion":5,"defaultChartId":"ADC_MAIN","defaultRunwayId":"RWY_10_28","charts":[{"id":"ADC_MAIN","label":"ADC principal","asset":"sbcb_chart_p1.png","assetName":"sbcb_chart_p1.png","size":{"width":863,"height":1300}}],"runways":[{"id":"RWY_10_28","label":"10/28","chartId":"ADC_MAIN","referenceEnd":"10","ends":["28","10"],"lengthM":2550,"widthM":45,"widthPx":29,"pavementRef":{"x":448.06,"y":208.19},"pavementOpp":{"x":652.07,"y":1153.82},"thresholdRef":{"x":454.4,"y":241.4},"thresholdOpp":{"x":643.63,"y":1120.07},"declaredDistances":{"10":{"tora":2460,"toda":2550,"asda":2460,"lda":2370},"28":{"tora":2460,"toda":2550,"asda":2460,"lda":2370}},"intersections":[{"id":"B","name":"TWY B","metersFromRef":421,"labelPoint":{"x":457,"y":377}}],"endFeatures":{"10":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"28":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}}]},"SBFS":{"id":"SBFS","code":"SBFS","name":"Campo dos Goytacazes / Farol de São Tomé","city":"RJ - Brasil","adcTitle":"SBFS ADC 19 FEB 26","engineId":"adc_sbfs_v1","stability":"draft","locked":true,"schemaVersion":5,"defaultChartId":"ADC_MAIN","defaultRunwayId":"RWY_15_33","charts":[{"id":"ADC_MAIN","label":"ADC principal","asset":"sbfs_chart_p1.png","assetName":"sbfs_chart_p1.png","size":{"width":863,"height":1300}}],"runways":[{"id":"RWY_15_33","label":"15/33","chartId":"ADC_MAIN","referenceEnd":"15","ends":["33","15"],"lengthM":580,"widthM":31.5,"widthPx":24,"pavementRef":{"x":208.82,"y":544.88},"pavementOpp":{"x":684.03,"y":855.5},"thresholdRef":{"x":208.82,"y":544.88},"thresholdOpp":{"x":684.03,"y":855.5},"declaredDistances":{"15":{"tora":580,"toda":580,"asda":580,"lda":580},"33":{"tora":580,"toda":580,"asda":580,"lda":580}},"intersections":[{"id":"A","name":"TWY A","metersFromRef":291,"labelPoint":{"x":475,"y":649}}],"endFeatures":{"15":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0},"33":{"displacedThresholdM":0,"stopwayM":0,"clearwayM":0}}}]},"SBMI":{"id":"SBMI","code":"SBMI","name":"Maricá / Maricá","city":"RJ - Brasil","adcTitle":"SBMI ADC / AVOP 2026","engineId":"adc_sbmi_v1","stability":"stable","locked":true,"schemaVersion":6,"defaultChartId":"ADC_MAIN","defaultRunwayId":"RWY_09_27","charts":[{"id":"ADC_MAIN","label":"ADC principal","asset":"sbmi_chart_p1.png","assetName":"sbmi_chart_p1.png","size":{"width":3308,"height":4678}}],"runways":[{"id":"RWY_09_27","label":"09/27","chartId":"ADC_MAIN","referenceEnd":"27","ends":["09","27"],"lengthM":1190,"widthM":30,"widthPx":26,"pavementRef":{"x":2427.49,"y":3617.34},"pavementOpp":{"x":1335.21,"y":943.73},"thresholdRef":{"x":2351.64,"y":3431.66},"thresholdOpp":{"x":1575.46,"y":1530.48},"declaredDistances":{"27":{"tora":900,"toda":900,"asda":900,"lda":900},"09":{"tora":1110,"toda":1110,"asda":1190,"lda":930}},"intersections":[{"id":"A","name":"TWY A","metersFromRef":375,"labelPoint":{"x":1960,"y":2780}},{"id":"C","name":"TWY C","metersFromRef":621,"labelPoint":{"x":1845,"y":2315}}],"endFeatures":{"27":{"displacedThresholdM":80,"stopwayM":0,"clearwayM":0,"operationalStartM":290},"09":{"displacedThresholdM":260,"stopwayM":0,"clearwayM":0,"operationalStartM":0}}}]}};
    const ENGINE_REGISTRY = {
      adc_generic_v1: {
        id: 'adc_generic_v1',
        label: 'ADC generic v1',
        analyze({ base, runway, dep, rto }) {
          const declared = clone(runway.declaredDistances?.[dep] || { tora: runway.lengthM, toda: runway.lengthM, asda: runway.lengthM, lda: runway.lengthM });
          const features = clone(runway.endFeatures?.[dep] || { displacedThresholdM: 0, stopwayM: 0, clearwayM: 0, operationalStartM: 0 });
          const logic = distanceLogicFor(runway, dep);
          const visual = visualOverrideFor(runway, dep);
          const metrics = {};
          ['tora','toda','asda','lda'].forEach(name => {
            const startToken = logic[name]?.start;
            const endToken = logic[name]?.end;
            const startMeters = anchorMeters(runway, startToken, dep);
            const endMeters = anchorMeters(runway, endToken, dep);
            metrics[name] = {
              startToken, endToken, startMeters, endMeters,
              startPoint: anchorPoint(runway, startToken, dep),
              endPoint: anchorPoint(runway, endToken, dep),
              fullLength: Number.isFinite(startMeters) && Number.isFinite(endMeters) ? Math.max(0, orientedDistanceMeters(startMeters, endMeters, runway, dep)) : Number(declared[name] || 0)
            };
          });
          const fullAsda = metrics.asda.fullLength;
          const startRows = [{ id: 'FULL', name: anchorLabel(metrics.asda.startToken) || dep, metersFromRef: metrics.asda.startMeters, anchorToken: metrics.asda.startToken, labelPoint: metrics.asda.startPoint }]
            .concat(specialAnalysisRows(base, runway, dep))
            .concat((runway.intersections || []).map(it => ({ id: it.id, name: it.name, metersFromRef: Number(it.metersFromRef), labelPoint: clone(it.labelPoint || null), anchorToken: anchorToken('INT', it.id) })));
          const rows = startRows.map(item => {
            const pointM = Number(item.metersFromRef);
            const fromAsdaStart = Number.isFinite(metrics.asda.startMeters) ? orientedDistanceMeters(metrics.asda.startMeters, pointM, runway, dep) : 0;
            const availableAsda = Number.isFinite(metrics.asda.endMeters) ? Math.max(0, orientedDistanceMeters(pointM, metrics.asda.endMeters, runway, dep)) : Math.max(0, declared.asda - fromAsdaStart);
            const availableTora = Number.isFinite(metrics.tora.endMeters) ? Math.max(0, orientedDistanceMeters(pointM, metrics.tora.endMeters, runway, dep)) : Math.max(0, declared.tora - fromAsdaStart);
            const availableToda = Number.isFinite(metrics.toda.endMeters) ? Math.max(0, orientedDistanceMeters(pointM, metrics.toda.endMeters, runway, dep)) : Math.max(0, declared.toda - fromAsdaStart);
            return {
              ...item,
              distStart: fromAsdaStart,
              availableTora,
              availableToda,
              availableAsda,
              rtoOk: availableAsda >= rto,
              go: availableAsda >= rto
            };
          }).filter(r => Number.isFinite(r.metersFromRef) && r.distStart >= -0.5 && r.availableAsda >= -0.5)
            .map(r => ({ ...r, distStart: Math.max(0, r.distStart) }))
            .sort((a, b) => a.distStart - b.distStart);
          const gateByAsda = fullAsda - rto;
          const anyStartValid = gateByAsda >= 0;
          const gateDrawOffsetFromStart = clamp(gateByAsda, 0, fullAsda);
          const gateMRef = Number.isFinite(metrics.asda.startMeters)
            ? stationAtOffsetFromStart(metrics.asda.startMeters, gateDrawOffsetFromStart, runway, dep)
            : gateMetersFromRef(gateDrawOffsetFromStart, runway, dep);
          return {
            baseId: base.id,
            runwayId: runway.id,
            dep,
            rto,
            declared,
            features,
            rows,
            logic,
            metrics,
            visual,
            meta: {
              startThr: dep,
              endThr: currentOppositeEnd(runway),
              startLabel: anchorLabel(metrics.asda.startToken) || dep,
              fullLengthMetersFromRef: metrics.asda.startMeters,
              startStationMetersFromRef: metrics.asda.startMeters,
              startKind: metrics.asda.startToken,
              profile: logic
            },
            gateByAsda,
            gateOffsetFromStart: gateByAsda,
            gateDrawOffsetFromStart,
            gateMetersFromRef: gateMRef,
            greenLength: anyStartValid ? gateDrawOffsetFromStart : 0,
            anyStartValid,
            basisMetric: 'ASDA'
          };
        }
      },
      adc_sbnf_v1: {
        id: 'adc_sbnf_v1',
        label: 'ADC SBNF v1',
        analyze(ctx) { return ENGINE_REGISTRY.adc_generic_v1.analyze(ctx); }
      },
      adc_sbme_v1: {
        id: 'adc_sbme_v1',
        label: 'ADC SBME v1',
        analyze(ctx) { return ENGINE_REGISTRY.adc_generic_v1.analyze(ctx); }
      },
      adc_sbvt_v1: {
        id: 'adc_sbvt_v1',
        label: 'ADC SBVT v1',
        analyze(ctx) { return ENGINE_REGISTRY.adc_generic_v1.analyze(ctx); }
      },
      adc_sbgl_v1: {
        id: 'adc_sbgl_v1',
        label: 'ADC SBGL v1',
        analyze(ctx) { return ENGINE_REGISTRY.adc_generic_v1.analyze(ctx); }
      },
      adc_sbrj_v1: {
        id: 'adc_sbrj_v1',
        label: 'ADC SBRJ v1',
        analyze(ctx) { return ENGINE_REGISTRY.adc_generic_v1.analyze(ctx); }
      },
      adc_sbjr_v1: {
        id: 'adc_sbjr_v1',
        label: 'ADC SBJR v1',
        analyze(ctx) { return ENGINE_REGISTRY.adc_generic_v1.analyze(ctx); }
      },
      adc_sbcb_v1: {
        id: 'adc_sbcb_v1',
        label: 'ADC SBCB v1',
        analyze(ctx) { return ENGINE_REGISTRY.adc_generic_v1.analyze(ctx); }
      },
      adc_sbfs_v1: {
        id: 'adc_sbfs_v1',
        label: 'ADC SBFS v1',
        analyze(ctx) { return ENGINE_REGISTRY.adc_generic_v1.analyze(ctx); }
      },
      adc_sbmi_v1: {
        id: 'adc_sbmi_v1',
        label: 'ADC SBMI v1',
        analyze(ctx) {
          const out = ENGINE_REGISTRY.adc_generic_v1.analyze(ctx);
          out.metricProfile = metricProfile(ctx.runway, ctx.dep);
          out.sbmiLogicApplied = true;
          return out;
        }
      }
    };


    (function patchBuiltinLogic() {
      const sbmi = BUILTIN_BASES?.SBMI?.runways?.find(r => r.id === 'RWY_09_27');
      if (!sbmi) return;
      sbmi.endFeatures = sbmi.endFeatures || {};
      sbmi.endFeatures['27'] = { ...(sbmi.endFeatures['27'] || {}), operationalStartM: 290, displacedThresholdM: 80, stopwayM: 0, clearwayM: 0 };
      sbmi.endFeatures['09'] = { ...(sbmi.endFeatures['09'] || {}), operationalStartM: 0, displacedThresholdM: 260, stopwayM: 0, clearwayM: 0 };
      sbmi.distanceLogic = {
        '27': {
          tora: { start: 'OP:27', end: 'PAV:09' },
          toda: { start: 'OP:27', end: 'PAV:09' },
          asda: { start: 'OP:27', end: 'PAV:09' },
          lda:  { start: 'OP:27', end: 'PAV:09' }
        },
        '09': {
          tora: { start: 'PAV:09', end: 'THR:27' },
          toda: { start: 'PAV:09', end: 'THR:27' },
          asda: { start: 'PAV:09', end: 'PAV:27' },
          lda:  { start: 'THR:09', end: 'THR:27' }
        }
      };
      sbmi.visualOverrides = {
        '27': {
          showLabels: [],
          hideOperationalLabel: true,
          redAnchors: ['THR:27', 'PAV:27', 'INT:B'],
          restrictedSegment: { start: 'PAV:27', end: 'OP:27' },
          tableAnchors: []
        },
        '09': {
          tableAnchors: ['THR:09']
        }
      };
    })();

    function clone(v) { return JSON.parse(JSON.stringify(v)); }
    function round2(v) { return Math.round(v * 100) / 100; }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function draftStamp() {
      const d = new Date();
      const p = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
    }
    function saveTextFile(name, text) {
      const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function loadCustomBases() {
      try {
        const raw = localStorage.getItem(CUSTOM_BASES_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch { return {}; }
    }
    function saveCustomBases(obj) { localStorage.setItem(CUSTOM_BASES_KEY, JSON.stringify(obj)); }
    function loadGeometry() {
      try {
        const raw = localStorage.getItem(GEOM_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch { return {}; }
    }
    function saveGeometry() { localStorage.setItem(GEOM_KEY, JSON.stringify(currentGeometry)); }
    function mergedLibrary() { const built = clone(BUILTIN_BASES); const custom = loadCustomBases(); const out = { ...built }; Object.entries(custom).forEach(([id, pack]) => { if (!out[id]) { out[id] = pack; return; } const builtin = out[id]; const builtinSv = Number(builtin?.schemaVersion || 0); const customSv = Number(pack?.schemaVersion || 0); if (builtin?.locked && builtinSv > customSv) return; out[id] = pack; }); return out; }
    function loadUiState() {
      try {
        const raw = localStorage.getItem(STATE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch { return {}; }
    }
    function saveUiState() {
      const payload = {
        currentBaseId: state.currentBaseId,
        currentRunwayId: state.currentRunwayId,
        departureEnd: state.departureEnd,
        rto: document.getElementById('rtoInput')?.value || '',
        vizPage: 'P1',
        advancedOpen: document.getElementById('advancedToggle')?.checked || false
      };
      localStorage.setItem(STATE_KEY, JSON.stringify(payload));
    }

    function normalizeBasePack(obj) {
      const pack = clone(obj || {});
      if (pack.runway && !pack.runways) {
        const label = pack.runway.id || '00/00';
        const ends = String(label).split('/');
        const refEnd = ends[1] || ends[0] || '00';
        const oppEnd = ends[0] || refEnd;
        pack.defaultChartId = 'ADC_MAIN';
        pack.defaultRunwayId = 'RWY_' + oppEnd + '_' + refEnd;
        pack.charts = [{
          id: 'ADC_MAIN',
          label: 'ADC principal',
          asset: pack.chart,
          assetName: pack.chart,
          chartDataUrl: pack.chartDataUrl,
          size: pack.chartSize || { width: 1000, height: 1400 }
        }];
        pack.runways = [{
          id: pack.defaultRunwayId,
          label,
          chartId: 'ADC_MAIN',
          referenceEnd: refEnd,
          ends: [oppEnd, refEnd],
          lengthM: pack.runway.lengthM,
          widthM: pack.runway.widthM || 30,
          widthPx: pack.runway.widthPx || 25,
          thresholdRef: pack.runway[`threshold${refEnd}`] || pack.runway.thresholdRef,
          thresholdOpp: pack.runway[`threshold${oppEnd}`] || pack.runway.thresholdOpp,
          declaredDistances: pack.runway.declaredDistances,
          intersections: (pack.runway.intersections || []).map(it => ({
            id: it.id,
            name: it.name || it.id,
            metersFromRef: it.metersFromRef ?? it.metersFrom26 ?? 0,
            labelPoint: it.labelPoint || { x: 0, y: 0 }
          }))
        }];
      }
      if (!pack.id || !Array.isArray(pack.runways) || !pack.runways.length || !Array.isArray(pack.charts) || !pack.charts.length) {
        throw new Error('Base pack inválida.');
      }
      pack.code = pack.code || pack.id;
      pack.name = pack.name || pack.id;
      pack.engineId = pack.engineId || 'adc_generic_v1';
      pack.stability = pack.stability || 'draft';
      pack.locked = !!pack.locked;
      pack.schemaVersion = 5;
      pack.defaultChartId = pack.defaultChartId || pack.charts[0].id;
      pack.defaultRunwayId = pack.defaultRunwayId || pack.runways[0].id;
      pack.charts = pack.charts.map(ch => ({
        id: ch.id,
        label: ch.label || ch.id,
        asset: ch.asset || ch.assetName || '',
        assetName: ch.assetName || ch.asset || '',
        chartDataUrl: ch.chartDataUrl,
        size: ch.size || { width: 1000, height: 1400 }
      }));
      pack.runways = pack.runways.map(rw => {
        const ends = Array.isArray(rw.ends) && rw.ends.length >= 2 ? rw.ends.map(String) : String(rw.label || '00/00').split('/');
        const referenceEnd = String(rw.referenceEnd || ends[1] || ends[0] || '00');
        const oppositeEnd = String(ends.find(e => e !== referenceEnd) || ends[0] || referenceEnd);
        return {
          id: rw.id,
          label: rw.label || `${oppositeEnd}/${referenceEnd}`,
          chartId: rw.chartId || pack.defaultChartId,
          referenceEnd,
          ends: [oppositeEnd, referenceEnd],
          lengthM: Number(rw.lengthM || 0),
          widthM: Number(rw.widthM || 30),
          widthPx: Number(rw.widthPx || 24),
          pavementRef: { x: Number((rw.pavementRef || rw.thresholdRef)?.x || 0), y: Number((rw.pavementRef || rw.thresholdRef)?.y || 0) },
          pavementOpp: { x: Number((rw.pavementOpp || rw.thresholdOpp)?.x || 0), y: Number((rw.pavementOpp || rw.thresholdOpp)?.y || 0) },
          thresholdRef: { x: Number(rw.thresholdRef?.x || 0), y: Number(rw.thresholdRef?.y || 0) },
          thresholdOpp: { x: Number(rw.thresholdOpp?.x || 0), y: Number(rw.thresholdOpp?.y || 0) },
          declaredDistances: clone(rw.declaredDistances || {}),
          endFeatures: clone(rw.endFeatures || {}),
          distanceLogic: clone(rw.distanceLogic || {}),
          visualOverrides: clone(rw.visualOverrides || {}),
          intersections: (rw.intersections || []).map(it => ({
            id: it.id,
            name: it.name || it.id,
            metersFromRef: Number(it.metersFromRef ?? 0),
            labelPoint: { x: Number(it.labelPoint?.x || 0), y: Number(it.labelPoint?.y || 0) }
          }))
        };
      });
      return pack;
    }

    const PAGE2_ASSETS = {"SBCB":{"asset":"sbcb_chart_p2.png","label":"ADC pág. 2","size":{"width":2484,"height":3742}},"SBFS":{"asset":"sbfs_chart_p2.png","label":"ADC pág. 2","size":{"width":2484,"height":3742}},"SBGL":{"asset":"sbgl_chart_p2.png","label":"ADC pág. 2","size":{"width":2484,"height":3742}},"SBJR":{"asset":"sbjr_chart_p2.png","label":"ADC pág. 2","size":{"width":2484,"height":3742}},"SBME":{"asset":"sbme_chart_p2.png","label":"ADC pág. 2","size":{"width":2484,"height":3742}},"SBNF":{"asset":"sbnf_chart_p2.png","label":"ADC pág. 2","size":{"width":2484,"height":3742}},"SBRJ":{"asset":"sbrj_chart_p2.png","label":"ADC pág. 2","size":{"width":2484,"height":3742}},"SBVT":{"asset":"sbvt_chart_p2.png","label":"ADC pág. 2","size":{"width":2484,"height":3742}},"SBMI":{"asset":"sbmi_chart_p2.png","label":"ADC pág. 2","size":{"width":3308,"height":4678}}};

    let baseLibrary = Object.fromEntries(Object.entries(mergedLibrary()).map(([id, pack]) => [id, normalizeBasePack(pack)]));
    const currentGeometry = loadGeometry();
    const persisted = loadUiState();
    const state = {
      currentBaseId: persisted.currentBaseId && baseLibrary[persisted.currentBaseId] ? persisted.currentBaseId : 'SBNF',
      currentRunwayId: persisted.currentRunwayId || null,
      departureEnd: persisted.departureEnd || '08',
      analysis: null,
      captureMode: false,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      vizPage: 'P1',
      advancedOpen: !!persisted.advancedOpen,
      copiedAnchorPoint: null,
      chartRequestedKey: '',
      chartLoadedKey: '',
      chartRenderStamp: 0
    };
    let labelBoxes = [];

    function rawBasePack(baseId = state.currentBaseId) {
      return clone(baseLibrary[baseId]);
    }
    function getBasePack(baseId = state.currentBaseId) {
      const base = rawBasePack(baseId);
      const overrides = currentGeometry[baseId]?.runways || {};
      base.runways = base.runways.map(rw => {
        const ov = overrides[rw.id];
        if (!ov) return rw;
        const map = Object.fromEntries((ov.intersections || []).map(it => [it.id, it]));
        const mergedDeclared = clone(rw.declaredDistances || {});
        const mergedFeatures = clone(rw.endFeatures || {});
        Object.entries(ov.endData || {}).forEach(([end, payload]) => {
          if (payload?.declared) mergedDeclared[end] = { ...(mergedDeclared[end] || {}), ...clone(payload.declared) };
          if (payload?.features) mergedFeatures[end] = { ...(mergedFeatures[end] || {}), ...clone(payload.features) };
        });
        return {
          ...rw,
          pavementRef: ov.pavementRef ? clone(ov.pavementRef) : clone(rw.pavementRef || rw.thresholdRef),
          pavementOpp: ov.pavementOpp ? clone(ov.pavementOpp) : clone(rw.pavementOpp || rw.thresholdOpp),
          thresholdRef: ov.thresholdRef ? clone(ov.thresholdRef) : rw.thresholdRef,
          thresholdOpp: ov.thresholdOpp ? clone(ov.thresholdOpp) : rw.thresholdOpp,
          declaredDistances: mergedDeclared,
          endFeatures: mergedFeatures,
          distanceLogic: clone(ov.distanceLogic || rw.distanceLogic || {}),
          visualOverrides: clone(ov.visualOverrides || rw.visualOverrides || {}),
          intersections: rw.intersections.map(it => map[it.id] ? { ...it, ...clone(map[it.id]) } : it)
        };
      });
      return base;
    }
    function currentBase() { return getBasePack(state.currentBaseId); }
    function currentRunway(base = currentBase()) {
      return base.runways.find(r => r.id === state.currentRunwayId) || base.runways.find(r => r.id === base.defaultRunwayId) || base.runways[0];
    }
    function currentChart(base = currentBase(), runway = currentRunway(base)) {
      return base.charts.find(ch => ch.id === runway.chartId) || base.charts.find(ch => ch.id === base.defaultChartId) || base.charts[0];
    }
    function page2Chart(base = currentBase()) {
      return null;
    }
    function currentDisplayChart(base = currentBase(), runway = currentRunway(base)) {
      return currentChart(base, runway);
    }
    function hasPage2(base = currentBase()) {
      return false;
    }
    function currentOppositeEnd(runway = currentRunway()) {
      return runway.ends.find(e => e !== runway.referenceEnd) || runway.ends[0];
    }
    function pavementRefPoint(runway = currentRunway()) {
      return clone(runway.pavementRef || runway.thresholdRef);
    }
    function pavementOppPoint(runway = currentRunway()) {
      return clone(runway.pavementOpp || runway.thresholdOpp);
    }
    function pointForEnd(runway, end, kind = 'threshold') {
      const isRef = String(end) === String(runway.referenceEnd);
      if (kind === 'pavement') return isRef ? pavementRefPoint(runway) : pavementOppPoint(runway);
      return isRef ? clone(runway.thresholdRef) : clone(runway.thresholdOpp);
    }
    function stationMetersFromPoint(point, runway = currentRunway()) {
      const g = runwayGeometry(runway);
      const vx = point.x - g.pRef.x;
      const vy = point.y - g.pRef.y;
      const alongPx = vx * g.ux + vy * g.uy;
      const t = clamp(alongPx / g.len, 0, 1);
      return clamp(Math.round(t * runway.lengthM), 0, runway.lengthM);
    }
    function displacedMetersFromGeometry(end, runway = currentRunway()) {
      const thrStation = stationMetersFromPoint(pointForEnd(runway, end, 'threshold'), runway);
      if (String(end) === String(runway.referenceEnd)) return clamp(thrStation, 0, runway.lengthM);
      return clamp(runway.lengthM - thrStation, 0, runway.lengthM);
    }

    function depIsRef(runway = currentRunway(), dep = state.departureEnd) {
      return String(dep) === String(runway.referenceEnd);
    }
    function anchorToken(type, endOrId) {
      return `${String(type || '').toUpperCase()}:${String(endOrId || '').toUpperCase()}`;
    }
    function parseAnchorToken(token) {
      const raw = String(token || '').trim();
      if (!raw) return null;
      const parts = raw.includes(':') ? raw.split(':') : raw.split('_');
      const type = String(parts[0] || '').toUpperCase();
      const id = parts.slice(1).join(':').toUpperCase();
      if (!type || !id) return null;
      return { type, id };
    }
    function anchorLabel(token) {
      const parsed = parseAnchorToken(token);
      if (!parsed) return String(token || '');
      if (parsed.type === 'PAV') return `PAV ${parsed.id}`;
      if (parsed.type === 'THR') return `THR ${parsed.id}`;
      if (parsed.type === 'OP') return `AVOP ${parsed.id}`;
      if (parsed.type === 'INT') return parsed.id;
      return `${parsed.type} ${parsed.id}`;
    }
    function anchorMeters(runway = currentRunway(), token = '', dep = state.departureEnd) {
      const parsed = parseAnchorToken(token);
      if (!parsed) return null;
      const ref = String(runway.referenceEnd).toUpperCase();
      const opp = String(currentOppositeEnd(runway)).toUpperCase();
      const id = parsed.id;
      if (parsed.type === 'PAV') {
        return id === ref ? 0 : id === opp ? runway.lengthM : null;
      }
      if (parsed.type === 'THR') {
        if (id === ref) return stationMetersFromPoint(runway.thresholdRef, runway);
        if (id === opp) return stationMetersFromPoint(runway.thresholdOpp, runway);
        return null;
      }
      if (parsed.type === 'OP') {
        const info = operationalAnchorInfo(runway, id);
        return info ? info.metersFromRef : null;
      }
      if (parsed.type === 'INT') {
        const it = (runway.intersections || []).find(x => String(x.id).toUpperCase() === id);
        return it ? Number(it.metersFromRef) : null;
      }
      return null;
    }
    function anchorPoint(runway = currentRunway(), token = '', dep = state.departureEnd) {
      const parsed = parseAnchorToken(token);
      if (!parsed) return null;
      const ref = String(runway.referenceEnd).toUpperCase();
      const opp = String(currentOppositeEnd(runway)).toUpperCase();
      const id = parsed.id;
      if (parsed.type === 'PAV') {
        if (id === ref) return clone(runway.pavementRef || runway.thresholdRef);
        if (id === opp) return clone(runway.pavementOpp || runway.thresholdOpp);
      }
      if (parsed.type === 'THR') {
        if (id === ref) return clone(runway.thresholdRef);
        if (id === opp) return clone(runway.thresholdOpp);
      }
      if (parsed.type === 'OP') {
        const m = anchorMeters(runway, token, dep);
        return Number.isFinite(m) ? pointAtMetersFromRef(m, runway) : null;
      }
      if (parsed.type === 'INT') {
        const it = (runway.intersections || []).find(x => String(x.id).toUpperCase() === id);
        if (!it) return null;
        return pointAtMetersFromRef(Number(it.metersFromRef), runway);
      }
      return null;
    }
    function orientedDistanceMeters(fromMeters, toMeters, runway = currentRunway(), dep = state.departureEnd) {
      return depIsRef(runway, dep) ? (toMeters - fromMeters) : (fromMeters - toMeters);
    }
    function stationAtOffsetFromStart(startMeters, offsetMeters, runway = currentRunway(), dep = state.departureEnd) {
      return depIsRef(runway, dep) ? (startMeters + offsetMeters) : (startMeters - offsetMeters);
    }
    function defaultDistanceLogic(runway = currentRunway(), dep = state.departureEnd) {
      const profile = metricProfile(runway, dep);
      const anchorForKind = (kind) => {
        const ref = String(runway.referenceEnd).toUpperCase();
        const opp = String(currentOppositeEnd(runway)).toUpperCase();
        if (kind === 'pavementRef') return anchorToken('PAV', ref);
        if (kind === 'pavementOpp') return anchorToken('PAV', opp);
        if (kind === 'thresholdRef') return anchorToken('THR', ref);
        if (kind === 'thresholdOpp') return anchorToken('THR', opp);
        if (kind === 'operationalRef') return anchorToken('OP', ref);
        if (kind === 'operationalOpp') return anchorToken('OP', opp);
        return anchorToken('PAV', String(dep).toUpperCase());
      };
      return {
        tora: { start: anchorForKind(profile.startKind), end: anchorForKind(profile.toraEndKind) },
        toda: { start: anchorForKind(profile.startKind), end: anchorForKind(profile.todaEndKind) },
        asda: { start: anchorForKind(profile.startKind), end: anchorForKind(profile.asdaEndKind) },
        lda: { start: anchorForKind(profile.ldaStartKind), end: anchorForKind(profile.ldaEndKind) }
      };
    }
    function distanceLogicFor(runway = currentRunway(), dep = state.departureEnd) {
      const defaults = defaultDistanceLogic(runway, dep);
      const custom = clone(runway.distanceLogic?.[dep] || {});
      const mergeMetric = (name) => ({ ...(defaults[name] || {}), ...(custom[name] || {}) });
      return {
        tora: mergeMetric('tora'),
        toda: mergeMetric('toda'),
        asda: mergeMetric('asda'),
        lda: mergeMetric('lda')
      };
    }
    function visualOverrideFor(runway = currentRunway(), dep = state.departureEnd) {
      return clone(runway.visualOverrides?.[dep] || {});
    }

    function activeGeometryRecord(baseId = state.currentBaseId, runwayId = state.currentRunwayId || currentRunway(getBasePack(baseId)).id) {
      if (!currentGeometry[baseId]) currentGeometry[baseId] = { runways: {} };
      if (!currentGeometry[baseId].runways) currentGeometry[baseId].runways = {};
      if (!currentGeometry[baseId].runways[runwayId]) {
        const base = getBasePack(baseId);
        const rw = base.runways.find(r => r.id === runwayId) || base.runways[0];
        currentGeometry[baseId].runways[runwayId] = {
          pavementRef: clone(rw.pavementRef || rw.thresholdRef),
          pavementOpp: clone(rw.pavementOpp || rw.thresholdOpp),
          thresholdRef: clone(rw.thresholdRef),
          thresholdOpp: clone(rw.thresholdOpp),
          intersections: rw.intersections.map(it => ({ id: it.id, metersFromRef: it.metersFromRef, labelPoint: clone(it.labelPoint) })),
          endData: Object.fromEntries((rw.ends || []).map(end => [end, {
            declared: clone(rw.declaredDistances?.[end] || { tora: rw.lengthM, toda: rw.lengthM, asda: rw.lengthM, lda: rw.lengthM }),
            features: clone(rw.endFeatures?.[end] || { displacedThresholdM: 0, stopwayM: 0, clearwayM: 0, operationalStartM: 0 })
          }]))
        };
      }
      const rec = currentGeometry[baseId].runways[runwayId];
      const base = getBasePack(baseId);
      const rw = base.runways.find(r => r.id === runwayId) || base.runways[0];
      if (!rec.pavementRef) rec.pavementRef = clone(rw.pavementRef || rw.thresholdRef);
      if (!rec.pavementOpp) rec.pavementOpp = clone(rw.pavementOpp || rw.thresholdOpp);
      if (!rec.thresholdRef) rec.thresholdRef = clone(rw.thresholdRef);
      if (!rec.thresholdOpp) rec.thresholdOpp = clone(rw.thresholdOpp);
      return rec;
    }

    function chartSource(base = currentBase(), runway = currentRunway(base)) {
      const chart = currentDisplayChart(base, runway);
      return chart.chartDataUrl || chart.asset || chart.assetName || '';
    }

    function chartKey(src) {
      const raw = String(src || '').trim();
      if (!raw) return '';
      try {
        const url = new URL(raw, window.location.href);
        return url.pathname.split('/').pop() || raw;
      } catch {
        return raw.split('?')[0].split('#')[0].split('/').pop() || raw;
      }
    }

    function runwayGeometry(runway = currentRunway()) {
      const pRef = runway.pavementRef || runway.thresholdRef;
      const pOpp = runway.pavementOpp || runway.thresholdOpp;
      const dx = pOpp.x - pRef.x;
      const dy = pOpp.y - pRef.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      return { pRef, pOpp, dx, dy, len, ux: dx / len, uy: dy / len, px: -dy / len, py: dx / len };
    }
    function pointAtMetersFromRef(meters, runway = currentRunway()) {
      const g = runwayGeometry(runway);
      const t = meters / runway.lengthM;
      return { x: g.pRef.x + g.dx * t, y: g.pRef.y + g.dy * t };
    }
    function projectPointToRunwayMeters(point, runway = currentRunway()) {
      return stationMetersFromPoint(point, runway);
    }
    function departureMeta(runway = currentRunway(), dep = state.departureEnd) {
      const ref = runway.referenceEnd;
      const opp = currentOppositeEnd(runway);
      const features = selectedEndFeatures(runway, dep);
      const operationalStartM = Number(features?.operationalStartM || 0);
      const profile = metricProfile(runway, dep);
      const startKind = profile.startKind;
      const startStationMetersFromRef = metersForKind(runway, startKind, dep);
      const startLabel = startLabelForKind(dep, startKind);
      return dep === opp
        ? { startThr: opp, startLabel, endThr: ref, fullLengthMetersFromRef: startStationMetersFromRef, startStationMetersFromRef, ref, opp, operationalStartM, startKind, profile }
        : { startThr: ref, startLabel, endThr: opp, fullLengthMetersFromRef: startStationMetersFromRef, startStationMetersFromRef, ref, opp, operationalStartM, startKind, profile };
    }
    function distanceFromStart(startMetersFromRef, runway = currentRunway(), dep = state.departureEnd) {
      const meta = departureMeta(runway, dep);
      return dep === currentOppositeEnd(runway) ? meta.startStationMetersFromRef - startMetersFromRef : startMetersFromRef - meta.startStationMetersFromRef;
    }
    function gateMetersFromRef(gateOffsetFromStart, runway = currentRunway(), dep = state.departureEnd) {
      const meta = departureMeta(runway, dep);
      return dep === currentOppositeEnd(runway) ? meta.startStationMetersFromRef - gateOffsetFromStart : meta.startStationMetersFromRef + gateOffsetFromStart;
    }
    function selectedDeclared(runway = currentRunway(), dep = state.departureEnd) {
      return clone(runway.declaredDistances?.[dep] || { tora: runway.lengthM, toda: runway.lengthM, asda: runway.lengthM, lda: runway.lengthM });
    }
    function selectedEndFeatures(runway = currentRunway(), dep = state.departureEnd) {
      return clone(runway.endFeatures?.[dep] || { displacedThresholdM: 0, stopwayM: 0, clearwayM: 0, operationalStartM: 0 });
    }
    function selectedOperationalStartM(runway = currentRunway(), dep = state.departureEnd) {
      return Number(selectedEndFeatures(runway, dep)?.operationalStartM || 0);
    }
    function currentEndConfig(runway = currentRunway(), dep = state.departureEnd) {
      return { declared: selectedDeclared(runway, dep), features: selectedEndFeatures(runway, dep) };
    }
    function metricProfile(runway = currentRunway(), dep = state.departureEnd) {
      const ref = runway.referenceEnd;
      const depIsRef = String(dep) === String(ref);
      const baseCode = String(currentBase()?.code || '').toUpperCase();
      const thresholdOperationalBases = new Set(['SBVT','SBME','SBFS','SBRJ','SBNF']);
      const baseProfile = {
        startKind: depIsRef ? 'pavementRef' : 'pavementOpp',
        asdaEndKind: depIsRef ? 'pavementOpp' : 'pavementRef',
        toraEndKind: depIsRef ? 'thresholdOpp' : 'thresholdRef',
        todaEndKind: depIsRef ? 'thresholdOpp' : 'thresholdRef',
        ldaStartKind: depIsRef ? 'thresholdRef' : 'thresholdOpp',
        ldaEndKind: depIsRef ? 'thresholdOpp' : 'thresholdRef'
      };
      if (thresholdOperationalBases.has(baseCode)) {
        baseProfile.startKind = depIsRef ? 'thresholdRef' : 'thresholdOpp';
      }
      if (baseCode === 'SBMI' && String(runway.id) === 'RWY_09_27') {
        if (String(dep) === '27') {
          baseProfile.startKind = 'operationalRef';
          baseProfile.asdaEndKind = 'pavementOpp';
          baseProfile.toraEndKind = 'pavementOpp';
          baseProfile.todaEndKind = 'pavementOpp';
          baseProfile.ldaStartKind = 'operationalRef';
          baseProfile.ldaEndKind = 'pavementOpp';
        } else if (String(dep) === '09') {
          baseProfile.startKind = 'pavementOpp';
          baseProfile.asdaEndKind = 'pavementRef';
          baseProfile.toraEndKind = 'thresholdRef';
          baseProfile.todaEndKind = 'thresholdRef';
          baseProfile.ldaStartKind = 'thresholdOpp';
          baseProfile.ldaEndKind = 'thresholdRef';
        }
      }
      return baseProfile;
    }
    function metersForKind(runway = currentRunway(), kind = 'pavementRef', dep = state.departureEnd) {
      const ref = runway.referenceEnd;
      const opp = currentOppositeEnd(runway);
      if (kind === 'pavementRef') return 0;
      if (kind === 'pavementOpp') return runway.lengthM;
      if (kind === 'thresholdRef') return stationMetersFromPoint(runway.thresholdRef, runway);
      if (kind === 'thresholdOpp') return stationMetersFromPoint(runway.thresholdOpp, runway);
      if (kind === 'operationalRef') {
        const info = operationalAnchorInfo(runway, ref);
        return info ? info.metersFromRef : 0;
      }
      if (kind === 'operationalOpp') {
        const info = operationalAnchorInfo(runway, opp);
        return info ? info.metersFromRef : runway.lengthM;
      }
      return String(dep) === String(ref) ? 0 : runway.lengthM;
    }
    function pointForKind(runway = currentRunway(), kind = 'pavementRef', dep = state.departureEnd) {
      if (kind === 'pavementRef') return clone(runway.pavementRef || runway.thresholdRef);
      if (kind === 'pavementOpp') return clone(runway.pavementOpp || runway.thresholdOpp);
      if (kind === 'thresholdRef') return clone(runway.thresholdRef);
      if (kind === 'thresholdOpp') return clone(runway.thresholdOpp);
      return pointAtMetersFromRef(metersForKind(runway, kind, dep), runway);
    }
    function startLabelForKind(dep, kind) {
      if (kind === 'operationalRef' || kind === 'operationalOpp') return `AVOP ${dep}`;
      if (kind === 'pavementRef' || kind === 'pavementOpp') return `PAV ${dep}`;
      return String(dep);
    }
    function isSbmiRunway(runway = currentRunway()) {
      return String(currentBase()?.code || '') === 'SBMI' && String(runway?.id || '') === 'RWY_09_27';
    }
    function isSbmiRestricted27(runway = currentRunway(), dep = state.departureEnd) {
      return isSbmiRunway(runway) && String(dep) === '27';
    }
    function specialAnalysisRows(base, runway, dep) {
      const override = visualOverrideFor(runway, dep);
      return (override.tableAnchors || []).map((token, idx) => ({
        id: `ANCHOR_${idx}_${String(token).replace(/[^A-Z0-9]+/ig, '_')}`,
        name: anchorLabel(token),
        metersFromRef: anchorMeters(runway, token, dep),
        labelPoint: anchorPoint(runway, token, dep),
        kind: 'anchor',
        anchorToken: token
      })).filter(r => Number.isFinite(r.metersFromRef));
    }
    function markerColorFor(runway, dep, kind, endOrId) {
      const override = visualOverrideFor(runway, dep);
      const token = kind === 'intersection'
        ? anchorToken('INT', endOrId)
        : kind === 'pavement'
          ? anchorToken('PAV', endOrId)
          : anchorToken('THR', endOrId);
      if ((override.redAnchors || []).map(String).includes(token)) return '#ef4444';
      if (isSbmiRestricted27(runway, dep)) {
        if ((kind === 'pavement' || kind === 'threshold') && String(endOrId) === '27') return '#ef4444';
        if (kind === 'intersection' && String(endOrId) === 'B') return '#ef4444';
      }
      if (kind === 'pavement') return '#f59e0b';
      if (kind === 'threshold') return '#22d3ee';
      return 'rgba(139,92,246,.80)';
    }

    function operationalAnchorInfo(runway = currentRunway(), end = null) {
      const targetEnd = end || state.departureEnd;
      if (!targetEnd) return null;
      const ref = runway.referenceEnd;
      const features = runway.endFeatures?.[targetEnd] || {};
      const op = Number(features.operationalStartM || 0);
      if (!(op > 0)) return null;
      const metersFromRef = String(targetEnd) === String(ref) ? Math.min(runway.lengthM, op) : Math.max(0, runway.lengthM - op);
      return { end: targetEnd, metersFromRef, key: String(targetEnd) === String(ref) ? 'operationalRef' : 'operationalOpp', label: `AVOP ${targetEnd}` };
    }

    const canvas = document.getElementById('vizCanvas');
    const ctx = canvas.getContext('2d');
    const vizWrap = document.getElementById('vizWrap');
    const captureBanner = document.getElementById('captureBanner');
    const chartImg = new Image();
    const mainView = document.querySelector('.right');
    chartImg.onload = () => { state.chartLoadedKey = chartKey(chartImg.currentSrc || chartImg.src || state.chartRequestedKey); state.chartRenderStamp += 1; resizeCanvas(); draw(); };
    chartImg.onerror = () => {
      const base = currentBase();
      const runway = currentRunway(base);
      const fallback = currentChart(base, runway);
      chartImg.src = fallback.chartDataUrl || fallback.asset || fallback.assetName || '';
      document.getElementById('vizSubtitle').textContent = `${base.id} • falha ao carregar a carta solicitada.`;
    };

    function fixedFitTransform() {
      const base = currentBase();
      const runway = currentRunway(base);
      const chart = currentDisplayChart(base, runway);
      const rect = vizWrap.getBoundingClientRect();
      const scale = rect.width / chart.size.width;
      const drawW = chart.size.width * scale;
      const drawH = chart.size.height * scale;
      return { scale, offsetX: 0, offsetY: 0, drawW, drawH };
    }
    function resizeCanvas() {
      const base = currentBase();
      const runway = currentRunway(base);
      const chart = currentDisplayChart(base, runway);
      const width = Math.max(1, vizWrap.clientWidth || vizWrap.getBoundingClientRect().width || chart.size.width);
      const targetHeight = Math.round(width * (chart.size.height / chart.size.width));
      vizWrap.style.height = targetHeight + 'px';
      const rect = vizWrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fit = fixedFitTransform();
      state.scale = fit.scale;
      state.offsetX = fit.offsetX;
      state.offsetY = fit.offsetY;
      draw();
    }
    function toScreen(p) { return { x: p.x * state.scale + state.offsetX, y: p.y * state.scale + state.offsetY }; }
    function fromScreen(x, y) { return { x: (x - state.offsetX) / state.scale, y: (y - state.offsetY) / state.scale }; }

    function renderChartPageControls() {
      state.vizPage = 'P1';
      const toggle = document.getElementById('pageToggle');
      if (toggle) toggle.hidden = true;
    }
    function setVizPage(page) {
      state.vizPage = 'P1';
      renderChartPageControls();
      loadCurrentChart();
      draw();
      saveUiState();
    }

    function setCurrentBase(baseId) {
      state.currentBaseId = baseId;
      const base = currentBase();
      state.currentRunwayId = base.runways.find(r => r.id === state.currentRunwayId)?.id || base.defaultRunwayId || base.runways[0].id;
      refreshBaseOptions();
      refreshDepartureOptions();
      refreshFineTuneOptions();
      renderChartPageControls();
      loadCurrentChart();
      renderLibraryStatus();
      renderBaseInfo();
      renderAnchorTable();
      renderDeclaredInputs();
      analyze();
      saveUiState();
    }
    function setCurrentRunway(runwayId) {
      state.currentRunwayId = runwayId;
      refreshDepartureOptions();
      refreshFineTuneOptions();
      renderChartPageControls();
      loadCurrentChart();
      renderLibraryStatus();
      renderBaseInfo();
      renderAnchorTable();
      renderDeclaredInputs();
      analyze();
      saveUiState();
    }
    function loadCurrentChart() {
      const base = currentBase();
      const runway = currentRunway(base);
      renderChartPageControls();
      const chart = currentDisplayChart(base, runway);
      const src = chartSource(base, runway);
      state.chartRequestedKey = chartKey(src);
      state.chartLoadedKey = '';
      if (chartImg.src !== src) chartImg.src = src; else if (src) chartImg.src = src + (src.includes('?') ? '&' : '?') + 'v=' + Date.now();
      document.getElementById('vizSubtitle').textContent = `${base.id} • ${runway.label} • ${chart.label} • toque na carta para abrir em tela cheia.`;
    }

    function analyze() {
      const token = document.getElementById('departureEndSelect').value;
      const parsed = parseDepartureToken(token);
      if (parsed.runwayId) state.currentRunwayId = parsed.runwayId;
      const dep = parsed.dep || state.departureEnd;
      const base = currentBase();
      const runway = currentRunway(base);
      const rto = Number(document.getElementById('rtoInput').value || 0);
      state.departureEnd = dep;
      const engine = ENGINE_REGISTRY[base.engineId] || ENGINE_REGISTRY.adc_generic_v1;
      state.analysis = engine.analyze({ base, runway, dep, rto });
      renderLibraryStatus();
      renderBaseInfo();
      renderDeclaredInputs();
      renderResults();
      draw();
      saveUiState();
    }

    function renderBaseInfo() {
      const runway = currentRunway(currentBase());
      const dep = state.departureEnd;
      const dd = selectedDeclared(runway, dep);
      const asdaMetric = document.getElementById('asdaMetric');
      if (asdaMetric) asdaMetric.textContent = `${Math.round(dd.asda)} m`;
      const meta = document.getElementById('declaredMeta');
      if (meta) {
        const items = [
          `TORA ${Math.round(dd.tora)} m`,
          `TODA ${Math.round(dd.toda)} m`,
          `LDA ${Math.round(dd.lda)} m`
        ];
        const features = selectedEndFeatures(runway, dep);
        const displacedGeom = displacedMetersFromGeometry(dep, runway);
        const displacedShown = Math.max(Number(features.displacedThresholdM || 0), Number(displacedGeom || 0));
        if (displacedShown > 0) items.push(`THR desloc. ${Math.round(displacedShown)} m`);
        if (features.stopwayM > 0) items.push(`Stopway ${Math.round(features.stopwayM)} m`);
        if (features.clearwayM > 0) items.push(`Clearway ${Math.round(features.clearwayM)} m`);
        if (features.operationalStartM > 0) items.push(`Início op. ${Math.round(features.operationalStartM)} m`);
        meta.innerHTML = items.map(txt => `<span class="declared-chip">${txt}</span>`).join('');
      }
    }
    function renderDeclaredInputs() {
      const dep = state.departureEnd;
      const cfg = currentEndConfig();
      const label = document.getElementById('declaredEndLabel');
      if (label) label.textContent = dep || '-';
      const setv = (id, v) => { const el = document.getElementById(id); if (el) el.value = Number(v || 0); };
      setv('declaredToraInput', cfg.declared.tora);
      setv('declaredTodaInput', cfg.declared.toda);
      setv('declaredAsdaInput', cfg.declared.asda);
      setv('declaredLdaInput', cfg.declared.lda);
      setv('displacedInput', Math.max(Number(cfg.features.displacedThresholdM || 0), Number(displacedMetersFromGeometry(dep, currentRunway()) || 0)));
      setv('stopwayInput', cfg.features.stopwayM);
      setv('clearwayInput', cfg.features.clearwayM);
      setv('operationalStartInput', cfg.features.operationalStartM || 0);
    }
    function applyDeclaredInputs() {
      const end = state.departureEnd;
      const rec = activeGeometryRecord();
      const getn = id => Number(document.getElementById(id)?.value || 0);
      const tora = getn('declaredToraInput');
      const toda = getn('declaredTodaInput') || tora;
      const asda = getn('declaredAsdaInput') || tora;
      const lda = getn('declaredLdaInput') || tora;
      rec.endData = rec.endData || {};
      rec.endData[end] = {
        declared: { tora, toda, asda, lda },
        features: {
          displacedThresholdM: getn('displacedInput'),
          stopwayM: getn('stopwayInput'),
          clearwayM: getn('clearwayInput'),
          operationalStartM: getn('operationalStartInput')
        }
      };
      setThresholdFromDeclaredForEnd(end, true);
      saveGeometry();
      renderDeclaredInputs();
      renderAnchorTable();
      analyze();
    }
    function resetDeclaredInputs() {
      const rawBase = rawBasePack();
      const rawRunway = rawBase.runways.find(r => r.id === state.currentRunwayId) || rawBase.runways[0];
      const end = state.departureEnd;
      const rec = activeGeometryRecord();
      rec.endData = rec.endData || {};
      rec.endData[end] = {
        declared: clone(rawRunway.declaredDistances?.[end] || { tora: rawRunway.lengthM, toda: rawRunway.lengthM, asda: rawRunway.lengthM, lda: rawRunway.lengthM }),
        features: clone(rawRunway.endFeatures?.[end] || { displacedThresholdM: 0, stopwayM: 0, clearwayM: 0, operationalStartM: 0 })
      };
      saveGeometry();
      renderDeclaredInputs();
      renderAnchorTable();
      analyze();
    }
    function renderResults() {
      const a = state.analysis;
      if (!a) return;
      const asdaMetric = document.getElementById('asdaMetric');
      if (asdaMetric) asdaMetric.textContent = `${Math.round(a.declared.asda)} m`;
      document.getElementById('decisionTable').innerHTML = a.rows.map(r => `
        <tr>
          <td>${r.name}</td>
          <td>${Math.round(r.availableAsda)} m</td>
          <td class="${r.rtoOk ? 'yes' : 'no'}">${r.rtoOk ? 'OK' : 'NO'}</td>
        </tr>`).join('');
    }

    function renderLibraryStatus() {
      const base = currentBase();
      const runway = currentRunway(base);
      const engine = ENGINE_REGISTRY[base.engineId] || ENGINE_REGISTRY.adc_generic_v1;
      document.getElementById('libraryStatusChips').innerHTML = [
        `<span class="chip">Base ${base.id}</span>`,
        `<span class="chip">Pista ${runway.label}</span>`,
        `<span class="chip">Engine ${engine.id}</span>`,
        `<span class="chip ${base.stability === 'stable' ? 'ok' : 'bad'}">${base.stability || 'draft'}</span>`,
        `<span class="chip ${base.locked ? 'ok' : 'bad'}">${base.locked ? 'locked' : 'editável'}</span>`,
        `<span class="chip">schema v${base.schemaVersion || 4}</span>`
      ].join('');
    }

    function refreshBaseOptions() {
      const select = document.getElementById('baseSelect');
      const ids = Object.keys(baseLibrary).sort();
      select.innerHTML = ids.map(id => `<option value="${id}">${id}</option>`).join('');
      if (!ids.includes(state.currentBaseId)) state.currentBaseId = ids[0];
      select.value = state.currentBaseId;
    }
    function parseDepartureToken(token) {
      const [runwayId, dep] = String(token || '').split('::');
      return { runwayId, dep };
    }
    function refreshDepartureOptions() {
      const base = currentBase();
      const select = document.getElementById('departureEndSelect');
      const options = [];
      base.runways.forEach(rw => {
        (rw.ends || []).forEach(end => options.push({ token: `${rw.id}::${end}`, runwayId: rw.id, dep: end, label: end }));
      });
      select.innerHTML = options.map(o => `<option value="${o.token}">${o.label}</option>`).join('');
      let selected = options.find(o => o.runwayId === state.currentRunwayId && o.dep === state.departureEnd);
      if (!selected) {
        const defaultRw = base.runways.find(r => r.id === state.currentRunwayId) || base.runways.find(r => r.id === base.defaultRunwayId) || base.runways[0];
        const defaultDep = (defaultRw.ends || [defaultRw.referenceEnd])[0];
        selected = options.find(o => o.runwayId === defaultRw.id && o.dep === defaultDep) || options[0];
      }
      if (selected) {
        state.currentRunwayId = selected.runwayId;
        state.departureEnd = selected.dep;
        select.value = selected.token;
      }
    }
    function setCurrentDeparture(token) {
      const parsed = parseDepartureToken(token);
      const base = currentBase();
      if (parsed.runwayId && base.runways.some(r => r.id === parsed.runwayId)) state.currentRunwayId = parsed.runwayId;
      if (parsed.dep) state.departureEnd = parsed.dep;
      refreshDepartureOptions();
      refreshFineTuneOptions();
      renderChartPageControls();
      loadCurrentChart();
      renderLibraryStatus();
      renderBaseInfo();
      renderAnchorTable();
      renderDeclaredInputs();
      analyze();
      saveUiState();
    }

    function anchorKeys() {
      const runway = currentRunway();
      const ref = runway.referenceEnd;
      const opp = currentOppositeEnd(runway);
      const keys = [
        { key: 'pavementRef', label: `Pavimento ${ref}` },
        { key: 'thresholdRef', label: `Cabeceira ${ref}` }
      ];
      const opRef = operationalAnchorInfo(runway, ref);
      if (opRef) keys.push({ key: opRef.key, label: opRef.label });
      const opOpp = operationalAnchorInfo(runway, opp);
      if (opOpp) keys.push({ key: opOpp.key, label: opOpp.label });
      keys.push(
        { key: 'thresholdOpp', label: `Cabeceira ${opp}` },
        { key: 'pavementOpp', label: `Pavimento ${opp}` }
      );
      runway.intersections.forEach(it => {
        keys.push({ key: `axis_${it.id}`, label: `${it.name} eixo` });
        keys.push({ key: `label_${it.id}`, label: `${it.name} rótulo` });
      });
      return keys;
    }
    function refreshFineTuneOptions() {
      const select = document.getElementById('anchorSelect');
      if (!select) return;
      const keys = anchorKeys();
      const prev = select.value || '';
      select.innerHTML = ['<option value="">— sem seleção —</option>', ...keys.map(k => `<option value="${k.key}">${k.label}</option>`)].join('');
      select.value = keys.some(k => k.key === prev) ? prev : '';
    }
    function selectedAnchorKey() { return document.getElementById('anchorSelect')?.value || ''; }
    function selectedAnchorLabel() { const key = selectedAnchorKey(); return anchorKeys().find(k => k.key === key)?.label || key; }
    function getIntersectionRecord(rec, runway, id) {
      return (rec.intersections || []).find(x => x.id === id) || runway.intersections.find(x => x.id === id);
    }
    function getAnchorPointByKey(key, runway = currentRunway(), rec = activeGeometryRecord()) {
      if (!key) return null;
      if (key === 'pavementRef') return clone(rec.pavementRef || runway.pavementRef || runway.thresholdRef);
      if (key === 'thresholdRef') return clone(rec.thresholdRef || runway.thresholdRef);
      if (key === 'thresholdOpp') return clone(rec.thresholdOpp || runway.thresholdOpp);
      if (key === 'pavementOpp') return clone(rec.pavementOpp || runway.pavementOpp || runway.thresholdOpp);
      if (key === 'operationalRef') { const info = operationalAnchorInfo(runway, runway.referenceEnd); return info ? pointAtMetersFromRef(info.metersFromRef, runway) : null; }
      if (key === 'operationalOpp') { const info = operationalAnchorInfo(runway, currentOppositeEnd(runway)); return info ? pointAtMetersFromRef(info.metersFromRef, runway) : null; }
      if (key.startsWith('axis_')) {
        const id = key.replace('axis_', '');
        const it = getIntersectionRecord(rec, runway, id);
        if (!it) return null;
        return pointAtMetersFromRef(it.metersFromRef, runway);
      }
      if (key.startsWith('label_')) {
        const id = key.replace('label_', '');
        const it = getIntersectionRecord(rec, runway, id);
        if (!it?.labelPoint) return null;
        return clone(it.labelPoint);
      }
      return null;
    }
    function applyPointToAnchorKey(key, chartPoint, runway = currentRunway(), rec = activeGeometryRecord()) {
      if (key === 'pavementRef') {
        rec.pavementRef = { x: round2(chartPoint.x), y: round2(chartPoint.y) };
      } else if (key === 'thresholdRef') {
        rec.thresholdRef = { x: round2(chartPoint.x), y: round2(chartPoint.y) };
      } else if (key === 'thresholdOpp') {
        rec.thresholdOpp = { x: round2(chartPoint.x), y: round2(chartPoint.y) };
      } else if (key === 'pavementOpp') {
        rec.pavementOpp = { x: round2(chartPoint.x), y: round2(chartPoint.y) };
      } else if (key === 'operationalRef' || key === 'operationalOpp') {
        const end = key === 'operationalRef' ? runway.referenceEnd : currentOppositeEnd(runway);
        const proj = projectPointToRunwayMeters(chartPoint, runway);
        const opFromEnd = key === 'operationalRef' ? proj : Math.max(0, runway.lengthM - proj);
        rec.endFeatures = rec.endFeatures || {};
        rec.endFeatures[end] = rec.endFeatures[end] || clone(runway.endFeatures?.[end] || { displacedThresholdM: 0, stopwayM: 0, clearwayM: 0, operationalStartM: 0 });
        rec.endFeatures[end].operationalStartM = round2(clamp(opFromEnd, 0, runway.lengthM));
      } else if (key.startsWith('axis_')) {
        const id = key.replace('axis_', '');
        rec.intersections = Array.isArray(rec.intersections) ? rec.intersections : runway.intersections.map(it => ({ id: it.id, metersFromRef: it.metersFromRef, labelPoint: clone(it.labelPoint) }));
        const it = rec.intersections.find(x => x.id === id);
        if (it) it.metersFromRef = projectPointToRunwayMeters(chartPoint, runway);
      } else if (key.startsWith('label_')) {
        const id = key.replace('label_', '');
        rec.intersections = Array.isArray(rec.intersections) ? rec.intersections : runway.intersections.map(it => ({ id: it.id, metersFromRef: it.metersFromRef, labelPoint: clone(it.labelPoint) }));
        const it = rec.intersections.find(x => x.id === id);
        if (it) it.labelPoint = { x: round2(chartPoint.x), y: round2(chartPoint.y) };
      }
    }
    function copySelectedAnchorPoint() {
      const key = selectedAnchorKey();
      const pt = getAnchorPointByKey(key);
      if (!pt) { window.alert('Não foi possível copiar a coordenada dessa âncora.'); return; }
      state.copiedAnchorPoint = { key, label: selectedAnchorLabel(), x: round2(pt.x), y: round2(pt.y) };
      window.alert(`Coordenada copiada: ${state.copiedAnchorPoint.label} (${state.copiedAnchorPoint.x}, ${state.copiedAnchorPoint.y})`);
    }
    function pasteCopiedAnchorPoint() {
      const copied = state.copiedAnchorPoint;
      if (!copied) { window.alert('Nenhuma coordenada copiada.'); return; }
      const key = selectedAnchorKey();
      if (!key) { window.alert('Selecione a âncora de destino.'); return; }
      applyPointToAnchorKey(key, copied);
      saveGeometry();
      renderAnchorTable();
      analyze();
      window.alert(`Destino ${selectedAnchorLabel()} igualado a ${copied.label}.`);
    }

    function setThresholdFromDeclaredForEnd(end, silent = false) {
      const runway = currentRunway();
      const rec = activeGeometryRecord();
      const features = (rec.endData && rec.endData[end] && rec.endData[end].features) || selectedEndFeatures(runway, end);
      const displaced = Number(features?.displacedThresholdM || 0);
      const station = String(end) === String(runway.referenceEnd)
        ? displaced
        : Math.max(0, runway.lengthM - displaced);
      const p = pointAtMetersFromRef(station, runway);
      if (String(end) === String(runway.referenceEnd)) {
        rec.thresholdRef = { x: round2(p.x), y: round2(p.y) };
      } else {
        rec.thresholdOpp = { x: round2(p.x), y: round2(p.y) };
      }
      if (!silent) {
        saveGeometry();
        renderDeclaredInputs();
        renderAnchorTable();
        analyze();
      }
    }

    function applyDeclaredDisplacementForActiveEnd() {
      const end = state.departureEnd;
      if (!end) return;
      setThresholdFromDeclaredForEnd(end);
      window.alert(`Cabeceira ${end} ajustada para a distância declarada.`);
    }

    function normalizeRunwayByDeclared() {
      const runway = currentRunway();
      (runway.ends || []).forEach(end => setThresholdFromDeclaredForEnd(end, true));
      saveGeometry();
      renderDeclaredInputs();
      renderAnchorTable();
      analyze();
      window.alert(`Pista ${runway.label} normalizada pelas distâncias declaradas.`);
    }

    function exportGeometryObject() {
      return clone(activeGeometryRecord());
    }
    function persistCurrentRunwayGeometry() {
      const baseId = state.currentBaseId;
      const runwayId = state.currentRunwayId;
      const runway = currentRunway();
      if (!currentGeometry[baseId]) currentGeometry[baseId] = { runways: {} };
      currentGeometry[baseId].runways[runwayId] = {
        pavementRef: clone(runway.pavementRef || runway.thresholdRef),
        pavementOpp: clone(runway.pavementOpp || runway.thresholdOpp),
        thresholdRef: clone(runway.thresholdRef),
        thresholdOpp: clone(runway.thresholdOpp),
        intersections: runway.intersections.map(it => ({ id: it.id, metersFromRef: it.metersFromRef, labelPoint: clone(it.labelPoint) })),
        endData: Object.fromEntries((runway.ends || []).map(end => [end, {
          declared: clone(runway.declaredDistances?.[end] || { tora: runway.lengthM, toda: runway.lengthM, asda: runway.lengthM, lda: runway.lengthM }),
          features: clone(runway.endFeatures?.[end] || { displacedThresholdM: 0, stopwayM: 0, clearwayM: 0, operationalStartM: 0 })
        }]))
      };
      saveGeometry();
    }
    function nextIntersectionId(runway) {
      const used = new Set(runway.intersections.map(it => String(it.id || '').toUpperCase()));
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (const c of alphabet) {
        if (!used.has(c)) return c;
      }
      let n = 1;
      while (used.has(`X${n}`)) n += 1;
      return `X${n}`;
    }
    function addAnchor() {
      const runway = currentRunway();
      const rec = activeGeometryRecord();
      const suggestion = nextIntersectionId(runway);
      const rawId = window.prompt('Identificador da nova âncora/TWY', suggestion);
      if (rawId === null) return;
      const id = rawId.trim().toUpperCase();
      if (!id) { window.alert('Informe um identificador.'); return; }
      if ((rec.intersections || []).some(it => String(it.id).toUpperCase() === id) || runway.intersections.some(it => String(it.id).toUpperCase() === id)) {
        window.alert('Já existe uma âncora com esse identificador nesta pista.');
        return;
      }
      const selected = selectedAnchorKey();
      let suggestedMeters = Math.round(runway.lengthM / 2);
      if (selected.startsWith('axis_') || selected.startsWith('label_')) {
        const selId = selected.split('_').slice(1).join('_');
        const current = (rec.intersections || []).find(it => it.id === selId) || runway.intersections.find(it => it.id === selId);
        if (current) suggestedMeters = Math.round(current.metersFromRef);
      }
      const rawMeters = window.prompt(`Metros a partir da cabeceira ${runway.referenceEnd}`, String(suggestedMeters));
      if (rawMeters === null) return;
      const metersFromRef = clamp(Math.round(Number(rawMeters) || 0), 0, runway.lengthM);
      const axisPoint = pointAtMetersFromRef(metersFromRef, runway);
      const labelPoint = { x: round2(axisPoint.x + 26), y: round2(axisPoint.y - 26) };
      rec.intersections = Array.isArray(rec.intersections) ? rec.intersections : [];
      rec.intersections.push({ id, name: `TWY ${id}`, metersFromRef, labelPoint });
      rec.intersections.sort((a,b)=>a.metersFromRef-b.metersFromRef);
      saveGeometry();
      refreshFineTuneOptions();
      document.getElementById('anchorSelect').value = `label_${id}`;
      renderAnchorTable();
      analyze();
    }
    function deleteAnchor() {
      const runway = currentRunway();
      const rec = activeGeometryRecord();
      const key = selectedAnchorKey();
      if (key === 'thresholdRef' || key === 'thresholdOpp' || !key) {
        window.alert('Selecione uma âncora de TWY para excluir. Cabeceiras não podem ser excluídas.');
        return;
      }
      const id = key.replace('axis_', '').replace('label_', '');
      const it = ((rec.intersections || []).find(x => x.id === id)) || runway.intersections.find(x => x.id === id);
      if (!it) {
        window.alert('Âncora não encontrada nesta pista.');
        return;
      }
      if (!window.confirm(`Excluir ${it.name} da pista atual?`)) return;
      rec.intersections = (rec.intersections || runway.intersections).filter(x => x.id !== id);
      saveGeometry();
      refreshFineTuneOptions();
      const fallback = anchorKeys()[0]?.key || 'thresholdRef';
      document.getElementById('anchorSelect').value = fallback;
      renderAnchorTable();
      analyze();
    }
    function exportBasePackObject(baseId = state.currentBaseId) {
      return getBasePack(baseId);
    }
    function applyGeometryObject(obj) {
      if (!obj?.thresholdRef || !obj?.thresholdOpp || !Array.isArray(obj?.intersections)) throw new Error('Geometry JSON inválido.');
      const baseId = state.currentBaseId;
      const runwayId = state.currentRunwayId;
      if (!currentGeometry[baseId]) currentGeometry[baseId] = { runways: {} };
      const applied = clone(obj);
      if (!applied.pavementRef) applied.pavementRef = clone(applied.thresholdRef);
      if (!applied.pavementOpp) applied.pavementOpp = clone(applied.thresholdOpp);
      if (!applied.endData) {
        const rawRunway = rawBasePack(baseId).runways.find(r => r.id === runwayId) || rawBasePack(baseId).runways[0];
        applied.endData = Object.fromEntries((rawRunway.ends || []).map(end => [end, {
          declared: clone(rawRunway.declaredDistances?.[end] || { tora: rawRunway.lengthM, toda: rawRunway.lengthM, asda: rawRunway.lengthM, lda: rawRunway.lengthM }),
          features: clone(rawRunway.endFeatures?.[end] || { displacedThresholdM: 0, stopwayM: 0, clearwayM: 0, operationalStartM: 0 })
        }]));
      }
      currentGeometry[baseId].runways[runwayId] = applied;
      saveGeometry();
      renderDeclaredInputs();
      renderAnchorTable();
      analyze();
    }
    function persistBasePackSafely(obj) {
      const pack = normalizeBasePack(obj);
      const custom = loadCustomBases();
      const builtin = BUILTIN_BASES[pack.id];
      let saved = clone(pack);
      let notice = '';
      if (builtin || (baseLibrary[pack.id] && baseLibrary[pack.id].locked)) {
        const originalId = saved.id;
        saved.id = `${saved.id}_DRAFT_${draftStamp()}`;
        saved.code = saved.code || saved.id;
        saved.stability = 'draft';
        saved.locked = false;
        notice = `Conflito com base protegida ${originalId}. Importada como ${saved.id}.`;
      }
      custom[saved.id] = saved;
      saveCustomBases(custom);
      baseLibrary = Object.fromEntries(Object.entries(mergedLibrary()).map(([id, pack]) => [id, normalizeBasePack(pack)]));
      return { saved, notice };
    }
    function duplicateCurrentAsDraft() {
      const base = exportBasePackObject();
      base.id = `${base.id}_DRAFT_${draftStamp()}`;
      base.code = base.code || base.id;
      base.stability = 'draft';
      base.locked = false;
      const custom = loadCustomBases();
      custom[base.id] = base;
      saveCustomBases(custom);
      baseLibrary = Object.fromEntries(Object.entries(mergedLibrary()).map(([id, pack]) => [id, normalizeBasePack(pack)]));
      setCurrentBase(base.id);
      document.getElementById('baseJson').value = JSON.stringify(base, null, 2);
    }

    function renderAnchorTable() {
      const runway = currentRunway();
      const ref = runway.referenceEnd;
      const opp = currentOppositeEnd(runway);
      const rows = [
        { key: 'pavementRef', name: `PAV ${ref}`, meters: 0, x: (runway.pavementRef || runway.thresholdRef).x, y: (runway.pavementRef || runway.thresholdRef).y },
        { key: 'thresholdRef', name: `THR ${ref}`, meters: stationMetersFromPoint(runway.thresholdRef, runway), x: runway.thresholdRef.x, y: runway.thresholdRef.y }
      ];
      const opRef = operationalAnchorInfo(runway, ref);
      if (opRef) { const p = pointAtMetersFromRef(opRef.metersFromRef, runway); rows.push({ key: opRef.key, name: opRef.label, meters: opRef.metersFromRef, x: p.x, y: p.y }); }
      const sortedIts = [...runway.intersections].sort((a, b) => a.metersFromRef - b.metersFromRef);
      sortedIts.forEach(it => {
        const p = pointAtMetersFromRef(it.metersFromRef, runway);
        rows.push({ key: `axis_${it.id}`, name: `${it.name} eixo`, meters: it.metersFromRef, x: p.x, y: p.y });
        rows.push({ key: `label_${it.id}`, name: `${it.name} rótulo`, meters: it.metersFromRef, x: it.labelPoint.x, y: it.labelPoint.y });
      });
      const opOpp = operationalAnchorInfo(runway, opp);
      if (opOpp) { const p = pointAtMetersFromRef(opOpp.metersFromRef, runway); rows.push({ key: opOpp.key, name: opOpp.label, meters: opOpp.metersFromRef, x: p.x, y: p.y }); }
      rows.push({ key: 'thresholdOpp', name: `THR ${opp}`, meters: stationMetersFromPoint(runway.thresholdOpp, runway), x: runway.thresholdOpp.x, y: runway.thresholdOpp.y });
      rows.push({ key: 'pavementOpp', name: `PAV ${opp}`, meters: runway.lengthM, x: (runway.pavementOpp || runway.thresholdOpp).x, y: (runway.pavementOpp || runway.thresholdOpp).y });
      const selected = selectedAnchorKey();
      document.getElementById('anchorTable').innerHTML = rows.map(r => `
        <tr class="${selected === r.key ? 'selected-row' : ''}">
          <td>${r.name}</td>
          <td>${Math.round(r.meters)}</td>
          <td>${round2(r.x)}</td>
          <td>${round2(r.y)}</td>
        </tr>`).join('');
      document.getElementById('geometryJson').value = JSON.stringify(exportGeometryObject(), null, 2);
    }

    function setCaptureMode(on) {
      state.captureMode = on;
      vizWrap.classList.toggle('capture', on);
      if (captureBanner) captureBanner.hidden = !on;
      if (on && captureBanner) captureBanner.innerHTML = `Captura ativa: <strong>${selectedAnchorLabel()}</strong><br>Toque na carta para atualizar essa âncora.`;
    }
    function applyClickToAnchor(chartPoint) {
      const key = selectedAnchorKey();
      applyPointToAnchorKey(key, chartPoint);
      saveGeometry();
      renderAnchorTable();
      analyze();
      setCaptureMode(false);
    }
    function nudgeSelected(dx, dy) {
      const runway = currentRunway();
      const rec = activeGeometryRecord();
      const step = Number(document.getElementById('nudgeStep').value || 1);
      const key = selectedAnchorKey();
      if (key === 'pavementRef') {
        rec.pavementRef = rec.pavementRef || clone(runway.pavementRef || runway.thresholdRef);
        rec.pavementRef.x = round2((rec.pavementRef.x || 0) + dx * step);
        rec.pavementRef.y = round2((rec.pavementRef.y || 0) + dy * step);
      } else if (key === 'thresholdRef') {
        rec.thresholdRef = rec.thresholdRef || clone(runway.thresholdRef);
        rec.thresholdRef.x = round2((rec.thresholdRef.x || 0) + dx * step);
        rec.thresholdRef.y = round2((rec.thresholdRef.y || 0) + dy * step);
      } else if (key === 'thresholdOpp') {
        rec.thresholdOpp = rec.thresholdOpp || clone(runway.thresholdOpp);
        rec.thresholdOpp.x = round2((rec.thresholdOpp.x || 0) + dx * step);
        rec.thresholdOpp.y = round2((rec.thresholdOpp.y || 0) + dy * step);
      } else if (key === 'pavementOpp') {
        rec.pavementOpp = rec.pavementOpp || clone(runway.pavementOpp || runway.thresholdOpp);
        rec.pavementOpp.x = round2((rec.pavementOpp.x || 0) + dx * step);
        rec.pavementOpp.y = round2((rec.pavementOpp.y || 0) + dy * step);
      } else if (key.startsWith('axis_')) {
        const id = key.replace('axis_', '');
        rec.intersections = Array.isArray(rec.intersections) ? rec.intersections : runway.intersections.map(it => ({ id: it.id, metersFromRef: it.metersFromRef, labelPoint: clone(it.labelPoint) }));
        const it = rec.intersections.find(x => x.id === id);
        if (it) it.metersFromRef = clamp(Math.round(it.metersFromRef + dx * step), 0, runway.lengthM);
      } else if (key.startsWith('label_')) {
        const id = key.replace('label_', '');
        rec.intersections = Array.isArray(rec.intersections) ? rec.intersections : runway.intersections.map(it => ({ id: it.id, metersFromRef: it.metersFromRef, labelPoint: clone(it.labelPoint) }));
        const it = rec.intersections.find(x => x.id === id);
        if (it) {
          it.labelPoint.x = round2((it.labelPoint.x || 0) + dx * step);
          it.labelPoint.y = round2((it.labelPoint.y || 0) + dy * step);
        }
      }
      saveGeometry();
      renderAnchorTable();
      analyze();
    }

    function drawPavementMarkers(runway) {
      // PAV também não fica visível na carta por padrão.
      // A seleção manual continua sendo mostrada via drawSelectedGuide().
      return;
    }
    function drawThresholdMarkers(runway) {
      // PAV/THR não ficam visíveis na carta por padrão.
      // A seleção manual continua sendo mostrada via drawSelectedGuide().
      return;
    }
    function endpointLabelCandidates(runway, point, end, kind) {
      const g = runwayGeometry(runway);
      const isRef = String(end) === String(runway.referenceEnd);
      const side = isRef ? -1 : 1;
      const base = toScreen(point);
      const tangent = isRef ? -1 : 1;
      const lateral = 92;
      const along = kind === 'pavement' ? 28 : -28;
      const main = { x: base.x + g.px * side * state.scale * lateral + g.ux * tangent * along, y: base.y + g.py * side * state.scale * lateral + g.uy * tangent * along };
      const alt = { x: base.x - g.px * side * state.scale * (lateral - 12) + g.ux * tangent * along, y: base.y - g.py * side * state.scale * (lateral - 12) + g.uy * tangent * along };
      return [
        { x: main.x + 8, y: main.y - 24, align: main.x >= base.x ? 'left' : 'right' },
        { x: main.x + 8, y: main.y + 2, align: main.x >= base.x ? 'left' : 'right' },
        { x: alt.x + 8, y: alt.y - 24, align: alt.x >= base.x ? 'left' : 'right' },
        { x: alt.x + 8, y: alt.y + 2, align: alt.x >= base.x ? 'left' : 'right' }
      ];
    }
    function activeTakeoffLabelCandidates(runway, point, end) {
      return endpointLabelCandidates(runway, point, end, 'threshold');
    }
    function drawEndpointLabels(runway) {
      const dep = state.departureEnd;
      if (!dep) return;
      const override = visualOverrideFor(runway, dep);
      const explicit = Array.isArray(override.showLabels) ? override.showLabels : null;
      if (explicit && explicit.length) {
        explicit.forEach(token => {
          const pt = anchorPoint(runway, token, dep);
          const parsed = parseAnchorToken(token);
          if (!pt || !parsed) return;
          if (parsed.type === 'PAV' || parsed.type === 'THR') return;
          const color = parsed.type === 'INT' ? markerColorFor(runway, dep, 'intersection', parsed.id) : '#a855f7';
          drawCalloutLabel([anchorLabel(token)], toScreen(pt), activeTakeoffLabelCandidates(runway, pt, dep), color, runway);
        });
      }
    }
    function drawOperationalStartLabel(runway) {
      const dep = state.departureEnd;
      if (!dep) return;
      const override = visualOverrideFor(runway, dep);
      if (override.hideOperationalLabel) return;
      const startM = Number(selectedEndFeatures(runway, dep)?.operationalStartM || 0);
      if (!(startM > 0)) return;
      const token = anchorToken('OP', dep);
      const pt = anchorPoint(runway, token, dep);
      if (!pt) return;
      drawCalloutLabel([anchorLabel(token)], toScreen(pt), activeTakeoffLabelCandidates(runway, pt, dep), '#ef4444', runway);
    }
    function drawReferenceAxis(runway) {
      const g = runwayGeometry(runway);
      const a = toScreen(g.pRef);
      const b = toScreen(g.pOpp);
      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#7CFC00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }
    function pointInRunwayCorridor(screenPoint, runway, extra = 28) {
      const a = toScreen(runway.thresholdRef);
      const b = toScreen(runway.thresholdOpp);
      const dx = b.x - a.x, dy = b.y - a.y;
      const len2 = dx * dx + dy * dy;
      if (!len2) return false;
      const vx = screenPoint.x - a.x, vy = screenPoint.y - a.y;
      const t = (vx * dx + vy * dy) / len2;
      if (t < 0 || t > 1) return false;
      const projX = a.x + dx * t, projY = a.y + dy * t;
      const dist = Math.hypot(screenPoint.x - projX, screenPoint.y - projY);
      const half = (runway.widthPx * state.scale * 0.62) + extra;
      return dist <= half;
    }
    function boxIntersectsRunway(box, runway, extra = 28) {
      const pts = [
        { x: box.left, y: box.top }, { x: box.left + box.width, y: box.top },
        { x: box.left, y: box.top + box.height }, { x: box.left + box.width, y: box.top + box.height },
        { x: box.left + box.width / 2, y: box.top }, { x: box.left + box.width / 2, y: box.top + box.height },
        { x: box.left, y: box.top + box.height / 2 }, { x: box.left + box.width, y: box.top + box.height / 2 },
        { x: box.left + box.width / 2, y: box.top + box.height / 2 }
      ];
      return pts.some(pt => pointInRunwayCorridor(pt, runway, extra));
    }
    function measureLabelBox(textLines, x, y, align = 'left') {
      ctx.save();
      ctx.font = '800 14px Inter, sans-serif';
      const padX = 10, lineH = 16;
      const widths = textLines.map(t => ctx.measureText(t).width);
      const w = Math.max(...widths, 32) + padX * 2;
      const h = textLines.length * lineH + 12;
      let left = align === 'right' ? x - w : x;
      left = Math.max(8, Math.min(left, canvas.clientWidth - w - 8));
      let top = Math.max(8, Math.min(y, canvas.clientHeight - h - 8));
      ctx.restore();
      return { left, top, width: w, height: h, x, y, align, textLines };
    }
    function boxesOverlap(a, b, pad = 8) {
      return !(a.left + a.width + pad < b.left || b.left + b.width + pad < a.left || a.top + a.height + pad < b.top || b.top + b.height + pad < a.top);
    }
    function overlapsExisting(box) { return labelBoxes.some(existing => boxesOverlap(box, existing, 6)); }
    function invalidPlacement(box, runway) { return overlapsExisting(box) || boxIntersectsRunway(box, runway, 28); }
    function drawLabelBox(textLines, x, y, color, align = 'left', register = true) {
      const box = measureLabelBox(textLines, x, y, align);
      ctx.save();
      ctx.font = '800 17px Inter, sans-serif';
      const padX = 12, lineH = 19, w = box.width, h = box.height, left = box.left, top = box.top;
      ctx.shadowColor = 'rgba(0,0,0,.18)';
      ctx.shadowBlur = 9;
      ctx.fillStyle = 'rgba(8,18,31,.92)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      const r = 10;
      ctx.beginPath();
      ctx.moveTo(left + r, top);
      ctx.lineTo(left + w - r, top);
      ctx.quadraticCurveTo(left + w, top, left + w, top + r);
      ctx.lineTo(left + w, top + h - r);
      ctx.quadraticCurveTo(left + w, top + h, left + w - r, top + h);
      ctx.lineTo(left + r, top + h);
      ctx.quadraticCurveTo(left, top + h, left, top + h - r);
      ctx.lineTo(left, top + r);
      ctx.quadraticCurveTo(left, top, left + r, top);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      textLines.forEach((line, i) => ctx.fillText(line, left + padX, top + 21 + i * lineH));
      ctx.restore();
      if (register) labelBoxes.push(box);
      return box;
    }
    function nearestPointOnBox(box, p) {
      return { x: Math.max(box.left, Math.min(p.x, box.left + box.width)), y: Math.max(box.top, Math.min(p.y, box.top + box.height)) };
    }
    function drawLeaderLine(anchor, box, color) {
      const edge = nearestPointOnBox(box, anchor);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y);
      ctx.lineTo(edge.x, edge.y);
      ctx.stroke();
      ctx.restore();
    }
    function drawCalloutLabel(textLines, anchor, candidates, color, runway) {
      let chosen = null;
      for (const c of candidates || []) {
        const box = measureLabelBox(textLines, c.x, c.y, c.align || 'left');
        if (!invalidPlacement(box, runway)) { chosen = { ...c, box }; break; }
      }
      if (!chosen) {
        const fallbackPool = [
          ...(candidates || []),
          { x: anchor.x + 40, y: anchor.y - 44, align: 'left' },
          { x: anchor.x - 40, y: anchor.y - 44, align: 'right' },
          { x: anchor.x + 56, y: anchor.y + 18, align: 'left' },
          { x: anchor.x - 56, y: anchor.y + 18, align: 'right' }
        ];
        for (const c of fallbackPool) {
          const box = measureLabelBox(textLines, c.x, c.y, c.align || 'left');
          if (!invalidPlacement(box, runway)) { chosen = { ...c, box }; break; }
        }
      }
      if (!chosen) {
        const fallback = candidates?.[0] || { x: anchor.x + 14, y: anchor.y - 24, align: 'left' };
        chosen = { ...fallback, box: measureLabelBox(textLines, fallback.x, fallback.y, fallback.align || 'left') };
      }
      const rendered = drawLabelBox(textLines, chosen.x, chosen.y, color, chosen.align || 'left', false);
      drawLeaderLine(anchor, rendered, color);
      labelBoxes.push(rendered);
      return rendered;
    }
    function drawRequiredArrow(runway, dep, requiredMeters, availableMeters, color, label, startMetersOverride = null, endMetersOverride = null) {
      const g = runwayGeometry(runway);
      const usableAvailable = Number.isFinite(availableMeters) ? availableMeters : runway.lengthM;
      const clampedReq = clamp(requiredMeters, 0, usableAvailable);
      const startBase = Number.isFinite(startMetersOverride) ? startMetersOverride : metersForKind(runway, depIsRef(runway, dep) ? 'pavementRef' : 'pavementOpp', dep);
      const endBase = Number.isFinite(endMetersOverride) ? endMetersOverride : gateMetersFromRef(usableAvailable, runway, dep);
      const startMRef = stationAtOffsetFromStart(startBase, Math.max(0, usableAvailable - clampedReq), runway, dep);
      const endMRef = Number.isFinite(endMetersOverride) ? endBase : gateMetersFromRef(usableAvailable, runway, dep);
      const startP = pointAtMetersFromRef(startMRef, runway);
      const endP = pointAtMetersFromRef(endMRef, runway);
      const s = toScreen(startP), e = toScreen(endP);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = Math.max(5, runway.widthPx * state.scale * 0.18);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      const len = Math.max(1, Math.hypot(e.x - s.x, e.y - s.y));
      const ux = (e.x - s.x) / len, uy = (e.y - s.y) / len, px = -uy, py = ux;
      const ah = 16, aw = 10;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x - ux * ah + px * aw, e.y - uy * ah + py * aw);
      ctx.lineTo(e.x - ux * ah - px * aw, e.y - uy * ah - py * aw);
      ctx.closePath();
      ctx.fill();
      const anchor = { x: s.x + (e.x - s.x) * 0.28, y: s.y + (e.y - s.y) * 0.28 };
      const side = dep === currentOppositeEnd(runway) ? -1 : 1;
      drawCalloutLabel([label, `${Math.round(requiredMeters)} m`], anchor, [
        { x: anchor.x + px * 108 * side, y: anchor.y + py * 108 * side - 28, align: (px * side) > 0 ? 'left' : 'right' },
        { x: anchor.x + px * 126 * side, y: anchor.y + py * 126 * side - 4, align: (px * side) > 0 ? 'left' : 'right' },
        { x: anchor.x - px * 96 * side, y: anchor.y - py * 96 * side - 18, align: (px * side) > 0 ? 'right' : 'left' }
      ], color, runway);
      ctx.restore();
    }
    function drawStatusBarAtPoint(runway, metersFromRef, label, valueMeters, ok, dep, shiftIndex = 0, labelPoint = null, style = null) {
      const g = runwayGeometry(runway);
      const axisPoint = pointAtMetersFromRef(metersFromRef, runway);
      const p = toScreen(axisPoint);
      const styleMode = style === 'twy' ? 'twy' : 'default';
      const halfMultiplier = styleMode === 'twy' ? 0.60 : 0.95;
      const minHalf = styleMode === 'twy' ? 7 : 14;
      const half = Math.max(runway.widthPx * state.scale * halfMultiplier, minHalf);
      const p1 = { x: p.x + g.px * state.scale * half, y: p.y + g.py * state.scale * half };
      const p2 = { x: p.x - g.px * state.scale * half, y: p.y - g.py * state.scale * half };
      const color = ok ? '#7CFC00' : '#ef4444';
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = styleMode === 'twy' ? Math.max(1.8, runway.widthPx * state.scale * 0.072) : Math.max(4, runway.widthPx * state.scale * 0.18);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
      const side = dep === currentOppositeEnd(runway) ? 1 : -1;
      const preferred = labelPoint ? toScreen(labelPoint) : { x: p.x + g.px * side * state.scale * 84, y: p.y + g.py * side * state.scale * 84 };
      const alignPref = preferred.x >= p.x ? 'left' : 'right';
      const candidates = [
        { x: preferred.x + (alignPref === 'left' ? 10 : -10), y: preferred.y - 32 + shiftIndex * 2, align: alignPref },
        { x: preferred.x + (alignPref === 'left' ? 14 : -14), y: preferred.y + 4 + shiftIndex * 2, align: alignPref },
        { x: p.x + g.px * side * state.scale * 104, y: p.y + g.py * side * state.scale * 104 - 18, align: side * g.px >= 0 ? 'left' : 'right' },
        { x: p.x - g.px * side * state.scale * 104, y: p.y - g.py * side * state.scale * 104 - 18, align: side * g.px >= 0 ? 'right' : 'left' }
      ];
      drawCalloutLabel([label, `${Math.round(valueMeters)} m`], p, candidates, color, runway);
    }
    function displayTaxiLabel(label) {
      const raw = String(label || '').trim();
      return raw.replace(/^TWY\s+/i, '') || raw;
    }
    function drawOperationalRestriction(runway, dep) {
      if (!dep) return;
      const override = visualOverrideFor(runway, dep);
      const startM = Number(selectedEndFeatures(runway, dep)?.operationalStartM || 0);
      const defaultStartToken = anchorToken('PAV', dep);
      const defaultOpToken = anchorToken('OP', dep);
      const startToken = override?.restrictedSegment?.start || defaultStartToken;
      const endToken = override?.restrictedSegment?.end || defaultOpToken;
      const startMeters = anchorMeters(runway, startToken, dep);
      const endMeters = anchorMeters(runway, endToken, dep);
      if (startMeters == null || endMeters == null) {
        if (!(startM > 0)) return;
        return;
      }
      const aM = Math.min(startMeters, endMeters);
      const bM = Math.max(startMeters, endMeters);
      if (!(bM > aM)) return;
      const p1 = pointAtMetersFromRef(aM, runway);
      const p2 = pointAtMetersFromRef(bM, runway);
      const s1 = toScreen(p1), s2 = toScreen(p2);
      const bandColor = override?.restrictedBandColor || 'rgba(239,68,68,0.96)';
      const bandHalf = Math.max(runway.widthPx * state.scale * 0.72, 12);
      const dx = s2.x - s1.x, dy = s2.y - s1.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const ux = dx / len, uy = dy / len;
      const px = -uy, py = ux;
      ctx.save();
      ctx.setLineDash([]);
      ctx.fillStyle = bandColor;
      ctx.beginPath();
      ctx.moveTo(s1.x + px * bandHalf, s1.y + py * bandHalf);
      ctx.lineTo(s2.x + px * bandHalf, s2.y + py * bandHalf);
      ctx.lineTo(s2.x - px * bandHalf, s2.y - py * bandHalf);
      ctx.lineTo(s1.x - px * bandHalf, s1.y - py * bandHalf);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      const g = runwayGeometry(runway);
      const opPoint = pointAtMetersFromRef(endMeters, runway);
      const half = Math.max(runway.widthPx * 1.9, 28);
      const gp1 = { x: opPoint.x + g.px * half, y: opPoint.y + g.py * half };
      const gp2 = { x: opPoint.x - g.px * half, y: opPoint.y - g.py * half };
      const ss1 = toScreen(gp1), ss2 = toScreen(gp2);
      ctx.save();
      ctx.strokeStyle = override?.restrictedBarColor || '#ef4444';
      ctx.lineWidth = Math.max(10, runway.widthPx * state.scale * 0.42);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ss1.x, ss1.y);
      ctx.lineTo(ss2.x, ss2.y);
      ctx.stroke();
      ctx.restore();
    }
    function drawRunwayOverlay(runway, a) {
      if (!a) return;
      const g = runwayGeometry(runway);
      const fullRow = a.rows.find(r => r.id === 'FULL');
      const gateClamped = clamp(a.gateMetersFromRef, 0, runway.lengthM);
      const gate = pointAtMetersFromRef(gateClamped, runway);
      const rtoOk = a.rto <= (a.metrics?.asda?.fullLength ?? a.declared.asda);
      drawRequiredArrow(runway, a.dep, a.rto, a.metrics?.asda?.fullLength ?? a.declared.asda, rtoOk ? '#7CFC00' : '#ef4444', 'RTO', a.metrics?.asda?.startMeters, a.metrics?.asda?.endMeters);
      const half = runway.widthPx * 1.12;
      const gp1 = { x: gate.x + g.px * half, y: gate.y + g.py * half };
      const gp2 = { x: gate.x - g.px * half, y: gate.y - g.py * half };
      const s1 = toScreen(gp1), s2 = toScreen(gp2);
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();
      ctx.restore();
      const startPoint = a.metrics?.asda?.startPoint || pointForKind(runway, a.meta.startKind || (Number(a.meta.operationalStartM || 0) > 0 ? (a.dep === currentOppositeEnd(runway) ? 'operationalOpp' : 'operationalRef') : (a.dep === currentOppositeEnd(runway) ? 'pavementOpp' : 'pavementRef')), a.dep);
      const depLabelPoint = { x: startPoint.x + (a.dep === currentOppositeEnd(runway) ? g.px * 58 + g.ux * 12 : -g.px * 58 - g.ux * 12), y: startPoint.y + (a.dep === currentOppositeEnd(runway) ? g.py * 58 + g.uy * 12 : -g.py * 58 - g.uy * 12) };
      drawStatusBarAtPoint(runway, a.meta.fullLengthMetersFromRef, a.meta.startLabel || a.meta.startThr, fullRow?.availableAsda ?? a.declared.asda, !!fullRow?.go, a.dep, 0, depLabelPoint);
      const sorted = [...a.rows.filter(r => r.id !== 'FULL')].sort((x, y) => x.distStart - y.distStart);
      sorted.forEach((row, idx) => {
        const baseIntersection = runway.intersections.find(it => it.id === row.id);
        drawStatusBarAtPoint(runway, row.metersFromRef, displayTaxiLabel(row.name || row.id), row.availableAsda, row.go, a.dep, idx + 1, row.labelPoint || baseIntersection?.labelPoint || null, 'twy');
      });
    }
    function drawIntersection(runway, it) {
      // As barrinhas operacionais das TWY já são desenhadas em drawStatusBarAtPoint().
      // Evitamos desenhar uma segunda barra aqui para não engrossar visualmente.
      return;
    }
    function drawSelectedGuide(runway) {
      const key = selectedAnchorKey();
      if (!key) return;
      const g = runwayGeometry(runway);
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(32,184,255,.94)';
      ctx.lineWidth = 2;
      if (key === 'pavementRef' || key === 'thresholdRef' || key === 'thresholdOpp' || key === 'pavementOpp') {
        const p = key === 'pavementRef' ? (runway.pavementRef || runway.thresholdRef)
          : key === 'thresholdRef' ? runway.thresholdRef
          : key === 'thresholdOpp' ? runway.thresholdOpp
          : (runway.pavementOpp || runway.thresholdOpp);
        const s = toScreen(p);
        ctx.beginPath(); ctx.moveTo(s.x - 16, s.y); ctx.lineTo(s.x + 16, s.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.x, s.y - 16); ctx.lineTo(s.x, s.y + 16); ctx.stroke();
      } else if (key.startsWith('axis_')) {
        const id = key.replace('axis_', '');
        const it = runway.intersections.find(x => x.id === id);
        if (it) {
          const p = pointAtMetersFromRef(it.metersFromRef, runway);
          const half = runway.widthPx * 1.3;
          const p1 = { x: p.x + g.px * half, y: p.y + g.py * half };
          const p2 = { x: p.x - g.px * half, y: p.y - g.py * half };
          const s1 = toScreen(p1), s2 = toScreen(p2);
          ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.stroke();
        }
      } else if (key.startsWith('label_')) {
        const id = key.replace('label_', '');
        const it = runway.intersections.find(x => x.id === id);
        if (it) {
          const s = toScreen(it.labelPoint);
          ctx.beginPath(); ctx.moveTo(s.x - 14, s.y); ctx.lineTo(s.x + 14, s.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(s.x, s.y - 14); ctx.lineTo(s.x, s.y + 14); ctx.stroke();
        }
      }
      ctx.restore();
    }
    function draw() {
      const rect = vizWrap.getBoundingClientRect();
      labelBoxes = [];
      ctx.clearRect(0, 0, rect.width, rect.height);
      const base = currentBase();
      const runway = currentRunway(base);
      const chart = currentDisplayChart(base, runway);
      if (!chartImg.complete || !chartImg.naturalWidth) return;
      ctx.imageSmoothingEnabled = true;
      try { ctx.imageSmoothingQuality = 'high'; } catch (e) {}
      ctx.drawImage(chartImg, state.offsetX, state.offsetY, chart.size.width * state.scale, chart.size.height * state.scale);
      drawReferenceAxis(runway);
      drawOperationalRestriction(runway, state.departureEnd);
      drawRunwayOverlay(runway, state.analysis);
      drawPavementMarkers(runway);
      drawThresholdMarkers(runway);
      drawEndpointLabels(runway);
      drawOperationalStartLabel(runway);
      runway.intersections.forEach(it => drawIntersection(runway, it));
      drawSelectedGuide(runway);
    }

    function readExternalInbox() {
      let payload = null;
      try {
        const fromStorage = localStorage.getItem(INBOX_KEY);
        if (fromStorage) payload = JSON.parse(fromStorage);
      } catch {}
      const qs = new URLSearchParams(location.search);
      if (qs.has('base') || qs.has('dep') || qs.has('rto')) {
        payload = {
          baseId: qs.get('base') || payload?.baseId || state.currentBaseId,
          runwayId: qs.get('runway') || payload?.runwayId || state.currentRunwayId,
          departureEnd: qs.get('dep') || payload?.departureEnd || state.departureEnd,
          rto: qs.get('rto') ?? payload?.rto
        };
      }
      if (!payload) return false;
      if (payload.baseId && baseLibrary[payload.baseId]) state.currentBaseId = payload.baseId;
      refreshBaseOptions();
      const base = currentBase();
      state.currentRunwayId = payload.runwayId && base.runways.some(r => r.id === payload.runwayId) ? payload.runwayId : (base.defaultRunwayId || base.runways[0].id);
      if (payload.departureEnd) state.departureEnd = String(payload.departureEnd);
      if (payload.rto != null) document.getElementById('rtoInput').value = payload.rto;
      setCurrentBase(state.currentBaseId);
      return true;
    }

    function bridgeRowsFromAnalysis(analysis) {
  return (analysis?.rows || []).map(r => ({
    id: r.id || r.name,
    name: r.name || r.id || '',
    labelPoint: r.labelPoint ? clone(r.labelPoint) : null,
    metersFromRef: Number(r.metersFromRef || 0),
    availableAsda: Number(r.availableAsda || 0),
    availableTora: Number(r.availableTora || 0),
    availableToda: Number(r.availableToda || 0),
    distStart: Number(r.distStart || 0),
    go: !!r.go,
    rtoOk: !!r.rtoOk
  }));
}

function getBridgePayload() {
  const base = currentBase();
  const runway = currentRunway(base);
  const chart = currentDisplayChart(base, runway);
  const src = chartSource(base, runway);
  const analysis = state.analysis || null;
  return {
    baseId: state.currentBaseId,
    runwayId: state.currentRunwayId,
    departureEnd: state.departureEnd,
    rto: Number(document.getElementById('rtoInput')?.value || 0),
    chart: chart ? { id: chart.id, label: chart.label, asset: chart.asset, src, size: clone(chart.size || {}) } : null,
    runway: runway ? {
      id: runway.id,
      label: runway.label,
      referenceEnd: runway.referenceEnd,
      pavementRef: clone(runway.pavementRef || null),
      pavementOpp: clone(runway.pavementOpp || null),
      thresholdRef: clone(runway.thresholdRef || null),
      thresholdOpp: clone(runway.thresholdOpp || null),
      lengthM: Number(runway.lengthM || 0),
      widthPx: Number(runway.widthPx || 0),
      intersections: clone(runway.intersections || [])
    } : null,
    analysis: analysis ? {
      gateMetersFromRef: Number(analysis.gateMetersFromRef || 0),
      anyStartValid: !!analysis.anyStartValid,
      greenLength: Number(analysis.greenLength || 0),
      declared: clone(analysis.declared || {}),
      features: clone(analysis.features || {}),
      metrics: clone(analysis.metrics || {}),
      visual: clone(analysis.visual || {}),
      rows: bridgeRowsFromAnalysis(analysis),
      meta: clone(analysis.meta || {})
    } : null
  };
}

async function analyzeFromBridge(ctx = {}) {
  const parseBridgeDeparture = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return { token: '', runwayId: '', dep: '' };
    if (raw.includes('::')) {
      const [runwayId, dep] = raw.split('::');
      return { token: raw, runwayId: runwayId || '', dep: dep || '' };
    }
    return { token: raw, runwayId: '', dep: raw };
  };
  const desired = parseBridgeDeparture(ctx.departureToken || ctx.adcDepartureToken || ctx.departureEnd || '');
  if (ctx.baseId) state.currentBaseId = String(ctx.baseId);
  const base = currentBase();
  if (ctx.runwayId && base.runways.some(r => String(r.id) === String(ctx.runwayId))) {
    state.currentRunwayId = String(ctx.runwayId);
  } else if (desired.runwayId && base.runways.some(r => String(r.id) === String(desired.runwayId))) {
    state.currentRunwayId = String(desired.runwayId);
  }
  if (desired.dep) state.departureEnd = desired.dep;
  refreshBaseOptions();
  refreshDepartureOptions();
  refreshFineTuneOptions();
  const depSel = document.getElementById('departureEndSelect');
  const baseSel = document.getElementById('baseSelect');
  if (baseSel) baseSel.value = state.currentBaseId;
  if (depSel) {
    const options = [...depSel.options];
    const exact = desired.token ? options.find(opt => opt.value === desired.token) : null;
    const byEnd = !exact && desired.dep ? options.find(opt => String(opt.value || '').split('::')[1] === desired.dep || String(opt.textContent || '').trim() === desired.dep) : null;
    const match = exact || byEnd || options.find(opt => opt.value === `${state.currentRunwayId}::${state.departureEnd}`) || options[0] || null;
    if (match) {
      depSel.value = match.value;
      const parsed = parseDepartureToken(match.value);
      if (parsed.runwayId) state.currentRunwayId = parsed.runwayId;
      if (parsed.dep) state.departureEnd = parsed.dep;
    }
  }
  renderChartPageControls();
  loadCurrentChart();
  renderLibraryStatus();
  renderBaseInfo();
  renderAnchorTable();
  renderDeclaredInputs();
  if (ctx.rto != null) document.getElementById('rtoInput').value = String(ctx.rto);
  analyze();
  saveUiState();
  return getBridgePayload();
}


async function waitForChart(targetSrc = '', timeoutMs = 2200) {
  const targetKey = chartKey(targetSrc);
  const deadline = Date.now() + timeoutMs;
  let stableCount = 0;
  let lastSignature = '';
  while (Date.now() < deadline) {
    const currentKey = state.chartLoadedKey || chartKey(chartImg.currentSrc || chartImg.src || '');
    const requestedKey = state.chartRequestedKey || currentKey;
    const canvasReady = canvas && canvas.width > 32 && canvas.height > 32;
    const keyMatches = targetKey ? currentKey === targetKey : true;
    const signature = `${currentKey}|${requestedKey}|${canvas?.width || 0}x${canvas?.height || 0}|${state.chartRenderStamp}`;
    if (canvasReady && keyMatches) {
      if (signature === lastSignature) stableCount += 1;
      else stableCount = 1;
      lastSignature = signature;
      if (stableCount >= 2) {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return {
          ok: true,
          loadedKey: currentKey,
          requestedKey,
          renderStamp: state.chartRenderStamp,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height
        };
      }
    } else {
      stableCount = 0;
      lastSignature = signature;
    }
    await new Promise(resolve => setTimeout(resolve, 70));
  }
  return {
    ok: false,
    loadedKey: state.chartLoadedKey || chartKey(chartImg.currentSrc || chartImg.src || ''),
    requestedKey: state.chartRequestedKey || '',
    renderStamp: state.chartRenderStamp,
    canvasWidth: canvas?.width || 0,
    canvasHeight: canvas?.height || 0
  };
}

window.__adcBridge = {
  analyzeFromBridge,
  getPayload: getBridgePayload,
  getAnalysis: () => clone(state.analysis || null),
  getRows: () => bridgeRowsFromAnalysis(state.analysis || null),
  getChartSource: () => getBridgePayload().chart,
  getCurrentState: () => ({
    currentBaseId: state.currentBaseId,
    currentRunwayId: state.currentRunwayId,
    departureEnd: state.departureEnd,
    vizPage: state.vizPage
  }),
  getRenderInfo: () => ({
    requestedKey: state.chartRequestedKey,
    loadedKey: state.chartLoadedKey || chartKey(chartImg.currentSrc || chartImg.src || ''),
    renderStamp: state.chartRenderStamp,
    canvasWidth: canvas?.width || 0,
    canvasHeight: canvas?.height || 0
  }),
  waitForChart
};



window.addEventListener('resize', resizeCanvas);
    chartImg.addEventListener('load', resizeCanvas);
    document.getElementById('analyzeBtn').addEventListener('click', analyze);
    document.getElementById('baseSelect').addEventListener('change', e => setCurrentBase(e.target.value));
    document.getElementById('departureEndSelect').addEventListener('change', e => setCurrentDeparture(e.target.value));
    document.getElementById('readInboxBtn').addEventListener('click', () => { if (!readExternalInbox()) alert('Nenhum inbox externo encontrado.'); });
    document.getElementById('anchorSelect').addEventListener('change', renderAnchorTable);
    document.getElementById('captureBtn').addEventListener('click', () => setCaptureMode(true));
    document.getElementById('cancelCaptureBtn').addEventListener('click', () => setCaptureMode(false));
    document.getElementById('copyPointBtn').addEventListener('click', copySelectedAnchorPoint);
    document.getElementById('pastePointBtn').addEventListener('click', pasteCopiedAnchorPoint);
    document.getElementById('addAnchorBtn').addEventListener('click', addAnchor);
    document.getElementById('deleteAnchorBtn').addEventListener('click', deleteAnchor);
    document.getElementById('resetDefaultsBtn').addEventListener('click', () => {
      const baseId = state.currentBaseId, runwayId = state.currentRunwayId;
      if (currentGeometry[baseId]?.runways?.[runwayId]) delete currentGeometry[baseId].runways[runwayId];
      saveGeometry();
      activeGeometryRecord();
      refreshFineTuneOptions();
      renderDeclaredInputs();
      renderAnchorTable();
      analyze();
    });
    document.getElementById('nudgeLeftBtn').addEventListener('click', () => nudgeSelected(-1, 0));
    document.getElementById('nudgeRightBtn').addEventListener('click', () => nudgeSelected(1, 0));
    document.getElementById('nudgeUpBtn').addEventListener('click', () => nudgeSelected(0, -1));
    document.getElementById('nudgeDownBtn').addEventListener('click', () => nudgeSelected(0, 1));
    document.getElementById('exportGeometryBtn').addEventListener('click', () => { document.getElementById('geometryJson').value = JSON.stringify(exportGeometryObject(), null, 2); });
    document.getElementById('copyGeometryBtn').addEventListener('click', async () => {
      const txt = JSON.stringify(exportGeometryObject(), null, 2);
      document.getElementById('geometryJson').value = txt;
      try { await navigator.clipboard.writeText(txt); } catch {}
    });
    document.getElementById('saveGeometryBtn').addEventListener('click', () => {
      const base = currentBase(); const rw = currentRunway(base);
      const txt = JSON.stringify(exportGeometryObject(), null, 2);
      document.getElementById('geometryJson').value = txt;
      saveTextFile(`${base.id.toLowerCase()}_${rw.label.replace('/', '_')}_geometry.json`, txt);
    });
    document.getElementById('applyGeometryBtn').addEventListener('click', () => {
      try { applyGeometryObject(JSON.parse(document.getElementById('geometryJson').value || '{}')); }
      catch (err) { alert(err.message || 'Falha ao aplicar geometry JSON.'); }
    });
    document.getElementById('exportBaseBtn').addEventListener('click', () => { document.getElementById('baseJson').value = JSON.stringify(exportBasePackObject(), null, 2); });
    document.getElementById('copyBaseBtn').addEventListener('click', async () => {
      const txt = JSON.stringify(exportBasePackObject(), null, 2);
      document.getElementById('baseJson').value = txt;
      try { await navigator.clipboard.writeText(txt); } catch {}
    });
    document.getElementById('saveBaseBtn').addEventListener('click', () => {
      const base = exportBasePackObject();
      const txt = JSON.stringify(base, null, 2);
      document.getElementById('baseJson').value = txt;
      saveTextFile(`${base.id.toLowerCase()}_base_v5.json`, txt);
    });
    document.getElementById('importBaseBtn').addEventListener('click', () => {
      try {
        const obj = JSON.parse(document.getElementById('baseJson').value || '{}');
        const { saved, notice } = persistBasePackSafely(obj);
        document.getElementById('baseJson').value = JSON.stringify(saved, null, 2);
        refreshBaseOptions();
        setCurrentBase(saved.id);
        if (notice) alert(notice);
      } catch (err) { alert(err.message || 'Falha ao importar base JSON.'); }
    });
    document.getElementById('duplicateDraftBtn').addEventListener('click', duplicateCurrentAsDraft);
    document.getElementById('applyDeclaredBtn').addEventListener('click', applyDeclaredInputs);
    document.getElementById('applyDeclaredShiftBtn').addEventListener('click', applyDeclaredDisplacementForActiveEnd);
    document.getElementById('normalizeRunwayBtn').addEventListener('click', normalizeRunwayByDeclared);
    document.getElementById('resetDeclaredBtn').addEventListener('click', resetDeclaredInputs);

    const chartCloseBtn = document.getElementById('chartCloseBtn');
    function toggleChartFullscreen(force) {
      const on = force == null ? !document.body.classList.contains('body-fullscreen') : !!force;
      document.body.classList.toggle('body-fullscreen', on);
      mainView.classList.toggle('chart-only-fullscreen', on);
      setTimeout(resizeCanvas, 20);
    }
    vizWrap.addEventListener('click', e => {
      if (state.captureMode) {
        if (state.vizPage === 'P2') {
          setCaptureMode(false);
          return;
        }
        const rect = vizWrap.getBoundingClientRect();
        const chartPoint = fromScreen(e.clientX - rect.left, e.clientY - rect.top);
        applyClickToAnchor(chartPoint);
        return;
      }
      if (e.target === chartCloseBtn) return;
      if (!document.body.classList.contains('body-fullscreen')) toggleChartFullscreen(true);
    });
    chartCloseBtn.addEventListener('click', e => { e.stopPropagation(); toggleChartFullscreen(false); });
    const page1Btn = document.getElementById('page1Btn');
    const page2Btn = document.getElementById('page2Btn');
    if (page1Btn) page1Btn.addEventListener('click', e => { e.stopPropagation(); setVizPage('P1'); });
    if (page2Btn) page2Btn.addEventListener('click', e => { e.stopPropagation(); setVizPage('P2'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleChartFullscreen(false); });

    const advancedToggle = document.getElementById('advancedToggle');
    const advancedWrap = document.getElementById('advancedWrap');
    function syncAdvancedPanel() {
      const open = !!advancedToggle.checked;
      advancedWrap.hidden = false;
      advancedWrap.classList.toggle('open', open);
      if (!open) { advancedWrap.scrollTop = 0; }
      saveUiState();
    }
    advancedToggle.checked = !!state.advancedOpen;
    if (advancedToggle.checked) { advancedWrap.hidden = false; advancedWrap.classList.add('open'); }
    advancedToggle.addEventListener('change', () => { state.advancedOpen = advancedToggle.checked; syncAdvancedPanel(); });

    refreshBaseOptions();
    renderChartPageControls();
    setCurrentBase(state.currentBaseId);
    if (persisted.rto) document.getElementById('rtoInput').value = persisted.rto;
    syncAdvancedPanel();
    if (!readExternalInbox()) analyze();
