# Build: AI Document Studio

Build a production-quality web application called **AI Document Studio** using **Next.js, TypeScript, Tailwind CSS, and PostgreSQL**.

The application allows users to upload existing documents such as PDF, images, Excel, CSV, DOCX, Markdown, and text files. The system extracts and structures the information, detects the document type, presents the extracted information in an editable form, allows the user to choose from professionally designed templates, and finally exports the modified document as PDF or Excel where appropriate.

The product should feel like a modern SaaS application, not a basic AI demo.

---

# 1. Core Product Flow

The main workflow must be:

```text
Upload Document
      ↓
Analyze File
      ↓
Extract Content
      ↓
Detect Document Type
      ↓
Convert to Structured Data
      ↓
Show Extraction Results
      ↓
Editable Document Form
      ↓
Choose Template / Design
      ↓
Preview
      ↓
Export
```

The user should always be able to manually edit AI-extracted information before exporting.

---

# 2. Supported Input Files

Initially support:

- PDF
- JPG
- JPEG
- PNG
- WEBP
- XLSX
- XLS
- CSV
- DOCX
- MD
- TXT

Design the upload system so additional formats can be added later.

The upload interface should support:

- Drag and drop
- File picker
- File type validation
- File size validation
- Upload progress
- Processing status
- Error handling
- Retry processing
- Remove uploaded file

Do not expose raw AI/API errors directly to users. Show friendly messages.

---

# 3. Supported Document Types

The first version should support:

### Invoice

Fields:

- Invoice number
- Invoice date
- Due date
- Seller/company information
- Customer/billing information
- Shipping information
- Items
- Quantity
- Unit price
- Discount
- Tax
- Subtotal
- Total
- Currency
- Payment information
- Notes
- Terms

### Receipt

Fields:

- Receipt number
- Date
- Store/company
- Customer
- Items
- Quantity
- Price
- Tax
- Discount
- Total
- Payment method
- Notes

### CV / Resume

Fields:

- Full name
- Job title
- Profile summary
- Contact information
- Location
- Website
- LinkedIn
- GitHub
- Work experience
- Education
- Skills
- Projects
- Certifications
- Languages
- Awards
- References

### Quotation

Fields:

- Quotation number
- Date
- Valid until
- Company
- Customer
- Items/services
- Quantity
- Unit price
- Discount
- Tax
- Subtotal
- Total
- Terms
- Notes

### Purchase Order

Fields:

- PO number
- Date
- Supplier
- Buyer
- Delivery address
- Items
- Quantity
- Unit price
- Tax
- Total
- Delivery information
- Payment terms
- Notes

The architecture must make it easy to add new document types later.

---

# 4. AI Document Detection

After upload, analyze the document and determine its type.

Possible types:

```text
invoice
receipt
cv
quotation
purchase_order
report
expense_report
payslip
bank_statement
product_catalog
unknown
```

The AI should return structured JSON.

Example:

```json
{
  "documentType": "invoice",
  "confidence": 0.96,
  "data": {}
}
```

If confidence is low, ask the user to confirm the document type.

Example:

```text
We think this is an Invoice.

Confidence: 72%

[ Invoice ] [ Receipt ] [ Quotation ] [ Other ]
```

Never silently make a low-confidence decision.

---

# 5. Extraction Architecture

Do NOT send every file blindly to an AI API.

Use the appropriate parser first.

For example:

```text
Excel
→ Excel parser
→ structured data

CSV
→ CSV parser
→ structured data

Markdown
→ Markdown parser
→ structured data

DOCX
→ DOCX parser
→ extracted text

PDF
→ PDF text extraction
→ if scanned, OCR

Image
→ OCR / Vision AI

Extracted content
→ AI structured extraction
```

Use AI primarily for:

- document classification
- semantic extraction
- normalization
- ambiguous fields
- converting unstructured text into the application's schema

Keep deterministic parsing separate from AI processing.

---

# 6. Normalized Document JSON

All document types should ultimately be represented using a normalized structure.

Example:

