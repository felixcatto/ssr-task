install:
	npm i

start-client:
	npx vite dev

start-server:
	npx nodemon --watch 'server/*' \
	--exec 'node --loader @swc-node/register/esm' server/bin/server.ts

start:
	npx concurrently \
		"npx vite dev" \
		"npx nodemon --watch 'server/*' --exec 'node --loader @swc-node/register/esm' server/bin/server.ts"

start-prod-server:
	NODE_ENV=production node dist/bin/server.js

build:
	rm -rf dist
	npx swc server -C jsc.target=es2022 -d dist
	npx vite build

lint:
	npx eslint .
	npx tsc
