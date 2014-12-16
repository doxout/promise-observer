lib/index.js: src/*.ts
	tsc src/references.d.ts src/index.ts  --noImplicitAny --nolib -d -m commonjs --outDir lib
	./node_modules/.bin/tsc-wrap-definition --input lib/index.d.ts --output d.ts/promise-observer.d.ts promise-observer
	rm lib/*.d.ts

clean:
	rm lib/*
