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