node ./dist/index.js ./.github/workflows/test\ bundles/tests-bundle.zzb --env default --req tests-negative-response;
if [ $? -ne 1 ]; then exit 1; fi
node ./dist/index.js ./.github/workflows/test\ bundles/tests-bundle.zzb --env default --req tests-negative-schema;
if [ $? -ne 1 ]; then exit 1; fi
