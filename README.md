# zzAPI CLI

zzAPI (prounounced like pizza, the syllables interchanged) is an HTTP (REST) API documentation and testing tool, a very simplified version of Postman. [See zzAPI core](https://github.com/agrostar/zzapi/) to learn about the zzAPI file formats (`.zzb` and `.zzv` files) and philosophy.

This CLI makes it easy to test API requests in zzAPI bundles. 

### Installation
Currently, the CLI is still in the testing phase, and has not been deployed as a node module. If you wish to try it out, you may enter the following:
```bash
npm i
npm run build
npm i -g
```

### Usage

```bash
zzapi-cli [options] <path-to-bundle>
```
The CLI takes one argument, the path to the zzAPI bundle. 

It accepts the following options:
- `-v` or `--version` shows the current version
- `-r <req>` or `--req <req>` allows you to run a particular request, instead of all of the requests, in the bundle
- `-e <env>` or `--env <env>` lets you choose an environment
- `--expand` shows the body output of the request in the terminal
- `-h` or `--help` displays help for the command

A sample bundle you may test it on [can be found in the zzapi repo](https://github.com/agrostar/zzapi/blob/e3bf60833009f1c51f4a7e0233b65a0dd8116a29/examples/tests-bundle.zzb). 

__Note__ the CLI returns the number of requests that failed in the execution of the API requests, to aid in testing. 