const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'src/app/features/dashboard/shiny/shiny-dashboard.component.html');
const cssPath = path.join(__dirname, 'src/app/features/dashboard/shiny/shiny-dashboard.component.css');

let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Wrap with page-wrapper
html = html.replace(/<div class="dashboard-container">/g, '<div class="page-wrapper">\n  <div class="container-fluid mx-auto p-3">');
// Find the last </div> and add another one
const lastDivIndex = html.lastIndexOf('</div>');
html = html.substring(0, lastDivIndex) + '</div>\n</div>' + html.substring(lastDivIndex + 6);

// 2. Change header
html = html.replace(
  /<div class="dashboard-header">[\s\S]*?<h1>(.*?)<\/h1>\s*<div class="header-controls">/m,
  `<div class="aero-header mb-4">
    <div class="aero-header-content">
      <div class="d-flex align-items-center" style="gap: 1rem;">
        <div class="aero-icon-orb"><i class="bi bi-speedometer2"></i></div>
        <div>
          <h1 class="aero-title">$1</h1>
          <div class="aero-subtitle">Monitoreo y Control de Dispositivos</div>
        </div>
      </div>
      <div class="header-controls">`
);
html = html.replace(/<\/div>\s*<\/div>\s*<\!-- Device Activity/m, '</div>\n    </div>\n  </div>\n\n  <!-- Device Activity');