```json
{
  "id": "document-id",
  "type": "invoice",
  "confidence": 0.96,
  "sourceFile": {
    "name": "invoice.pdf",
    "type": "application/pdf"
  },
  "data": {},
  "metadata": {
    "createdAt": "",
    "updatedAt": ""
  }
}
```

Do not tightly couple the editor to a specific AI provider.

Create an abstraction such as:

```text
AIProvider
```

so OpenAI, Gemini, Anthropic, or another provider can be swapped later.

---

# 7. AI Provider

Create a clean server-side AI service.

Example conceptual structure:

```text
/lib/ai/
    provider.ts
    extraction.ts
    classification.ts
    prompts/
```

Never expose AI API keys to the browser.

All AI requests must happen server-side.

Use environment variables.

Example:

```env
AI_PROVIDER=
AI_API_KEY=
DATABASE_URL=
```

Do not hardcode secrets.

---

# 8. Dashboard

Create a modern SaaS dashboard.

Main navigation:

```text
Dashboard
Documents
Templates
Create Document
Settings
```

Dashboard should show:

- Total documents
- Recent documents
- Processing documents
- Export history
- Document type statistics

Main CTA:

```text
+ Upload Document
```

Recent documents should show:

- Document name
- Type
- Status
- Updated date
- Actions

Actions:

```text
Open
Edit
Duplicate
Export
Delete
```

---

# 9. Upload Page

Create a polished upload page.

Main area:

```text
Drop your document here

or

[ Browse Files ]

Supported:
PDF, Images, Excel, CSV, DOCX, MD, TXT
```

After upload:

```text
invoice.pdf

Uploading...
Analyzing...
Extracting data...
Preparing editor...
```

Show meaningful processing states.

---

# 10. Extraction Review

Before opening the editor, show an extraction review screen.

Example:

```text
Document detected

Invoice
96% confidence

Company
ABC Trading Ltd

Invoice Number
INV-1001

Date
23 Sep 2026

Total
$1,250

[ Review & Edit ]
```

For uncertain fields, visually indicate them.

Example:

```text
Tax
$125
⚠ Needs verification
```

The user should be able to correct extraction mistakes.

---

# 11. Editable Document Editor

This is one of the most important parts of the application.

Create a dynamic editor depending on document type.

For Invoice:

```text
General Information
Company
Customer
Invoice Information
Items
Taxes
Totals
Notes
Terms
```

For CV:

```text
Personal Information
Summary
Experience
Education
Skills
Projects
Certifications
Languages
References
```

The editor must support:

- Add
- Edit
- Delete
- Reorder
- Duplicate
- Dynamic arrays
- Validation
- Autosave
- Manual save

For item-based documents, allow adding/removing rows.

Example:

```text
Product      Qty      Price       Total

Shirt        10       $20         $200
Pants        5        $30         $150

[ + Add Item ]
```

Calculate totals automatically where appropriate.

---

# 12. Template System

Create a reusable template engine.

Templates should NOT contain document-specific business logic.

Templates should receive structured document data.

Example:

```text
Template
    ↓
Document Data
    ↓
Rendered Document
```

Create categories:

### Business

- Professional
- Corporate
- Modern
- Classic
- Minimal

### Invoice

- Professional
- Modern
- Corporate
- Minimal
- Classic

### Receipt

- Retail
- Minimal
- Modern

### CV

- Professional
- Modern
- European-style
- Minimal
- Creative

### Report

- Corporate
- Executive
- Technical
- Academic
- Modern

The template system must make it easy to add new templates without changing the editor.

---

# 13. Template Selection

After editing, show a template selection screen.

Example:

```text
Choose a design

[ Professional ]
Preview
[Use Template]

[ Modern ]
Preview
[Use Template]

[ Minimal ]
Preview
[Use Template]
```

Allow switching templates without losing document data.

The same document data should render correctly in different templates.

---

# 14. Live Preview

Create a live preview panel.

Desktop:

```text
┌──────────────────┬──────────────────────┐
│                  │                      │
│   Editor         │    Live Preview     │
│                  │                      │
│   Fields         │    PDF-like view    │
│                  │                      │
└──────────────────┴──────────────────────┘
```

