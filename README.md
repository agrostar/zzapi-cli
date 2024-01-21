# zzAPI CLI

zzAPI (prounounced like pizza, the syllables interchanged) is an HTTP (REST) API documentation and testing tool, a very simplified version of Postman. [See zzAPI core](https://github.com/agrostar/zzapi/) to learn about the zzAPI file formats (`.zzb` and `.zzv` files) and philosophy.

This CLI makes it easy to test API requests in zzAPI bundles. You can create and manually test API requests using [the zzAPI VSCode extension](https://marketplace.visualstudio.com/items?itemName=AgroStar.zzapi). To integrate the testing process into your CI/CD, you can use this module.

### Installation

```bash
npm i -g zzapi-cli
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

A sample bundle you may test it on [can be found in the zzapi repo](https://github.com/agrostar/zzapi/blob/e3bf60833009f1c51f4a7e0233b65a0dd8116a29/examples/tests-bundle.zzb) (containing the zzapi node module). 

__Note__ the CLI returns the number of requests that failed in the execution of the API requests, to aid in testing. 

For more robust API testing features with a simple GUI, [check out the zzAPI VSCode extension](https://marketplace.visualstudio.com/items?itemName=AgroStar.zzapi)!
