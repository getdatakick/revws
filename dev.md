# Documentation for developers

This repository is NOT a valid prestashop / thirtybees module. You need to compile
react javascript application, extract translations keys,...

## Development dependencies

- first, we need to install [nodejs](https://nodejs.org/) version 8.1.0 or higher.
- node comes with [npm](https://www.npmjs.com/) 5.5.1 or higher. Please verify by running ```npm --version```
- next, we need to install ```gulp``` npm package globally. To do so, run this command

```
npm install -g github:gulpjs/gulp#4.0
```

## Project dependencies

Before we build ```revws``` module, we need to install its dependencies. Simply execute following commands from ```src``` directory.
This needs to be done only once, or whenever new dependency is added to the project.

```
> cd src;
> npm install;
```

## Build process

To build ```revws``` module, go to ```src``` directory, and run

```
gulp release
```

This will generate file ```rewvs-1_x_x.zip``` in ```src/build``` directory. This is a valid prestashop module.
