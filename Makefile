lib/index.js: src/*.ts
	tsc src/references.d.ts src/index.ts  --noImplicitAny --nolib -d -m commonjs --outDir lib

clean:
	rm lib/*
