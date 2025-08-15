# Sprint sync demo

This is a small demo application for LLM assisted sprint baord






## Repo structure
This repository is structured as a monorepo
using [moon](https://moonrepo.dev/moon)
Applications are found under apps and libraries under packages folder.


## Setup
First you need to install [prototools](https://moonrepo.dev/docs/proto/install).
After that run `proto use` in the repo root to install required tools.
next we install node requirements via `pnpm install` at repo root.



### Dev server
To launch dev server with minimal hassle use
`moon frontend:dev` the server should be accessible from `localhost:3000`
However you will need to create a .env file in the apps/ai folder with your openapi key.
The template for the file is in the [.env.template](apps/ai/.env.template) file

Each application has its own README.md file.


### Loom recording
https://www.loom.com/share/f64ee6e485074f43a79be60f4fa3b5a5?sid=b6e8a2ea-3262-480e-aa28-db31c1195474