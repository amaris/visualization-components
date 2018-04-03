# visualization-components
This project contains a set of D3.js-based visualization components for data science. These components are designed to be easily reusable in any web project. They are developped in TypeScript, but users do not need the TypeScript source to integrate the component in their projets.

## Prerequisite

- nodejs v8.x
- npm v5.x
- tsc (``npm install typescript -g``)

Install the dependencies:

```bash
% npm install
```

## Developing and testing the project

In the project's root:

```bash
% npm start
```

Once started, any modification of a TypeScript file will automatically generate the corresponding JavaScript in the bundle file.

To test the components, just open the ``test/index.html`` file in a web browser.

See in the ``test/index.html`` file how the components are integrated in the page and use the same way in your projects.
