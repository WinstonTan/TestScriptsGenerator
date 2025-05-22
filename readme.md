# **AI-Powered Playwright POM Generator**

This project automates the generation of Playwright Page Object Models (POMs) and test files by crawling a target website, detecting interactive elements, and generating reusable, type-safe classes and tests.

---

## **Project Structure**

    playwright-test-project/
    ├── crawler/                # Core logic for crawling and generating POMs/tests
    │   ├── explorer.ts         # Crawls the website and detects interactive elements
    │   ├── pom-generator.ts    # Generates Page Object Model (POM) classes
    │   ├── test-generator.ts   # Generates test files based on POMs
    ├── pages/                  # Stores generated POM classes
    ├── tests/                  # Stores generated test files
    ├── scripts/                # Utility scripts for automation
    │   └── generate-all.ts     # Orchestrates crawling, POM, and test generation
    ├── [tsconfig.json](http://_vscodecontentref_/2)           # TypeScript configuration
    └── [package.json](http://_vscodecontentref_/3)            # Project dependencies

## **Setup Instructions**

### **1. Install Dependencies**

Run the following commands to set up the project:

    mkdir playwright-test-project && cd playwright-test-project
    npm init -y
    npm install --save-dev @playwright/test typescript ts-node
    npx tsc --init  # Update "module" to "ESNext" in [tsconfig.json](http://_vscodecontentref_/4)
    mkdir -p {crawler,pages,tests,scripts}

### **2. Configure Environment Variables**

Create a `.env` file in the root of your project to specify the target URL and POM base name:

```
BASE_URL=https://www.lambdatest.com/selenium-playground/input-form-demo
POM_NAME=form
```

- `BASE_URL`: The URL of the page you want to crawl and generate the POM for.
- `POM_NAME`: The base name for the generated POM and test files (e.g., `form` will generate `form.page.ts` and `form.spec.ts`).

> **Note:** The scripts will automatically load these values from `.env` when generating POMs and tests.

## **Core Files**

### **1. Crawler (`crawler/explorer.ts`)**

The crawler detects interactive elements on the target website, including specific fields like  `username`,  `password`, and  `login`  button.

### **2. POM Generator (`crawler/pom-generator.ts`)**

Generates a Playwright Page Object Model (POM) class based on the detected elements.

## **How to Run**

1.  **Generate POM and Tests**:
```
npx ts-node scripts/generate-all.ts
```

2.  **Run Tests**:
```
npx playwright test
```

## **Key Features**

-   **Smart Selector Priority**: Prioritizes  `data-testid`,  `id`, and  `name`  attributes.
-   **Type-Safe Locators**: Ensures type safety for Playwright locators.
-   **Reusable POMs**: Automatically generates reusable Page Object Model classes.
-   **Ready-to-Run Tests**: Generates test files for immediate execution.