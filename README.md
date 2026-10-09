# SupplyIQ — Supply Chain Optimization Demo

**TEAM RSG · AI FUSION 2026**

A responsive frontend demonstration prototype inspired by the team's AI-Powered Supply Chain Optimization Platform presentation.

## Features
- Overview dashboard with calculated inventory KPIs
- Inventory management: add, edit, delete and adjust stock
- Demand forecast baseline using the average of the latest three entered demand values
- Shipment creation and status updates
- Basic route/cost/duration comparison cards
- Risk alerts generated from stock reorder thresholds and shipments marked delayed
- Browser Local Storage persistence
- Responsive desktop and mobile navigation
- Reset demo data control

## Technology
- HTML5
- CSS3
- Vanilla JavaScript
- Local Storage
- Git / GitHub

## Run locally
1. Download or clone this repository.
2. Open `index.html` in a modern browser.

Recommended for development: use a simple local static server or VS Code Live Server, but neither is required just to open the demo in most browsers.

## Important prototype limitations
- The included products, demand history and shipments are illustrative sample data.
- The demand forecast is a transparent moving-average baseline, not a trained AI/ML model.
- There is no backend, shared database, authentication, ERP/IoT integration, live GPS, live traffic, or real carrier API.
- Data is saved only in the current browser's Local Storage and is not shared between users/devices.
- Route costs and transit times are user-entered estimates, not live route optimization.
- Do not use this prototype for real operational decisions without validation and a secure backend.

## Demo flow
1. Review the overview dashboard.
2. Open Inventory and edit stock or use “−5 stock” to trigger an alert.
3. Open Demand Forecast and calculate a baseline from recent values.
4. Create a shipment and change its status to see shipment alerts update.
5. Refresh the browser to confirm Local Storage persistence.
6. Use the reset icon to restore sample data.

## Source basis
This prototype implements selected interactive frontend demonstrations based on the proposed modules described in the AI FUSION 2026 Supply Chain Optimization presentation. It does not claim that the proposed production AI modules have already been implemented.
