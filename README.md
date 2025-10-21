# Crochet Diagram Web App

A web-based tool for visualizing and editing crochet stitch diagrams.  
Built with TypeScript to provide an interactive and structured way to represent crochet patterns digitally.

## 🧩 Current Progress

### addStitch Function
- Fully implemented logic for adding stitches to both **row** and **round** diagrams
- Handles:
  - Turning chains and included turning chains
  - Chain-space validation and connection
  - Parent-child stitch relationships
  - Error handling for invalid additions

### ✅ Unit Tests
- Comprehensive test coverage for:
  - Valid stitch placements
  - Edge cases (e.g., turning chain behavior, invalid parents, improper chain sequences)
  - Error message validation

## ⚙️ Tech Stack
- **Language:** TypeScript  
- **Testing:** Jest  
- **Framework:** [add here later when you define it, e.g. React, Express, etc.]

## 🚧 Next Steps
- Implement `editStitch` and `deleteStitch` functionality
- Add diagram rendering and user interface components
