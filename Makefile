lib/index.js: src/*.ts
	tsc src/references.d.ts src/index.ts  --noImplicitAny --nolib -d -m commonjs --outDir lib
	tsc-wrap-definition promise-observer < lib/index.d.ts > d.ts/promise-observer.d.ts
	rm lib/*.d.ts

clean:
	rm lib/*
