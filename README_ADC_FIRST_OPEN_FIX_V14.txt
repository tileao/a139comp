ADC first-open visual fix

Changes:
- adc/app.js
- sw.js

Fix:
- adds repeated layout/resize passes after chart load, pageshow, viewport resize and visibility return
- improves first-open sizing on iPhone/iPad so the chart does not open cropped before fullscreen is used
