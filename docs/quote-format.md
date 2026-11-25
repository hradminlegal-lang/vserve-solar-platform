# Standard quote format

Every quote on the platform uses these fields. Required fields are marked *. The 12 "documentation items" counted by `quoteScore` are marked (D).

| Field | Type | Notes |
| --- | --- | --- |
| System type * | grid-tied / hybrid / off-grid | |
| System size kWp * | decimal | must equal panel count × panel W ÷ 1000 (validated) |
| Panel brand and model * (D) | text | |
| Panel count and wattage * (D) | int, int | |
| Inverter brand and model * (D) | text | |
| Inverter rating kW * | decimal | |
| Battery brand, model and kWh (D) | text, decimal | required if hybrid |
| Battery price | ₱ | shown separately; used to compare ₱/kWp ex-battery |
| Mounting system (D) | text | material, roof type |
| Protection and wiring (D) | text | breakers, SPD, DC isolator, cable sizes |
| Labour and installation days (D) | int | |
| Permits and net-metering processing included (D) | yes/no + who files | |
| Panel product warranty years (D) | int | |
| Panel performance warranty (D) | text | e.g. 80% at 25 years |
| Inverter warranty years (D) | int | |
| Workmanship warranty years (D) | int | |
| Expected monthly production kWh * | int | checked against kWp × yield × 30 |
| Total price incl. VAT * | ₱ | |
| Payment terms * | milestones | e.g. 30% contract, 60% delivery, 10% commissioning |
| Valid until * | date | max 30 days |
| Notes | text | |

The documentation count is the number of (D) items filled (max 12; hybrid quotes count battery, grid-tied quotes count it automatically).

Installers can upload their own PDF as an attachment, but the structured fields are what buyers compare. The quote builder (`quoteMargin`) can pre-fill prices.