// 3. Update buttons
html = html.replace(/class="btn btn-secondary/g, 'class="aero-btn aero-btn-secondary');
html = html.replace(/class="chart-toggle-btn"/g, 'class="aero-btn aero-btn-primary"');
html = html.replace(/class="refresh-btn"/g, 'class="aero-btn aero-btn-primary"');
html = html.replace(/class="btn btn-sm btn-light"/g, 'class="aero-btn aero-btn-secondary btn-sm"');
html = html.replace(/<button class="retry-btn"/g, '<button class="aero-btn aero-btn-danger"');

// 4. Update cards
html = html.replace(/class="card mb-4"/g, 'class="aero-card mb-4"');
html = html.replace(/class="card-header/g, 'class="aero-card-header');
html = html.replace(/class="card-body"/g, 'class="aero-card-body"');

// 5. Update activity cards
html = html.replace(/class="activity-card/g, 'class="aero-card activity-card');
html = html.replace(/overview-card/g, 'aero-card overview-card');
html = html.replace(/device-card/g, 'aero-card device-card');

fs.writeFileSync(htmlPath, html);
console.log('HTML updated');

let css = fs.readFileSync(cssPath, 'utf8');

// Completely replace CSS with the proper Aero CSS
const aeroCss = `/* ============================================================================
   SHINY DASHBOARD COMPONENT — FRUTIGER AERO THEME
   ============================================================================ */

@keyframes aeroFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #a8d8f0 0%, #c5e8fb 25%, #daf1fd 55%, #eef8fe 80%, #f5fcff 100%);
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1a3a5c;
  animation: aeroFadeIn 0.5s ease-out;
}

.container-fluid {
  max-width: 1400px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Scrollbars */
.container-fluid::-webkit-scrollbar { width: 8px; }
.container-fluid::-webkit-scrollbar-track { background: rgba(255,255,255,0.3); border-radius: 4px; }
.container-fluid::-webkit-scrollbar-thumb { background: rgba(120,180,240,0.5); border-radius: 4px; }

/* Aero Header */
.aero-header {
  background: linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(220,240,255,0.80) 50%, rgba(180,220,255,0.65) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.9);
  border-bottom: 1px solid rgba(120,180,240,0.35);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(60,140,220,0.12), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(100,170,240,0.2);
  padding: 1.2rem;
  position: relative;
  overflow: hidden;
}
.aero-header::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0)); pointer-events: none;
}
.aero-header-content { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }

.aero-icon-orb {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(145deg, #5bc4f5 0%, #2196f3 50%, #0d6ab5 100%);
  box-shadow: 0 4px 12px rgba(33,150,243,0.5), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,60,140,0.3);
  display: flex; align-items: center; justify-content: center; font-size: 1.4rem; color: white; position: relative;
}
.aero-icon-orb::before {
  content: ''; position: absolute; top: 4px; left: 6px; right: 6px; height: 40%;
  background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0)); border-radius: 50%;
}
.aero-title { font-size: 1.5rem; font-weight: 700; color: #1a3a5c; text-shadow: 0 1px 0 rgba(255,255,255,0.8); margin: 0; }
.aero-subtitle { font-size: 0.85rem; color: #4a7a9b; font-weight: 500; }

.header-controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }

/* Aero Buttons */
.aero-btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; gap: 0.4rem; justify-content: center;
  border-radius: 22px; font-weight: 600; padding: 0.55rem 1.1rem; font-size: 0.88rem;
  cursor: pointer; transition: all 0.25s ease; border: none; outline: none;
}
.aero-btn::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0)); border-radius: 22px 22px 0 0;
}
.aero-btn:hover { transform: translateY(-1px); }

.aero-btn-primary {
  background: linear-gradient(180deg, #5bc4f5 0%, #2196f3 50%, #1565c0 100%);
  border: 1px solid rgba(33,150,243,0.6); color: white;
  box-shadow: 0 3px 12px rgba(33,150,243,0.35), inset 0 1px 0 rgba(255,255,255,0.35);
}
.aero-btn-primary:hover { background: linear-gradient(180deg, #80d4ff 0%, #42a5f5 50%, #1976d2 100%); color: white; }

.aero-btn-secondary {
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(210,233,255,0.75) 100%);
  border: 1px solid rgba(90,160,230,0.45); color: #1a5fa0;
  box-shadow: 0 2px 8px rgba(60,130,220,0.2), inset 0 1px 0 rgba(255,255,255,0.85);
}
.aero-btn-secondary:hover { background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(190,225,255,0.85) 100%); color: #1a3a5c; }

.aero-btn-danger {
  background: linear-gradient(180deg, #ff8a80 0%, #f44336 50%, #d32f2f 100%);
  border: 1px solid rgba(244,67,54,0.6); color: white;
}

/* Aero Cards */
.aero-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(220,240,255,0.65) 100%);
  backdrop-filter: blur(12px); border-radius: 16px; border: 1px solid rgba(255,255,255,0.85);
  box-shadow: 0 4px 16px rgba(60,140,220,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.aero-card:hover { box-shadow: 0 8px 24px rgba(60,140,220,0.18); }

.aero-card-header {
  padding: 1rem 1.2rem;
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(220,240,255,0.4) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.8);
  font-weight: 700; color: #1a3a5c; text-shadow: 0 1px 0 rgba(255,255,255,0.7);
}
.aero-card-header.bg-primary { background: linear-gradient(180deg, rgba(82, 172, 255, 0.5) 0%, rgba(33, 150, 243, 0.4) 100%); }
.aero-card-header.bg-info { background: linear-gradient(180deg, rgba(121, 219, 250, 0.5) 0%, rgba(0, 188, 212, 0.4) 100%); }
.aero-card-header.bg-warning { background: linear-gradient(180deg, rgba(255, 222, 115, 0.6) 0%, rgba(255, 193, 7, 0.5) 100%); }
.aero-card-header.bg-success { background: linear-gradient(180deg, rgba(132, 230, 169, 0.5) 0%, rgba(76, 175, 80, 0.4) 100%); }
.aero-card-header.bg-dark { background: linear-gradient(180deg, rgba(162, 185, 210, 0.6) 0%, rgba(96, 125, 139, 0.5) 100%); }

.aero-card-body { padding: 1.2rem; }

/* Grid systems & specific classes inside Shiny dashboard */
.activity-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.system-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.devices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.85rem; }

.activity-card h3 { font-size: 0.85rem; font-weight: 700; color: #3a6a9c; margin: 0 0 0.5rem 0; text-transform: uppercase; }
.activity-number { font-size: 2rem; font-weight: 700; color: #1a3a5c; text-shadow: 0 1px 0 rgba(255,255,255,0.8); }
.activity-percentage { font-size: 0.8rem; color: #3a6a9c; margin-top: 0.25rem; }
.activity-card.total .activity-number { color: #2196f3; }
.activity-card.active .activity-number { color: #2db86a; }
.activity-card.inactive .activity-number { color: #607d8b; }

.overview-card h3 { font-size: 0.88rem; font-weight: 700; color: #1a3a5c; margin: 0 0 0.85rem 0; }

.status-summary { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.status-item {
  display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.65rem;
  border-radius: 16px; font-size: 0.78rem; font-weight: 600;
  backdrop-filter: blur(4px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
}
.status-item::before { content: '●'; font-size: 0.7rem; }
.status-item.online { background: rgba(45,184,106,0.15); color: #166534; border: 1px solid rgba(45,184,106,0.25); }
.status-item.online::before { color: #2db86a; }
.status-item.warning { background: rgba(255,167,38,0.15); color: #92400e; border: 1px solid rgba(255,167,38,0.25); }
.status-item.warning::before { color: #ffa726; }
.status-item.offline { background: rgba(244,67,54,0.1); color: #7f1d1d; border: 1px solid rgba(244,67,54,0.2); }
.status-item.offline::before { color: #f44336; }
.status-item.inactive { background: rgba(120,160,200,0.15); color: #1a3a5c; border: 1px solid rgba(120,160,200,0.25); }
.status-item.inactive::before { color: #607d8b; }

.device-header { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.8rem; }
.device-header h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #1a5fa0; }
.device-content .reading { display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.85rem; border-bottom: 1px dashed rgba(120,180,240,0.3); padding-bottom: 0.2rem; }
.device-content .label { color: #3a6a9b; font-weight: 600; }
.device-content .value { color: #1a3a5c; font-weight: 700; }

.device-status-badge span {
  font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 12px; font-weight: 700; color: white;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); text-shadow: 0 1px 1px rgba(0,0,0,0.2);
}
.online-badge { background: linear-gradient(180deg, #43e97b 0%, #38f9d7 100%); }
.warning-badge { background: linear-gradient(180deg, #ffca28 0%, #ff9800 100%); color: #1a3a5c !important; text-shadow: none; }
.offline-badge { background: linear-gradient(180deg, #ff8a80 0%, #f44336 100%); }
.inactive-badge { background: linear-gradient(180deg, #90a4ae 0%, #607d8b 100%); }

/* Rest of specific component css like charts... */
/* Error state */
.error-state { text-align: center; padding: 3rem 2rem; }
.error-state .error-message { color: #f44336; font-weight: 700; font-size: 1.1rem; }
.loading-state { text-align: center; padding: 3rem 2rem; color: #1a5fa0; font-weight: 600; }
.spinner { border: 4px solid rgba(255,255,255,0.5); border-top: 4px solid #2196f3; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Charts container classes for overriding component specific styles */
.charts-section { padding: 1rem; background: rgba(255,255,255,0.3); border-radius: 12px; }
.chart-type-selector { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.chart-type-btn {
  background: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(220,240,255,0.7) 100%);
  border: 1px solid rgba(120,180,240,0.5); border-radius: 8px; padding: 0.4rem 0.8rem; font-weight: 600; color: #1a5fa0;
  transition: all 0.2s; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.chart-type-btn.active, .chart-type-btn:hover { background: linear-gradient(180deg, #5bc4f5 0%, #2196f3 100%); color: white; }
.charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
.chart-container { background: rgba(255,255,255,0.6); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.9); }
.chart-header h3 { font-size: 0.9rem; margin-bottom: 0.5rem; color: #1a3a5c; }
.mini-chart { width: 100% !important; height: 200px !important; }

/* Keep Wind Rose & Thermostat specific styles, modified slightly for Aero */
.chart-card { background: rgba(255,255,255,0.5); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.8); }
.thermostats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.thermostat-gauge { background: rgba(255,255,255,0.6); border-radius: 16px; padding: 1rem; border: 1px solid rgba(255,255,255,0.9); box-shadow: 0 4px 12px rgba(60,140,220,0.1); }
.thermostat-svg { width: 100%; height: auto; max-width: 300px; display: block; margin: 0 auto; }
.thermostat-stats { margin-top: 1rem; font-size: 0.85rem; }
.stat-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.stat-item { background: rgba(255,255,255,0.7); padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.9); display: flex; align-items: center; gap: 0.5rem; flex: 1; margin: 0 0.25rem; }
.stat-label { color: #3a6a9b; font-weight: 600; flex: 1; }
.stat-value { color: #1a3a5c; font-weight: 700; }
.status-badge { margin-top: 0.5rem; text-align: center; padding: 0.4rem; border-radius: 8px; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.status-optimal { background: linear-gradient(180deg, #43e97b 0%, #38f9d7 100%); }
.status-normal { background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%); }
.status-warning { background: linear-gradient(180deg, #ffca28 0%, #ff9800 100%); }
.range-info { margin-top: 0.8rem; font-size: 0.75rem; color: #3a6a9b; background: rgba(255,255,255,0.6); padding: 0.5rem; border-radius: 8px; }
.range-item { display: flex; justify-content: space-between; margin-bottom: 0.2rem; }
.range-item.optimal { font-weight: 600; color: #1a5fa0; }
.last-update { text-align: center; margin-top: 0.8rem; color: #7f8c8d; font-size: 0.7rem; }

/* Keep DLIg/DLIp Specific styles */
.dlig-summary-cards, .dlip-summary-cards { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.dlig-card, .dlip-card { flex: 1; min-width: 150px; background: rgba(255,255,255,0.7); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.9); box-shadow: 0 4px 12px rgba(60,140,220,0.1); text-align: center; }
.dlig-card-header, .dlip-card-header { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem; font-weight: 600; color: #3a6a9b; }
.dlig-value, .dlip-value { font-size: 1.8rem; font-weight: 700; color: #1a3a5c; }
.dlig-unit, .dlip-unit { font-size: 0.9rem; color: #3a6a9b; }

.tsr-chart-container, .par-chart-container { margin: 1rem 0; overflow-x: auto; background: rgba(0,0,0,0.05); border-radius: 12px; padding: 1rem; }
.tsr-chart-svg, .par-chart-svg { min-width: 600px; display: block; margin: 0 auto; }
.tsr-legend, .par-legend { display: flex; justify-content: center; gap: 1.5rem; margin-top: 1rem; flex-wrap: wrap; }
.tsr-legend-item, .par-legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #1a3a5c; }
.tsr-legend-color, .par-legend-color { width: 16px; height: 16px; border-radius: 4px; }
.tsr-legend-max .tsr-legend-color { background: #ff8a80; }
.tsr-legend-mean .tsr-legend-color { background: #ffd54f; }
.tsr-legend-min .tsr-legend-color { background: #4fc3f7; }
.par-legend-par .par-legend-color { background: linear-gradient(to right, #8b00ff, #0000ff, #00ff00, #ffff00, #ff7f00, #ff0000); }
.par-legend-dlip .par-legend-color { background: #00bfff; }
.chart-footer { margin-top: 1rem; text-align: center; color: #3a6a9b; font-size: 0.8rem; background: rgba(255,255,255,0.6); padding: 0.5rem; border-radius: 8px; }
.tsr-footer-badge, .par-footer-badge { background: rgba(255,255,255,0.9); padding: 0.2rem 0.5rem; border-radius: 12px; margin-left: 0.5rem; font-weight: 600; border: 1px solid rgba(120,180,240,0.3); }

/* Wind rose specific */
.custom-wind-rose-container { display: flex; justify-content: center; align-items: center; padding: 1rem; }
.wind-rose-svg { max-width: 100%; height: auto; }
`

fs.writeFileSync(cssPath, aeroCss);
console.log('CSS updated');
