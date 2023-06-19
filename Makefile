install:
	npm i

start-client:
	node --loader @swc-node/register/esm server/bin/devServer.ts

start-server:
	npx nodemon --watch 'server/*' \
	--exec 'node --loader @swc-node/register/esm' server/bin/server.ts

start:
	npx concurrently \
		"npx nodemon --watch 'server/*' --exec 'node --loader @swc-node/register/esm' server/bin/server.ts" \
		"node --loader @swc-node/register/esm server/bin/devServer.ts"

start-prod-server:
	NODE_ENV=production node dist/bin/server.js

build:
	rm -rf dist
	npx swc server -C jsc.target=es2022 -d dist
	npx vite build
	npx vite build --outDir dist/public/server --ssr client/main/entry-server.tsx

lint:
	npx eslint .
	npx tsc
