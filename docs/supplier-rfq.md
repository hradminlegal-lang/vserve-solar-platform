# Parts price requests (supplier RFQ)

An installer sends the parts list (BOM) of a design to several verified distributors in one step. Each distributor answers with prices, confirmed stock, delivery date and warranty channel. The installer compares, holds the stock for a short time, and awards the order. This links the design studio to suppliers and gives suppliers a reason to join before the consumer marketplace has traffic.

## Who
- **Buyer:** an installer/EPC company (member with role owner, admin or engineer).
- **Suppliers:** verified companies of type distributor (or installers who also sell), with service regions and the brands they are authorised to sell.

## Flow and statuses
1. **Create** from a design version's BOM or from scratch: line items (catalogue product, or free text), quantity, allowed alternatives per line (any / same specs / named models only), delivery address and needed-by date, notes. Status `draft`.
2. **Send** to suppliers: auto-suggested (region covers the delivery address, sells the brands asked, verified) plus any the installer picks; 2–8 suppliers. Status `open`; deadline default 48 h.
3. **Supplier quote** per line: unit price, quantity available now, lead time if not in stock, proposed alternative (with specs), warranty channel (authorised distributor yes/no, warranty terms), delivery fee and date, quote validity (default 7 days). Suppliers can decline with a reason. Suppliers never see other suppliers' prices.
4. **Compare**: landed total (items + delivery), lines fully covered, earliest complete delivery date, alternatives flagged, authorised-channel flag, supplier rating. Split awards allowed (different suppliers per line).
5. **Hold stock** (soft reservation): installer asks a supplier to hold quoted stock for up to 72 h; supplier confirms or declines; it lapses automatically.
6. **Award** → purchase order (PDF + record) to each winning supplier; non-winners notified. Status `awarded`.
7. **Fulfil**: supplier confirms dispatch, delivery tracking, proof of delivery (photo + signature/name), serial numbers for panels, inverters and batteries recorded against the project. Status `delivered` / `closed`.
8. **Pay**: phase 2 offline (bank transfer/terms), recorded on the order; phase 4 through PayMongo with the same rails as the marketplace.

## Rules
- Supplier prices and quotes are visible only to the requesting company and that supplier.
- Alternatives must be confirmed by the buyer line by line before award.
- Serial numbers captured at delivery flow into the project and later into the homeowner's system record.
- Response time, quote-to-award rate and delivery promise accuracy are tracked per supplier and feed their rating.
- A licensed engineer must approve any alternative that changes electrical specs on a signed design (creates a new design version).

## Metrics to watch
Time to first quote, suppliers responding per request (target ≥ 2), landed cost vs the installer's usual supplier, stock-confirmation accuracy, on-time delivery, repeat requests per installer.
