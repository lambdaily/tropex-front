Extend the existing Tropero UI design and create separate dashboards for each user role in the platform.

Tropero is a livestock transport marketplace in Paraguay that connects ranchers (ganaderos) with transport companies and truck drivers. The platform is similar to Uber Freight but specialized for cattle transportation.

Important:
This is a FRONTEND DEMO ONLY. Do not design complex backend logic. The goal is to visually demonstrate how the product works.

Design separate dashboards for the following roles:

1. Rancher / Ganadero
2. Transport Company (Empresa)
3. Owner-Operator
4. Company Driver (Chofer de Empresa)

Start by duplicating the base dashboard design that already exists and adapt it for each role.

The visual style should remain consistent with the Tropero brand:
- black and white primary colors
- accent tones inspired by Paraguayan countryside (grass green and earth brown)
- minimal modern SaaS interface
- logistics/agriculture aesthetic
- logo: side profile of a Zebu cattle

All dashboards should use the same structure:
- top navigation bar
- sidebar navigation
- main dashboard content
- quick actions panel
- activity summary cards

However, each role should have slightly different quick actions and panels.

--------------------------------

FOCUS AREA: Rancher / Ganadero Dashboard

The rancher dashboard should feel like the main product experience.

Main goal of this dashboard:
Allow ranchers to easily create and manage livestock transport requests.

Top section:
Show a welcome message like:

"Panel del productor"

Include summary cards such as:
- Transportes activos
- Solicitudes abiertas
- Transportes completados
- Costo total del mes

--------------------------------

Quick Actions Panel

Include large action buttons:

1. Nuevo envío
2. Historial de envíos
3. Reportes
4. Soporte

Make "Nuevo envío" the primary action.

--------------------------------

New Shipment Flow (Important)

When the user clicks "Nuevo envío", show a multi-step form for creating a livestock transport request.

This should be visually clean and simple.

Step 1 – Origin
- Ranch or farm location
- Department / region
- Pickup date
- Estimated loading time

Step 2 – Destination
- Destination location
- Type of destination (auction, slaughterhouse, another ranch)

Step 3 – Livestock details
- Number of cattle
- Estimated weight category
- Special handling notes

Step 4 – Transport preferences
- Preferred truck type
- Flexible pickup window
- Additional notes

Step 5 – Price expectation
Explain that transport providers will propose pricing.

--------------------------------

Cancellation Warning

On the confirmation screen include a visible warning box that says:

"If a shipment is cancelled after a transport provider has accepted the trip without a justified reason or force majeure (act of God), a cancellation fee of 2% of the transport cost may apply."

This warning should be clearly visible but not alarming.

--------------------------------

Other Rancher Panels

Include sections for:

Active Shipments
Show transport status cards like:
- waiting for transport provider
- accepted
- in transit
- delivered

Transport History
List previous shipments with date, origin, destination, cattle count, and price.

--------------------------------

Other Dashboards (lighter detail)

Transport Company Dashboard
Quick actions:
- Gestionar flota
- Gestionar conductores
- Ver viajes disponibles
- Reportes

Owner-Operator Dashboard
Quick actions:
- Ver viajes disponibles
- Historial de viajes
- Ingresos
- Documentos

Company Driver Dashboard
Quick actions:
- Viaje actual
- Viajes asignados
- Estado del transporte
- Documentos

--------------------------------

Design rules

Use a clean SaaS dashboard layout similar to logistics platforms.

Include:
- sidebar navigation
- large action buttons
- card-based UI
- simple status indicators
- modern typography
- mobile-friendly layout

Focus especially on the rancher dashboard and make the "Nuevo envío" workflow feel intuitive and easy to complete.

The design should feel realistic enough for a product demo, investor presentation, or developer handoff.