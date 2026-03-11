  DO NOT MODIFY THEM ALL IN 1 RESPONSE, YOU WILL RUN OUT OF CONTEXT, GO 1 BY 1 AWAITNG MY CONFIRMATION TO PROCEED WITH THE NEXT
  
  
  You need to apply a "Frutiger Aero" CSS theme to all Angular components in this project. The reference theme is already
       fully implemented in the nutrient-formulation component.

       Step 1: Read the FULL reference CSS

       Read the entire file:
       C:\Users\AlexQQ\Desktop\agrismart-web-v1_1\src\app\features\nutrient-formulation\nutrient-formulation.component.css

       Also read the nutrient-formulation HTML to understand the class names used:
       C:\Users\AlexQQ\Desktop\agrismart-web-v1_1\src\app\features\nutrient-formulation\nutrient-formulation.component.html

       Step 2: Read every target component's HTML + CSS

       For each component below, read BOTH the .html and .css files:

       1. src/app/features/admin/admin.component (.html, .css)
       2. src/app/features/crop-phases/crop-phase/crop-phase.component (.html, .css)
       3. src/app/features/crop-phases/phase-requirements/phase-requirements.component (.html, .css)
       4. src/app/features/water/water-chemistry.component (.html, .css)
       5. src/app/features/fertilizers/fertilizer-list/fertilizer-list.component (.html, .css)
       6. src/app/features/process-kpis/process-kpis.component (.html, .css)
       7. src/app/features/soil-analysis/components/soil-analysis-form/soil-analysis-form.component (.html, .css)
       8. src/app/features/dashboard/shiny/shiny-dashboard.component (.html, .css)
       9. src/app/features/soil-analysis/components/soil-analysis-manager/soil-analysis-manager.component (.html, .css)
       10. src/app/features/crop-production/crop-production-list/crop-production-list.component (.html, .css)
       11. src/app/features/production-units/production-unit-list/production-unit-list.component (.html, .css)
       12. src/app/features/crop-production-specs/crop-production-specs-list.component (.html, .css)
       13. src/app/features/irrigation-engineering-design/irrigation-engineering-design.component (.html, .css)
       14. src/app/features/droppers/dropper-list/dropper-list.component (.html, .css)
       15. src/app/features/irrigation/on-demand-irrigation.component (.html, .css)
       16. src/app/features/containers/container-manager/container-manager.component (.html, .css)
       17. src/app/features/growing-medium/crop-medium-manager/crop-medium-manager.component (.html, .css)
       18. src/app/features/dashboard/dashboard.component (.html, .css) — note: the CSS file may not exist at the usual path,
       check src/app/features/dashboard/dashboard.component.css
       19. src/app/features/companies/company-list/company-list.component (.html, .css)
       20. src/app/features/farms/farm-list/farm-list.component (.html, .css)
       21. src/app/features/devices/device-list/device-list.component (.html, .css)
       22. src/app/features/crops/crop-list/crop-list.component (.html, .css)
       23. src/app/features/crop-production-specs/crop-production-specs-list.component (.html, .css)

       All paths are under: C:\Users\AlexQQ\Desktop\agrismart-web-v1_1\

       Step 3: Apply the Frutiger Aero theme

       For each component, you must:

       CSS changes:

       Rewrite the component's CSS file to use the full Frutiger Aero visual language:
       - Background gradient: linear-gradient(160deg, #a8d8f0 0%, #c5e8fb 25%, #daf1fd 55%, #eef8fe 80%, #f5fcff 100%)
       - Font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
       - Text color: #1a3a5c
       - Cards/panels: glass-morphism with backdrop-filter: blur, semi-transparent white/blue backgrounds, border: 1px solid
       rgba(255,255,255,0.9), rounded corners (12–20px), multi-layer box-shadow
       - Buttons: glossy pill buttons with top-highlight gradient (::before pseudo-element for sheen), blue gradient fills,
       rounded (20–28px)
       - Form inputs: semi-transparent, frosted glass look with blue focus rings
       - Tables: glassy headers, row hover effects with light blue tint
       - Badges/tags: pill-shaped with gradient fills in blue, green, purple, teal
       - Headers/titles: text-shadow: 0 1px 0 rgba(255,255,255,0.8), dark blue #1a3a5c
       - Icon orbs: circular gradient orbs with highlight sheen ::before
       - Scrollbars: thin, rounded, blue-tinted
       - Animations: aeroFadeIn (opacity + translateY) on load
       - Aero color palette: blues #a8d8f0, #2196f3, #1a3a5c; greens #2db86a; purples #8b5cf6

       HTML changes:

       Wrap the component's existing content with the Aero layout classes if not already present. Look at what the component has
       and adapt:
       - Outer wrapper: <div class="page-wrapper">
       - Inner: <div class="container-fluid mx-auto p-3">
       - Add an .aero-header section at the top with: icon orb, title, subtitle
       - Convert any Bootstrap cards to use .aero-card / .aero-glass-card classes
       - Convert buttons to use .aero-btn / .aero-btn-primary etc.
       - Convert tables to use .aero-table class
       - Convert form inputs to use .aero-input / .aero-select classes
       - Add .aero-badge for status badges
       - Keep all existing Angular bindings, *ngFor, *ngIf, (click), [(ngModel)], etc. — only change CSS classes and wrapper
       structure

       Key CSS classes to define for each component:

       - .page-wrapper - full-height gradient background
       - .aero-header - glass header panel
       - .aero-icon-orb - circular gradient icon
       - .aero-title, .aero-subtitle
       - .aero-card / .aero-glass-card - main content cards
       - .aero-btn, .aero-btn-primary, .aero-btn-danger, .aero-btn-success, .aero-btn-secondary - glossy buttons
       - .aero-input, .aero-select, .aero-textarea - frosted form controls
       - .aero-table - glassmorphic table
       - .aero-badge, .aero-badge-blue, .aero-badge-green, .aero-badge-red, .aero-badge-purple - pill badges
       - .aero-modal-overlay, .aero-modal - modal overlay + dialog

       Important rules:

       - Preserve ALL Angular functionality (all event bindings, structural directives, template variables)
       - Do NOT remove any HTML elements, only change class names and add wrapper divs
       - Make sure every CSS class used in the HTML is defined in the CSS
       - Keep ViewEncapsulation behavior in mind — component CSS is scoped, so don't add html, body rules (those are for the
       nutrient-formulation which has ViewEncapsulation.None or styles in global). Instead put background on .page-wrapper
       - Write complete, fully rewritten CSS files (not partial patches)
       - Write complete, fully rewritten HTML files

       Start by reading all the files, then write all the outputs. Work through each component one by one.