On mobile, use tabs:

```text
[ Edit ] [ Preview ]
```

Preview should update when document data changes.

---

# 15. Export

Initially support:

### PDF

Generate a professional PDF using the selected template.

### Excel

For structured documents such as:

- Invoice
- Receipt
- Quotation
- Purchase Order
- Expense Report
- Product Catalog
- Bank Statement

Export appropriate tabular data to XLSX.

### Future

Keep the architecture ready for:

- DOCX
- CSV
- JSON
- PNG
- Print

---

# 16. Document History

Every document should have a history/version concept.

Example:

```text
Invoice.pdf

Version 1
Version 2
Version 3
Current
```

Users should be able to restore an earlier version.

For MVP, a simple version history is enough.

---

# 17. Database

Use PostgreSQL.

Create appropriate tables/models such as:

```text
users
documents
document_versions
document_files
templates
exports
```

Potential document fields:

```text
id
user_id
name
type
status
source_file
structured_data
confidence
created_at
updated_at
```

Use JSON/JSONB where appropriate for flexible document data.

Do not create dozens of rigid tables for every possible document type.

---

# 18. Authentication

Prepare authentication architecture from the beginning.

Users should have private documents.

A user must never be able to access another user's documents.

Every server-side document query must verify ownership.

---

# 19. Security

Important:

- Never expose AI API keys
- Validate uploaded file types
- Validate file sizes
- Sanitize extracted HTML/text
- Protect API routes
- Verify document ownership
- Do not trust client-provided user IDs
- Validate AI-generated JSON
- Never directly execute AI-generated content
- Handle malicious files safely
- Rate-limit expensive AI endpoints

---

# 20. Storage

Do not depend on the Vercel filesystem for permanent uploads.

Create a storage abstraction:

```text
StorageProvider
```

It should support:

- upload
- download
- delete
- get URL

Make it possible to use:

- Vercel Blob
- S3
- Cloudflare R2
- Supabase Storage

without rewriting the application.

---

# 21. Error Handling

Every processing step must have proper states:

```text
uploaded
processing
extracting
review_required
ready
exporting
completed
failed
```

If AI extraction fails:

```text
We couldn't extract this document.

[ Try Again ]
[ Edit Manually ]
```

Never leave the user with a blank screen.

---

# 22. UI/UX

Design direction:

- Clean
- Modern
- Professional
- SaaS-style
- White/light interface
- Neutral gray backgrounds
- Subtle borders
- Good spacing
- Clear typography
- Minimal unnecessary decoration

Do not make the interface look like an AI chatbot.

This is a document productivity application.

Use reusable components.

Important components:

```text
Button
Modal
Dialog
Dropdown
Tabs
Table
Form
Input
Textarea
FileUploader
Progress
Badge
Toast
EmptyState
LoadingState
DocumentCard
TemplateCard
Preview
```

Ensure the application is fully responsive.

---

# 23. Responsive Design

Desktop should provide:

```text
Sidebar + Main Content
```

Mobile should provide:

```text
Top navigation
Scrollable content
Bottom actions where useful
```

The document editor must work properly on mobile.

Do not create a desktop-only editor.

---

# 24. Project Structure

Use a clean Next.js App Router architecture.

Conceptually:

```text
app/
  (auth)/
  dashboard/
  documents/
  upload/
  editor/
  templates/
  settings/
  api/

components/
  ui/
  documents/
  editor/
  templates/
  upload/
  preview/

lib/
  ai/
  parsers/
  extraction/
  documents/
  templates/
  export/
  storage/
  validation/

types/
  documents/
  templates/

public/
  templates/
```

Adjust the structure if a better Next.js architecture is appropriate, but keep clear separation of concerns.

---

# 25. Code Quality

Use:

- TypeScript
- Strict typing
- Reusable components
- Server-side validation
- Clear service boundaries
- Zod or equivalent schema validation
- ESLint
- Prettier if appropriate

Avoid:

