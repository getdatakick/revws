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
npm install;
```

## Build process

To build ```revws``` module execute following command:

```
gulp release
```

This will generate file ```rewvs-x_x_x.zip``` in ```build``` directory. This is a valid prestashop module.

## Development process

If you want to modify react.js app, building module after each change would take too much time. It's better if you follow this process:

1. execute command ```gulp``` - this will build react app, and created dev server running on localhost, port 8080
2. this dev server hosts two javascript files http://localhost:8080/front_app.js and http://localhost:8080/back_app.js . When you change
source code, these files are automatically recompiled.
3. now we need to ask ```revws``` module to use javascript files from our dev server, instead of files that comes with module. To do so, we need to enter two entries to ```PREFIX_configuration``` table. Use following sql (replace PREFIX with your database prefix):

```
INSERT INTO PREFIX_configuration(name, value, date_add, date_upd) VALUES
('REVWS_APP_URL', 'http://localhost:8080/front_app.js', now(), now()),
('REVWS_BACK_APP_URL', 'http://localhost:8080/back_app.js', now(), now());
```

That's it. You can now change javascript code, and immediately test it in the module.
