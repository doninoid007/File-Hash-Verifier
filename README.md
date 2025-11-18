# File Hash Integrity Checker

A web-based tool to verify file integrity by comparing cryptographic hashes. Users can either compare two files directly or compare a file against a known hash string, using algorithms like MD5, SHA-1, SHA-256, SHA-384 and SHA-512.

## How to Run Locally

This application is configured to run directly in the browser without requiring a build step or a local server.

1.  **Download:** Download all the project files and folders, preserving the directory structure.
2.  **Internet Connection:** Ensure you have an active internet connection, as the application relies on Content Delivery Networks (CDNs) for React, Tailwind CSS, and the Babel transpiler.
3.  **Open:** Open the `index.html` file in a modern web browser (e.g., Chrome, Firefox, Edge).

The application should now be running locally in your browser.

## Technical Notes

To provide a seamless local-first experience without a build process, this project uses **Babel Standalone**. This is a version of the Babel JavaScript compiler that runs directly in the browser.

-   When you open `index.html`, the Babel script transpiles all the TypeScript (`.ts`) and JSX (`.tsx`) code into plain JavaScript on-the-fly.
-   This allows you to work with modern React and TypeScript features while maintaining the simplicity of a static website.

While this approach is excellent for local use, demonstrations, and portability, a traditional build process (using a tool like Vite or Webpack) is recommended for production deployments to optimize for performance, bundle assets, and minify code.