- giant components
- duplicated logic
- hardcoded document fields everywhere
- hardcoded template logic inside pages
- client-side API secrets
- unnecessary dependencies

---

# 26. Important Development Rule

Do NOT try to implement every feature immediately.

Build in phases.

## Phase 1

Create:

- Next.js project
- TypeScript
- Tailwind
- PostgreSQL setup
- Basic authentication architecture
- Dashboard
- Upload UI
- Document database model

## Phase 2

Implement:

- PDF extraction
- Image/OCR processing
- AI document classification
- AI structured extraction

Start with:

```text
Invoice
Receipt
CV
```

## Phase 3

Build:

- Dynamic editor
- Editable fields
- Item tables
- Autosave
- Validation

## Phase 4

Build:

- Template system
- 3–5 templates per document type
- Live preview

## Phase 5

Build:

- PDF export
- Excel export

## Phase 6

Add:

- History
- Versioning
- Better error handling
- Processing status
- Dashboard statistics

Only after the core pipeline works should additional document types be added.

---

# 27. Critical Product Principle

The application must NOT be designed around individual document generators.

Do NOT create completely separate systems like:

```text
Invoice Generator
CV Generator
Receipt Generator
```

Instead build one generic pipeline:

```text
FILE
 ↓
EXTRACTOR
 ↓
DOCUMENT CLASSIFIER
 ↓
NORMALIZED DOCUMENT DATA
 ↓
EDITOR
 ↓
TEMPLATE ENGINE
 ↓
EXPORT ENGINE
```

This is the foundation of the entire product.

Adding a new document type later should primarily require:

```text
New schema
+
New extraction prompt
+
New editor configuration
+
New templates
```

rather than rebuilding the application.

---

# 28. AI Extraction Validation

Never blindly trust AI output.

Validate the result against the document schema.

For example:

```text
AI
 ↓
JSON
 ↓
Zod validation
 ↓
Valid?
 ├── Yes → Editor
 └── No → Repair/retry/manual review
```

For numerical documents, calculate totals independently where possible.

For example:

```text
quantity × unit price
```

should be calculated by application code rather than trusting the AI's calculated total.

---

# 29. Future SaaS Architecture

Design the application so it can later support:

- Free plan
- Pro plan
- Team plan
- Usage limits
- AI credits
- Template marketplace
- Custom branding
- Custom templates
- API access
- White-label version

Do not implement billing yet unless necessary.

Prepare the architecture so billing can be added later.

---

# 30. Landing Page

Create a professional landing page.

Hero:

```text
Turn Any Document Into a Professional, Editable File

Upload a PDF, image, Excel file, CV, invoice, receipt or other document.

AI extracts the information.
You edit it.
Choose a design.
Export it.

[ Upload a Document ]
```

Sections:

- How it works
- Supported documents
- Template examples
- Features
- Export formats
- FAQ
- CTA

Avoid exaggerated AI claims.

---

# 31. Initial MVP Definition

The MVP is successful when this complete flow works:

```text
User uploads invoice.pdf

        ↓

System extracts invoice

        ↓

System detects:
Invoice — 95%

        ↓

User reviews extracted data

        ↓

User edits:
Customer name
Items
Price
Tax

        ↓

User selects:
Modern Invoice

        ↓

Live preview updates

        ↓

User clicks:
Export PDF

        ↓

Professional PDF is generated
```

The same architecture should work for:

```text
Receipt
CV
```

without creating separate applications.

---

# 32. Start Now

First inspect the existing repository and determine whether the project is empty or already initialized.

Then:

1. Set up the Next.js application correctly.
2. Configure TypeScript.
3. Configure Tailwind.
4. Create the base layout.
5. Create the dashboard.
6. Create the upload interface.
7. Create the initial database schema.
8. Create the document type system.
9. Create the AI abstraction.
10. Create the parser/extraction abstraction.
11. Implement Invoice, Receipt and CV as the first document types.
12. Do not implement unnecessary features before the core upload → extraction → edit pipeline works.

Before adding complex functionality, keep the application runnable at every stage.

Use clean, production-quality code rather than temporary hacks.