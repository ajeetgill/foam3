<flow name="Tools" category="DOC/GUIDE" spid="foam" description="One-page list of FOAM3's developer tools: what each one is for and the command that runs it, with a link to its full guide." keywords="tools,lsp,mcp,live reload,debugging,testing,skills,knowledge"/>

# Tools

The developer tools that come with foam3. Each entry says what the tool is for and how to start it, and links to its full guide. Every command runs from an app's root folder, the one that holds `foam3/`.

## Editor and agent support

**Language server (LSP and MCP).** Completion, hover, go to definition, find references and warnings for `foam.CLASS` files and `.jrl` journals, in your editor or in a coding agent. Guide: [LSP](LSP.md).

```bash
./build.sh lsp-install               # asks which editors and agents to set up
node foam3/tools/lsp-start.js        # any other LSP client, over stdio
```

**Agent skills.** Instructions for coding agents, written once in `foam3/.claude/skills/` and picked up by every app that uses foam3. Each skill covers one job:

- `foam-model-builder`, `foam-view-builder`, `foam-feature-wiring`: write models, views, and the wiring between them
- `foam-design-patterns`: the patterns to follow before changing any FOAM code
- `foam-test-builder`, `foam-benchmark-builder`: write and run tests and timings
- `foam-screenshot-builder`: before and after screenshots of a UI change
- `browser-script`: scripts for the browser console of a running app
- `i18n`: find and fix text that can't be translated

How apps pick them up: `foam3/.claude/skills/README.md`.

## Running and debugging

**Live reload.** Save a `.js` file and the open page updates without a reload. Guide: [LiveReload](LiveReload.md).

```bash
./build.sh -l
```

**Debugging.** Chrome DevTools for the browser side, and a Java debugger on port 8000 for the server. Guide: [Debugging](Debugging.md). To count how many instances of a class were created, or which classes were used at all, see [DebuggingCountAndUsed](DebuggingCountAndUsed.md).

```bash
./build.sh -d
```

**Tests.** Guide: [Testing](Testing.md).

```bash
./build.sh run-tests                 # every client and server test
./build.sh run-tests:MyTest,OtherTest
node foam3/tools/tests/testFoamLSP.js
```

## Building

**Build.** `./build.sh` drives the whole build. Guide: [Build](Build.md), and [POM](POM.md) for the `pom.js` files it reads. `./build.sh --help` lists every flag.
